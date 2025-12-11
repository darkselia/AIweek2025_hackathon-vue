<script setup lang="ts">
  import { onBeforeUnmount, ref } from 'vue'
  import { damageClassRuMap } from '@/lib/translations'
  import { post } from '@/utils.ts'

  const selectedImage = ref<File | null>(null)
  const isDragging = ref(false)
  const isProcessing = ref(false)
  const previewUrl = ref<string | null>(null)
  const resultUrl = ref<string | null>(null)
  const resultText = ref<string>('')
  const resultItems = ref<Array<{ box_id: string, klass: string, confidence: string }>>([])

  function revoke (urlRef: { value: string | null }) {
    if (urlRef.value) {
      URL.revokeObjectURL(urlRef.value)
      urlRef.value = null
    }
  }

  function onFileSelected (files: File[] | File | null) {
    const selected = Array.isArray(files) ? files[0] ?? null : files
    revoke(previewUrl)
    revoke(resultUrl)
    selectedImage.value = selected
    if (selected) {
      previewUrl.value = URL.createObjectURL(selected)
    }
  }

  function handleImageUpload (files: File[] | File | null) {
    const file = Array.isArray(files) ? files[0] ?? null : files
    if (file) {
      onFileSelected(file)
    }
  }

  function handleDragOver (e: DragEvent) {
    e.preventDefault()
    isDragging.value = true
  }

  function handleDragLeave (e: DragEvent) {
    e.preventDefault()
    isDragging.value = false
  }

  function handleDrop (e: DragEvent) {
    e.preventDefault()
    isDragging.value = false
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onFileSelected(file)
    }
  }

  function clearImage () {
    revoke(previewUrl)
    revoke(resultUrl)
    selectedImage.value = null
    resultText.value = ''
  }

  async function handleProcess () {
    if (!selectedImage.value) return
    isProcessing.value = true
    resultText.value = ''
    revoke(resultUrl)

    try {
      const form = new FormData()
      form.append('file', selectedImage.value)

      const response = await post('/api/classify', form)
      const contentType = response.headers.get('content-type') ?? ''

      // Если пришёл JSON — пробуем извлечь image_data
      if (contentType.includes('application/json')) {
        const data = await response.json().catch(() => ({} as any))

        const texts = (data as any)?.texts
        // новый формат: массив объектов { box_id, klass, confidence }
        if (Array.isArray(texts) && texts.length > 0 && typeof texts[0] === 'object') {
          resultItems.value = texts.map((t: any) => ({
            box_id: String(t?.box_id ?? ''),
            klass: String(t?.klass ?? ''),
            confidence: String(t?.confidence ?? ''),
          }))
          resultText.value = ''
        } else if (Array.isArray(texts)) {
          resultText.value = texts.join('\n')
          resultItems.value = []
        } else if (typeof texts === 'string') {
          resultText.value = texts
          resultItems.value = []
        }
        if (data && data.image_data) {
          const base64 = data.image_data as string
          const mime = (data.content_type as string) || 'image/jpeg'

          const binary = atob(base64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.codePointAt(i) ?? 0
          }
          const blob = new Blob([bytes], { type: mime })
          resultUrl.value = URL.createObjectURL(blob)
          return
        }

        alert(data?.message ?? 'Успешно, но без изображения')
        return
      }

      // Если сервер вернул бинарное изображение напрямую
      if (contentType.startsWith('image/')) {
        const blob = await response.blob()
        resultUrl.value = URL.createObjectURL(blob)
        return
      }

      // Обработка ошибок
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        alert(text || 'Ошибка обработки изображения')
        return
      }

      // Фолбэк: пробуем как бинарный ответ
      const blob = await response.blob().catch(() => null)
      if (blob) {
        resultUrl.value = URL.createObjectURL(blob)
      } else {
        const text = await response.text().catch(() => '')
        alert(text || 'Готово')
      }
    } catch {
      alert('Произошла ошибка во время импорта данных, попробуйте еще раз')
    } finally {
      isProcessing.value = false
    }
  }

  onBeforeUnmount(() => {
    revoke(previewUrl)
    revoke(resultUrl)
  })
