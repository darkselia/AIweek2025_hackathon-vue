<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { get } from '@/utils.ts'

  // Опции выбора классов
  type DamageClassKey = 'all' | 'crazing' | 'inclusion' | 'patches' | 'pitted_surface' | 'rolled_in_scale' | 'scratches'

  const damageClassOptions: Array<{ label: string, value: DamageClassKey }> = [
    { label: 'Все', value: 'all' },
    { label: 'Трещины (crazing)', value: 'crazing' },
    { label: 'Включения (inclusion)', value: 'inclusion' },
    { label: 'Бляшки (patches)', value: 'patches' },
    { label: 'Каверны (pitted surface)', value: 'pitted_surface' },
    { label: 'Окалины (rolled-in scale)', value: 'rolled_in_scale' },
    { label: 'Царапины (scratches)', value: 'scratches' },
  ]

  const selectedClass = ref<DamageClassKey>('all')
  const isLoading = ref(false)
  const errorMsg = ref('')

  // Данные графика
  const labels = ref<string[]>([])
  const dataPoints = ref<number[]>([])

  // Данные для вспомогательных графиков
  const barLabels = ref<string[]>([])
  const barData = ref<number[]>([])
  const doughnutLabels = ref<string[]>([])
  const doughnutData = ref<number[]>([])

  // Данные для круговой диаграммы по категориям
  const categoryLabels = ref<string[]>([])
  const categoryData = ref<number[]>([])

  // График-изображение, получаемый с сервера по выбранному классу
  const graphImageUrl = ref<string | null>(null)

  // Утилиты
  async function handleJsonResponse<T> (res: Response, errorMessage: string, fallback: T): Promise<T> {
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(t || errorMessage)
    }
    return await res.json().catch(() => fallback)
  }

  function normalizeDailyMetrics (json: Array<{ date: string, count: number }>) {
    type MetricsItem = { date: string, count: number }
    const arr = (json as MetricsItem[])
      .filter(item => typeof item?.date === 'string' && typeof item?.count === 'number')
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    labels.value = arr.map(i => i.date)
    dataPoints.value = arr.map(i => i.count)
  }

  function buildWeekDistribution () {
    const weekNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    const totals = new Map<string, number>(weekNames.map(n => [n, 0]))
    for (let i = 0; i < labels.value.length; i++) {
      const d = new Date(labels.value[i])
      const name = weekNames[d.getDay()] // 0..6, где 0 — Вс
      totals.set(name, (totals.get(name) ?? 0) + (dataPoints.value[i] ?? 0))
    }
    doughnutLabels.value = Array.from(totals.keys())
    doughnutData.value = Array.from(totals.values())
  }

  // Загрузка: работники
  async function fetchWorkersMetrics () {
    try {
      const res = await get('/api/metrics/workers')
      const json = await handleJsonResponse(res, 'Ошибка получения метрик по работникам', []) as Array<{
        name: string
        count: number
      }>
      const filtered = json.filter(i => typeof i?.name === 'string' && typeof i?.count === 'number')
      barLabels.value = filtered.map(i => i.name)
      barData.value = filtered.map(i => i.count)
    } catch {
      barLabels.value = []
      barData.value = []
    }
  }

  // Загрузка: категории (общая сводка)
  async function fetchCategoryMetrics () {
    try {
      const res = await get('/api/metrics/categories')
      const json = await handleJsonResponse(res, 'Ошибка получения распределения по категориям', {}) as Record<string, number>
      const entries = Object.entries(json).filter(([k, v]) => typeof k === 'string' && typeof v === 'number')
      categoryLabels.value = entries.map(([k]) => k)
      categoryData.value = entries.map(([, v]) => v)
    } catch {
      categoryLabels.value = []
      categoryData.value = []
    }
  }

  // Загрузка: ежедневные метрики (зависят от класса)
  async function fetchMetrics (cls: DamageClassKey) {
    isLoading.value = true
    errorMsg.value = ''
    try {
      const params: Record<string, unknown> = {}
      if (cls && cls !== 'all') params.class = cls
      const res = await get('/api/metrics', params)
      const json = await handleJsonResponse(res, 'Ошибка получения метрик', []) as Array<{ date: string, count: number }>
      normalizeDailyMetrics(json)
      buildWeekDistribution()
    } catch (error: any) {
      errorMsg.value = error?.message || 'Неизвестная ошибка'
      labels.value = []
      dataPoints.value = []
      doughnutLabels.value = []
      doughnutData.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGraphImage (cls: DamageClassKey) {
    try {
      // очищаем предыдущий URL, если был
      if (graphImageUrl.value) {
        URL.revokeObjectURL(graphImageUrl.value)
        graphImageUrl.value = null
      }
      const params: Record<string, unknown> = {}
      if (cls && cls !== 'all') params.class = cls
      const res = await get('/api/metrics/graph', params)
      const contentType = res.headers.get('content-type') ?? ''
      if (!res.ok) {
        const t = await res.text().catch(() => '')
        throw new Error(t || 'Ошибка получения графика-изображения')
      }
      if (contentType.startsWith('image/')) {
        const blob = await res.blob()
        graphImageUrl.value = URL.createObjectURL(blob)
      } else {
        // Попытка интерпретировать как бинарные данные
        const blob = await res.blob().catch(() => null)
        if (blob) {
          graphImageUrl.value = URL.createObjectURL(blob)
        }
      }
    } catch {
      graphImageUrl.value = null
    }
  }

  onMounted(async () => {
    await Promise.all([
      fetchMetrics(selectedClass.value),
      fetchCategoryMetrics(),
      fetchWorkersMetrics(),
      fetchGraphImage(selectedClass.value),
    ])
  })

  watch(selectedClass, cls => {
    fetchMetrics(cls)
    fetchGraphImage(cls)
  })
</script>

<template>
  <v-container class="metrics" fluid>
    <div class="header">
      <h1 class="title">Статистика повреждений</h1>
      <p class="subtitle">Выберите класс повреждений для отображения динамики по дням.</p>
    </div>

    <div class="controls">
      <v-combobox
        v-model="selectedClass"
        class="combobox"
        clearable
        density="comfortable"
        item-title="label"
        item-value="value"
        :items="damageClassOptions"
        label="Класс повреждений"
        :return-object="false"
        variant="outlined"
      />
      <div class="status">
        <v-chip v-if="isLoading" color="primary" label>Загрузка…</v-chip>
        <v-chip v-else-if="errorMsg" color="error" label>{{ errorMsg }}</v-chip>
        <v-chip v-else color="success" label>Готово</v-chip>
      </div>
    </div>

    <div class="grid">
      <v-card class="card">
        <div class="chart">
          <LineChart :data="dataPoints" :labels="labels" title="Статистика повреждений по дням" />
        </div>
      </v-card>

      <v-card class="card">
        <div class="chart image-chart">
          <template v-if="graphImageUrl">
            <img alt="График по выбранному классу" class="chart-image" :src="graphImageUrl">
          </template>
          <template v-else>
            <div class="image-placeholder">
              <span class="image-placeholder-title">График недоступен</span>
              <span class="image-placeholder-sub">Попробуйте выбрать другой класс или обновить страницу</span>
            </div>
          </template>
        </div>
      </v-card>

      <v-card class="card">
        <div class="chart">
          <BarChart :data="barData" :labels="barLabels" title="Количество по сотрудникам" />
        </div>
      </v-card>

      <v-card class="card">
        <div class="chart">
          <DoughnutChart :data="categoryData" :labels="categoryLabels" title="Распределение по категориям" />
        </div>
      </v-card>

    </div>
  </v-container>
</template>

<style scoped>
.metrics {
  padding-bottom: 32px;
}

.header {
  text-align: center;
  margin-bottom: 16px;
}

.title {
  font-size: 32px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-background));
}

.subtitle {
  margin-top: 6px;
  font-size: 16px;
  color: rgba(var(--v-theme-on-background), 0.7);
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
  margin: 12px 0 20px;
}

.combobox {
  min-width: 320px;
}

.status {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
}

.card {
  padding: 12px;
}

.chart {
  position: relative;
  height: 420px;
}

.image-chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.image-placeholder {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(var(--v-theme-on-background), 0.6);
}

.image-placeholder-title {
  font-weight: 700;
  color: rgb(var(--v-theme-on-background));
}

.image-placeholder-sub {
  font-size: 14px;
}
</style>
