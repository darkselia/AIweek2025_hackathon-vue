<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { VDateInput } from 'vuetify/labs/VDateInput'
  import { get } from '@/utils'

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

  const labels = ref<string[]>([])
  const dataPoints = ref<number[]>([])

  const barLabels = ref<string[]>([])
  const barData = ref<number[]>([])
  const doughnutLabels = ref<string[]>([])
  const doughnutData = ref<number[]>([])

  const categoryLabels = ref<string[]>([])
  const categoryData = ref<number[]>([])

  const graphImageUrl = ref<string | null>(null)

  async function handleJsonResponse<T> (res: Response, errorMessage: string, fallback: T): Promise<T> {
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(t || errorMessage)
    }
    return await res.json().catch(() => fallback)
  }

  function normalizeDailyMetrics (json: Array<{ date: string, count: number }>) {
    const arr = (json ?? [])
      .filter((item: {
        date: unknown
        count: unknown
      }) => typeof item?.date === 'string' && typeof item?.count === 'number')
    const sorted = [...arr].sort((a: { date: string, count: number }, b: {
      date: string
      count: number
    }) => new Date(a.date).getTime() - new Date(b.date).getTime())
    labels.value = sorted.map((i: { date: string, count: number }) => i.date)
    dataPoints.value = sorted.map((i: { date: string, count: number }) => i.count)
  }

  const weekNames: string[] = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const getWeekName = (idx: number): string => String(weekNames[idx] ?? 'Вс')

  function buildWeekDistribution () {
    const totals = new Map<string, number>(weekNames.map((n: string) => [n, 0]))
    const len = Math.min(labels.value.length, dataPoints.value.length)
    for (let i = 0; i < len; i++) {
      const raw: string = labels.value[i] ?? ''
      const ts: number = Date.parse(raw)
      const d: Date = Number.isFinite(ts) ? new Date(ts) : new Date()
      const idx: number = d.getDay()
      const name: string = getWeekName(idx)
      const prev: number = totals.get(name) ?? 0
      totals.set(name, prev + (dataPoints.value[i] ?? 0))
    }
    doughnutLabels.value = Array.from(totals.keys())
    doughnutData.value = Array.from(totals.values())
  }

  async function fetchWorkersMetrics () {
    try {
      const res = await get('/api/metrics/workers')
      const json = await handleJsonResponse(res, 'Ошибка получения метрик по работникам', []) as Array<{
        name: string
        count: number
      }>
      const filtered = json.filter((i: {
        name: unknown
        count: unknown
      }) => typeof i?.name === 'string' && typeof i?.count === 'number')
      barLabels.value = filtered.map((i: { name: string, count: number }) => i.name)
      barData.value = filtered.map((i: { name: string, count: number }) => i.count)
    } catch {
      barLabels.value = []
      barData.value = []
    }
  }

  async function fetchCategoryMetrics () {
    try {
      const res = await get('/api/metrics/categories')
      const json = await handleJsonResponse(res, 'Ошибка получения распределения по категориям', {}) as Record<string, number>
      const entries: Array<[string, number]> = Object.entries(json)
      const sorted = [...entries].sort((a: [string, number], b: [string, number]) => a[0].localeCompare(b[0], 'ru', { sensitivity: 'base' }))
      categoryLabels.value = sorted.map(([k]) => k)
      categoryData.value = sorted.map(([, v]) => v)
    } catch {
      categoryLabels.value = []
      categoryData.value = []
    }
  }

  function formatDateISO (d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const today = new Date()
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)
  const startDate = ref<string>(formatDateISO(oneYearAgo))
  const endDate = ref<string>(formatDateISO(today))

  async function fetchMetrics (cls: DamageClassKey) {
    isLoading.value = true
    errorMsg.value = ''
    try {
      const params: Record<string, unknown> = {}
      if (cls && cls !== 'all') params.class = cls

      const toISO = (val: unknown): string | undefined => {
        if (!val) return undefined
        if (typeof val === 'string') {
          const s = val.trim()
          if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
          const ts = Date.parse(s)
          if (!Number.isFinite(ts)) return undefined
          return formatDateISO(new Date(ts))
        }
        if (val instanceof Date) {
          if (Number.isNaN(val.getTime())) return undefined
          return formatDateISO(val)
        }
        return undefined
      }

      const ds = toISO(startDate.value)
      const de = toISO(endDate.value)
      if (ds) params.date_start = ds
      if (de) params.date_end = de

      const res = await get('/api/metrics', params)
      const json = await handleJsonResponse(res, 'Ошибка получения метрик', []) as Array<{
        date: string
        count: number
      }>
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
      if (graphImageUrl.value) {
        URL.revokeObjectURL(graphImageUrl.value)
        graphImageUrl.value = null
      }
      const params: Record<string, unknown> = {}
      if (cls && cls !== 'all') params.class = cls
      const res = await get('/api/metrics/graph', params)
      if (!res.ok) {
        const t = await res.text().catch(() => '')
        errorMsg.value = t || 'Ошибка получения графика-изображения'
        graphImageUrl.value = null
        return
      }
      const blob = await res.blob().catch(() => null)
      graphImageUrl.value = blob ? URL.createObjectURL(blob) : null
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

  watch([startDate, endDate], () => {
    fetchMetrics(selectedClass.value)
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
        <div class="line-controls">
          <VDateInput
            v-model="startDate"
            class="date-input"
            density="comfortable"
            :format="(d: any) => (typeof d === 'string' ? d : d?.toISOString?.().slice(0,10) ?? '')"
            hide-details
            label="Начальная дата"
            variant="outlined"
          />
          <VDateInput
            v-model="endDate"
            class="date-input"
            density="comfortable"
            :format="(d: any) => (typeof d === 'string' ? d : d?.toISOString?.().slice(0,10) ?? '')"
            hide-details
            label="Конечная дата"
            variant="outlined"
          />
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
  margin: 32px auto;
  max-width: 1200px;
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
  flex-wrap: wrap;
}

.combobox {
  min-width: 320px;
}

.date-input {
  min-width: 200px;
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

.line-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
</style>
