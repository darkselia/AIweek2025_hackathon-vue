<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { useDisplay } from 'vuetify'

  const { smAndUp } = useDisplay()
  const isMenuOpen = ref(false)

  onMounted(() => {
    setTimeout(() => {
      const mainElement = document.querySelector('.v-main')
      if (mainElement) {
        (mainElement as HTMLElement).style.paddingTop = '60px'
      }
    }, 0)
  })
</script>

<template>
  <v-navigation-drawer v-if="!smAndUp" v-model="isMenuOpen">
    <v-list-item title="AIFork" />
    <v-divider class="mb-2" color="rgb(var(--v-theme-primary-darken-1))" />
    <v-list-item href="/app" link title="Приложение" />
    <v-list-item href="/metrics" link title="Метрики" />
    <v-list-item href="/#Capabilities" link title="Возможности" />
  </v-navigation-drawer>

  <v-app-bar :class="{ 'app-bar': !smAndUp }">
    <v-app-bar-title>
      <div v-if="smAndUp" class="prepend">
        <router-link class="title" to="/app">
          <img alt="logo" class="icon" src="@/assets/logo.svg">
          <v-btn text="Приложение" variant="text" />
        </router-link>
        <v-btn href="/metrics" variant="text">Метрики</v-btn>
      </div>
      <div v-else class="text-center mr-4 mobile-title">AIFork</div>
    </v-app-bar-title>

    <template v-if="!smAndUp" #prepend>
      <v-btn icon="mdi-menu" @click="isMenuOpen = true" />
    </template>

    <template #append>
      <div class="container">
        <template v-if="smAndUp">
          <v-btn href="/#Capabilities" variant="text">Возможности</v-btn>
        </template>

      </div>
    </template>
  </v-app-bar>
</template>

<style scoped>
.title {
  color: black;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

.mobile-title {
  color: rgb(var(--v-theme-primary));
  font-weight: bold;
}

.prepend{
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 15px;
}

.app-bar {
  border-bottom: 2px solid rgb(var(--v-theme-primary));
  border-radius: 0 0 15px 15px;
}

.app-bar :deep(.v-toolbar__content) {
  height: 45px !important;
}

.container {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 100%;
  margin-right: 16px;
}

.info-button :deep(.v-btn__content) {
  font-size: 20px;
}

.icon {
  height: 60px;
}

</style>
