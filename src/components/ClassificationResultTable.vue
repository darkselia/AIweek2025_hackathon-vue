<script setup lang="ts">
  import { computed } from 'vue'

  interface Item {
    box_id: string
    klass: string
    confidence: string // ожидаем проценты вида "56%"
  }

  const props = defineProps<{ items: Item[], klassMap?: Record<string, string> }>()

  const defaultMap: Record<string, string> = {
    'crazing': 'Трещины',
    'inclusion': 'Включения',
    'patches': 'Бляшки',
    'pitted_surface': 'Каверны',
    'rolled-in_scale': 'Окалины',
    'scratches': 'Царапины',
  }

  const headers = [
    { title: 'Box ID', key: 'box_id', align: 'start' as const },
    { title: 'Класс', key: 'klass', align: 'start' as const },
    { title: 'Уверенность', key: 'confidence', align: 'start' as const },
  ]

  function parseConfidence (s: string): number {
    const m = String(s || '').match(/\d+(?:\.\d+)?/)
    return m ? Number(m[0]) : 0
  }

  const itemsComputed = computed(() => (props.items ?? []).map(i => {
    const map = props.klassMap ?? defaultMap
    const klass_ru = map[i.klass] ?? i.klass
    return {
      ...i,
      klass_ru,
      confidence_num: parseConfidence(i.confidence),
    }
  }))
</script>

<template>
  <v-data-table
    class="result-data-table"
    density="comfortable"
    :headers="headers"
    hide-default-footer
    :items="itemsComputed"
  >
    <template #item.box_id="{ item }">
      <span>{{ item.box_id }}</span>
    </template>
    <template #item.klass="{ item }">
      <span>{{ item.klass_ru }}</span>
    </template>
    <template #item.confidence="{ item }">
      <span>{{ item.confidence }}</span>
    </template>

    <template #item="{ item }">
      <tr :class="rowClass(item)">
        <td>{{ item.box_id }}</td>
        <td>{{ item.klass_ru }}</td>
        <td>{{ item.confidence }}</td>
      </tr>
    </template>
  </v-data-table>
</template>

<script lang="ts">
  export default {
    methods: {
      rowClass (item: any) {
        const c = Number(item.confidence_num ?? 0)
        if (c >= 80) return 'row-high'
        if (c >= 50) return 'row-mid'
        if (c > 0) return 'row-low'
        return 'row-none'
      },
    },
  }
</script>

<style scoped>
.result-data-table :deep(table) {
  width: 100%;
}

/* Подсветка строк по уверенности */
.row-high { background-color: rgba(16, 185, 129, 0.15); }
.row-mid { background-color: rgba(234, 179, 8, 0.18); }
.row-low { background-color: rgba(244, 63, 94, 0.12); }
.row-none { background-color: transparent; }

/* Немного отступов */
:deep(.v-data-table__th) {
  font-weight: 700;
}
</style>
