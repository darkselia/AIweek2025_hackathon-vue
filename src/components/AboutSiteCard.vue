<script lang="ts" setup>
  defineProps<{
    src: string
    mirrored?: boolean
  }>()
</script>

<template>
  <div class="container" :class="{ mirrored }">
    <div class="img-border rounded-xl">
      <v-img alt="" class="img rounded-xl" cover :src />
    </div>
    <p class="text">
      <slot />
    </p>
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 120px;
  margin-top: 40px;
}

.mirrored {
  grid-template-columns: 1fr auto;
}

.mirrored .img-border {
  order: 1;
}

.mirrored .text {
  text-align: left;
}

.img-border {
  border: 3px solid #f2df73;
  padding: 0 10px;
  height: 400px;
  aspect-ratio: 0.75;
}

.img {
  height: 100%;
  filter: grayscale(100%);
}

.text {
  text-align: right;
  font-size: 22px;
}

@media (max-width: 1200px) {
  .container {
    gap: 50px;
  }
}

@media (max-width: 950px) {
  .container {
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
  }

  .mirrored .img-border,
  .img-border {
    width: 100%;
    aspect-ratio: auto;
    order: 0;
    height: 200px;
  }

  .text {
    text-align: left;
    font-size: 20px;
  }
}

@media (max-width: 800px) {
  .text {
    font-size: 16px;
  }

  .container {
    gap: 20px;
  }
}
</style>
