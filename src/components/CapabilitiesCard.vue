<script lang="ts" setup>
  defineProps<{
    icon: string
    title: string
  }>()
</script>

<template>
  <div class="card rounded-lg">
    <v-icon :icon size="48px" />
    <p class="title">{{ title }}</p>
    <p class="description">
      <slot />
    </p>
  </div>
</template>

<style scoped>
.card {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  gap: 30px;
  text-align: center;
  align-items: stretch;
  color: rgb(var(--v-theme-primary));
  padding: 20px 20px 30px 20px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-surface-bright));
  font-size: 20px;
}

.title {
  border-bottom: 2px solid rgb(var(--v-theme-surface-bright));
  display: flex;
  align-items: center;
  justify-content: center;
}

.description {
  grid-column: 1 / span 2;
  color: black;
}

@media (max-width: 800px) {
  .card {
    font-size: 16px;
  }
}
</style>