</script>

<template>
  <LoadingOverlay v-model="isProcessing" task="классификация изображения" />
  <v-container class="app2-container" fluid>
    <div class="app2-header">
      <h1 class="app2-title">Классификация дефектов на производстве</h1>
      <p class="app2-subtitle">Загрузите изображение и получите результат классификации с визуализацией.</p>
    </div>

    <!-- Строка 1: 1.1 исходное + загрузка, 1.2 кнопка обработки, 1.3 обработанное изображение -->
    <div class="grid-top">
      <!-- 1.1 -->
      <div class="cell cell-1-1">
        <div class="section-block">
          <div class="section-header">
            <span class="step-badge">1</span>
            <h3 class="section-title">Изображение</h3>
            <v-btn
              v-if="selectedImage"
              class="clear-btn"
              color="error"
              density="comfortable"
              variant="text"
              @click="clearImage"
            >Очистить
            </v-btn>
          </div>

          <v-card
            class="upload-card"
            :class="{ 'upload-card--drag': isDragging, 'upload-card--filled': !!selectedImage }"
            @dragleave="handleDragLeave"
            @dragover="handleDragOver"
            @drop="handleDrop"
          >
            <transition mode="out-in" name="fade">
              <div v-if="selectedImage" class="preview-wrapper">
                <img alt="Превью" class="preview-image" :src="previewUrl ?? ''">
                <div class="preview-overlay">
                  <p>Перетащите новое изображение, чтобы заменить</p>
                </div>
              </div>
              <div v-else class="upload-wrapper">
                <v-file-input
                  accept="image/*"
                  class="file-input"
                  hide-details
                  label="Выбрать файл"
                  prepend-icon="mdi-upload"
                  variant="outlined"
                  @update:model-value="handleImageUpload"
                />
                <p class="hint">Перетащите файл сюда или нажмите, чтобы выбрать.</p>
              </div>
            </transition>
          </v-card>
        </div>
      </div>

      <!-- 1.2 -->
      <div class="cell cell-1-2 process-col">
        <div class="process-center-inline">
          <v-btn
            class="process-btn"
            color="primary"
            :disabled="!selectedImage || isProcessing"
            elevation="8"
            size="x-large"
            @click="handleProcess"
          >
            <v-progress-circular v-if="isProcessing" color="white" indeterminate size="28" />
            <span v-else class="process-icon">▶</span>
          </v-btn>
          <div class="process-label">Обработать</div>
        </div>
      </div>

      <!-- 1.3 -->
      <div class="cell cell-1-3">
        <div class="section-block">
          <div class="section-header">
            <span class="step-badge step-badge--primary">2</span>
            <h3 class="section-title">Результат</h3>
          </div>
          <v-card class="result-card">
            <transition mode="out-in" name="fade">
              <div v-if="resultUrl" class="result-wrapper">
                <img alt="Результат" class="result-image" :src="resultUrl">
                <!--                <div class="status-chip">-->
                <!--                  <span class="dot" />-->
                <!--                  Анализ завершён-->
                <!--                </div>-->
              </div>
              <div v-else class="result-placeholder">
                <p class="placeholder-title">Ожидание обработки</p>
                <p class="placeholder-sub">Здесь появится обработанное изображение</p>
              </div>
            </transition>
          </v-card>
        </div>
      </div>
    </div>

    <!-- Строка 2: 2.1-2 текст из ответа, 2.3 метрики -->
    <transition name="fade">
      <div v-if="resultText || resultUrl || (resultItems && resultItems.length > 0)" class="grid-bottom">
        <!-- 2.1-2: текст, занимает две колонки -->
        <div class="cell cell-2-1 text-block">
          <v-card class="text-card">
            <div class="text-header">
              <span class="text-icon" />
              <h3 class="text-title">Результат классификации</h3>
            </div>
            <div v-if="resultItems && resultItems.length > 0">
              <ClassificationResultTable :items="resultItems" :klass-map="damageClassRuMap" />
            </div>
            <p v-else class="text-content">{{ resultText }}</p>
          </v-card>
        </div>

        <!-- 2.3: метрики -->
        <div class="cell cell-2-3">
          <v-card class="metrics-card">
            <h4 class="metrics-title">Метрики</h4>
            <div class="metric-row">
              <span class="metric-label">Статус</span>
              <span class="metric-value" :class="resultUrl ? 'metric-value--ok' : 'metric-value--none'">{{
                resultUrl ? 'Готово' : 'Нет данных'
              }}</span>
            </div>
            <div class="metrics-actions">
              <v-btn class="metrics-btn" :disabled="!resultText" variant="outlined">Показать сырые данные</v-btn>
            </div>
          </v-card>
        </div>
      </div>
    </transition>
  </v-container>
