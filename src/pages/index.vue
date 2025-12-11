<script setup lang="ts">
  import { useDisplay } from 'vuetify'

  const { smAndDown } = useDisplay()
</script>

<template>
  <v-img class="main-img" cover src="@/assets/background.jpg">
    <div class="main-img-overlay">
      <h1 class="main-text main-header">Классификация дефектов <br> на производстве</h1>
      <p class="main-text describe">AI-система для автоматической классификации дефектов изделий по фотографиям</p>
      <v-btn to="/app" variant="elevated">Попробовать</v-btn>
    </div>
  </v-img>

  <section id="Capabilities" class="anchor-scroll">

    <h2 class="header">Основные возможности</h2>

    <v-carousel v-if="smAndDown" cycle height="330" :show-arrows="false">
      <v-carousel-item content-class="carousel-item">
        <CapabilitiesCard
          icon="mdi-assistant"
          title="Автоматическая классификация дефектов на основе ИИ"
        >
          Это ключевая функция системы, в основе которой лежит обученная нейронная сеть. Модель анализирует
          загруженное изображение изделия, выделяет визуальные аномалии и присваивает дефекту одну из предопределенных
          категорий.
        </CapabilitiesCard>
      </v-carousel-item>
      <v-carousel-item content-class="carousel-item">
        <CapabilitiesCard
          icon="mdi-compass-outline"
          title="Интуитивный веб-интерфейс для оператора"
        >
          Функция реализована как веб-приложение, доступное с планшета или компьютера на производственной линии.
          Интерфейс позволяет пользователю в несколько кликов загрузить фотографию изделия, запустить проверку и
          мгновенно получить результат с указанием типа дефекта и степенью уверенности модели.
        </CapabilitiesCard>
      </v-carousel-item>
      <v-carousel-item content-class="carousel-item">
        <CapabilitiesCard icon="mdi-checkbox-marked-outline" title="Оценка точности модели">
          Функция включает в себя внутренние механизмы валидации и мониторинга работы системы. Мы оценили модель на
          разнообразном тестовом наборе данных, включающем изображения с различным освещением и ракурсами, чтобы
          гарантировать ее точность
        </CapabilitiesCard>
      </v-carousel-item>
      <v-carousel-item content-class="carousel-item">
        <CapabilitiesCard icon="mdi-magnify" title="Анализ статистики брака">
          Данная функция предоставляет руководству и технологам наглядную аналитическую панель в реальном времени. Она автоматически визуализирует процентное соотношение различных типов дефектов, обнаруженных системой, на основе всей истории проверок.
        </CapabilitiesCard>
      </v-carousel-item>
    </v-carousel>

    <div v-else class="cap-container">
      <CapabilitiesCard
        icon="mdi-assistant"
        title="Автоматическая классификация дефектов на основе ИИ"
      >
        Это ключевая функция системы, в основе которой лежит обученная нейронная сеть. Модель анализирует загруженное
        изображение изделия, выделяет визуальные аномалии и присваивает дефекту одну из предопределенных категорий.
      </CapabilitiesCard>
      <CapabilitiesCard
        icon="mdi-compass-outline"
        title="Интуитивный веб-интерфейс для оператора"
      >
        Функция реализована как веб-приложение, доступное с планшета или компьютера на производственной линии.
        Интерфейс позволяет пользователю в несколько кликов загрузить фотографию изделия, запустить проверку и
        мгновенно получить результат с указанием типа дефекта и степенью уверенности модели.
      </CapabilitiesCard>
      <CapabilitiesCard icon="mdi-checkbox-marked-outline" title="Оценка точности модели">
        Функция включает в себя внутренние механизмы валидации и мониторинга работы системы. Мы оценили модель на
        разнообразном тестовом наборе данных, включающем изображения с различным освещением и ракурсами, чтобы
        гарантировать ее точность
      </CapabilitiesCard>
      <CapabilitiesCard icon="mdi-magnify" title="Анализ статистики брака">
        Данная функция предоставляет руководству и технологам наглядную аналитическую панель в реальном времени. Она автоматически визуализирует процентное соотношение различных типов дефектов, обнаруженных системой, на основе всей истории проверок.
      </CapabilitiesCard>
    </div>
  </section>
  <section>
    <h2 class="header">Будущие возможности</h2>

    <v-carousel v-if="smAndDown" cycle height="330" :show-arrows="false">
      <v-carousel-item content-class="carousel-item">
        <CapabilitiesCard
          icon="mdi-flip-horizontal"
          title="Сборка целого из частей с последующей детекцией"
        >
          Система автоматически «склеивает» (сшивает) общую картину из отдельных фотографий (кропов), сделанных с разных
          ракурсов, создавая целостное изображение объекта.
        </CapabilitiesCard>
      </v-carousel-item>
      <v-carousel-item content-class="carousel-item">
        <CapabilitiesCard
          icon="mdi-brain"
          title="Анализ причинно-следственных связей"
        >
          Модель, обученная на исторических данных, не только идентифицирует тип дефекта, но и с высокой вероятностью
          определяет конкретный этап технологического процесса, на котором была допущена ошибка.
        </CapabilitiesCard>
      </v-carousel-item>
    </v-carousel>

    <div v-else class="cap-container">
      <CapabilitiesCard
        icon="mdi-flip-horizontal"
        title="Сборка целого из частей с последующей детекцией"
      >
        Система автоматически «склеивает» (сшивает) общую картину из отдельных фотографий (кропов), сделанных с разных
        ракурсов, создавая целостное изображение объекта.
      </CapabilitiesCard>
      <CapabilitiesCard
        icon="mdi-brain"
        title="Анализ причинно-следственных связей"
      >
        Модель, обученная на исторических данных, не только идентифицирует тип дефекта, но и с высокой вероятностью
        определяет конкретный этап технологического процесса, на котором была допущена ошибка.
      </CapabilitiesCard>
    </div>
  </section>
  <PageFooter />
