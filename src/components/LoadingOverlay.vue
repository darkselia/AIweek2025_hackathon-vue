<script setup lang="ts">
  const isLoading = defineModel<boolean>({ required: true })
  defineProps<{
    task?: string
  }>()
</script>

<template>
  <v-overlay class="import-overlay" :model-value="isLoading" persistent>
    <div class="import-overlay-content rounded-lg">
      <v-progress-circular color="primary" indeterminate size="64" width="10" />
      <div class="import-overlay-text">
        Выполняется {{ task || 'операция' }}...
        <br>
        Пожалуйста, не закрывайте страницу и не обновляйте её.
        <br>
        Это может занять некоторое время.
      </div>
    </div>
  </v-overlay>
</template>

<style scoped>
.import-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.import-overlay-content {
  width: 100%;
  max-width: 800px;
  background: rgb(var(--v-theme-surface));
  padding: 50px 80px;
  text-align: center;
}

.import-overlay-text {
  margin-top: 24px;
  font-size: 20px;
  color: black;
  text-align: center;
}

.import-overlay-content :deep(.v-progress-circular__overlay) {
  animation:
    progress-circular-dash 4s ease-in-out infinite,
    progress-circular-rotate 4s linear infinite;
}

@media (width <= 800px) {
  .import-overlay-content {
    padding: 30px 30px;
  }
}
</style>