</template>

<style scoped>
.app2-container {
  margin: 32px auto;
  max-width: 1200px;
}

.app2-header {
  text-align: center;
  margin-bottom: 24px;
}

.app2-title {
  font-size: 40px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-background));
}

.app2-subtitle {
  margin: 8px auto 0;
  font-size: 18px;
  color: rgba(var(--v-theme-on-background), 0.7);
  max-width: 720px;
}

.grid-top {
  display: grid;
  grid-template-columns: 5fr 1fr 5fr;
  gap: 24px;
  align-items: stretch;
  margin: 40px;
}

.cell {
  height: 100%;
}

.grid-bottom {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 24px;
  margin: 16px 40px;;
}

.cell-2-1 {
  grid-column: 1 / 2;
}

.cell-2-3 {
  grid-column: 2 / 3;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-badge {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(var(--v-theme-surface), 1);
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 12px;
  font-weight: 700;
}

.step-badge--primary {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.section-title {
  font-weight: 700;
}

.clear-btn {
  margin-left: auto;
}

.upload-card,
.result-card {
  flex: 1 1 auto;
  min-height: 0;
}

.upload-card {
  position: relative;
  overflow: hidden;
  border: 2px dashed rgba(var(--v-theme-outline), 0.4);
  min-height: 200px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-card--drag {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.upload-card--filled {
  border-style: solid;
  border-color: transparent;
  padding: 0;
}

.preview-wrapper {
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-height: 300px;
  max-width: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 0 16px;
  color: white;
  font-weight: 600;
  transition: opacity .25s ease;
}

.preview-wrapper:hover .preview-overlay {
  opacity: 1;
}

.upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  gap: 12px;
}

.hint {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 13px;
}

.result-card {
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  gap: 12px;
}

.result-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.result-placeholder {
.status-chip {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(var(--v-theme-surface), 0.9);
  backdrop-filter: saturate(180%) blur(4px);
  border: 1px solid rgba(var(--v-theme-outline), 0.5);
  color: rgba(var(--v-theme-on-surface), 0.9);
  padding: 6px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: rgb(var(--v-theme-primary));
  position: relative;
}

  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.placeholder-title {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.placeholder-sub {
  font-size: 14px;
}

.process-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.process-center-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.process-btn {
  width: 68px;
  height: 68px;
  border-radius: 9999px;
}

.process-icon {
  display: inline-block;
  transform: translateX(1px);
  font-size: 18px;
}

.process-label {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: .12em;
}

.text-card {
  padding: 16px;
}

.text-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.text-icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: rgb(var(--v-theme-primary));
  display: inline-block;
}

.text-title {
  font-size: 22px;
  font-weight: 800;
}

.text-content {
  white-space: pre-line;
  font-size: 18px;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.metrics-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metrics-title {
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.metric-label {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.metric-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-weight: 700;
}

.metric-value--ok {
  color: rgb(var(--v-theme-primary));
}

.metric-value--none {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.metrics-actions {
  padding-top: 4px;
}

.metrics-btn {
  width: 100%;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.result-table th,
.result-table td {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.3);
}

.result-table th {
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

/* Анимации переходов */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