</template>

<style scoped>
section {
  padding-top: 60px;
  margin: 0 50px 80px;
  font-size: 22px;
}

.header,
.main-img-overlay {
  text-align: center;
}

.header {
  font-size: 40px;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 40px;
}

.anchor-scroll {
  scroll-margin-top: 64px;
}

.main-img {
  height: calc(100dvh - 64px);
}

.main-img-overlay {
  backdrop-filter: brightness(80%);
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-family: 'Roboto Condensed', sans-serif;
}

.main-text {
  --border-size: 2px;
  color: white;
  text-shadow: calc(-1 * var(--border-size)) calc(-1 * var(--border-size)) 0 rgb(var(--v-theme-primary)),
  var(--border-size) calc(-1 * var(--border-size)) 0 rgb(var(--v-theme-primary)),
  calc(-1 * var(--border-size)) var(--border-size) 0 rgb(var(--v-theme-primary)),
  var(--border-size) var(--border-size) 0 rgb(var(--v-theme-primary));
  font-weight: bold;
}

.main-header {
  font-size: 60px;
  text-transform: uppercase;
}

.describe {
  --border-size: 2px;
  font-size: 25px;
  width: 700px;
  max-width: 100%;
}

/* Unified grid styles used in multiple places */
.cap-container{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.team_photos > img {
  width: 100%;
}

/* Scoped deep selectors for AboutSiteCard children */
.team-img :deep(img) {
  object-fit: contain;
}

.team-img :deep(.img-border) {
  aspect-ratio: 1;
  height: 75%;
}

@media (max-width: 800px) {
  section {
    padding-top: 30px;
    margin: 0 20px 30px;
  }

  .header {
    font-size: 30px;
  }

  .main-header {
    font-size: 40px;
  }

  .describe {
    font-size: 20px;
  }

  .cap-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

</style>
