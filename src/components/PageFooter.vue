<script setup lang="ts">
  import { RouterLink } from 'vue-router'
</script>

<template>
  <footer>
    <div class="footer">
      <div class="footer-column">
        <RouterLink to="/">О сайте</RouterLink>
        <RouterLink to="/app" variant="text">Приложение</RouterLink>
      </div>

      <div class="footer-column">
        2025 AI Fork.
      </div>
      <strong>Проект выполнен в рамках хакатона для AI learning week 2025</strong>
    </div>
  </footer>
</template>

<style scoped>
footer {
  padding: 20px 30px;
  background-color: rgb(var(--v-theme-primary-darken-1));
  color: rgb(var(--v-theme-on-surface-variant));
}

.footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;

  @media (width <= 600px) {
    grid-template-columns: 1fr;
    gap: 25px;
  }
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

footer :deep(a) {
  color: #bebebe;
  text-decoration: none;
  font-size: 14px;
}

</style>
