<script setup lang="ts">
  import { computed } from 'vue'
  import { damageClassRuMap } from '@/lib/translations'

  interface Item {
    box_id: string
    klass: string
    confidence: string // ожидаем проценты вида "56%"
  }

  const props = defineProps<{ items: Item[], klassMap?: Record<string, string> }>()

  const headers = [
    { title: 'Box ID', key: 'box_id', align: 'start' as const },
    { title: 'Класс', key: 'klass', align: 'start' as const },
    { title: 'Уверенность', key: 'confidence', align: 'start' as const },
  ]

  function parseConfidence (s: string): number {
    const m = String(s || '').match(/\d+(?:\.\d+)?/)
    return m ? Number(m[0]) : 0
  }

  function rowClass (item: any): string {
    const v = Number(item?.confidence_num ?? 0)
    if (v >= 80) return 'row-strong'
    if (v >= 50) return 'row-medium'
    return 'row-weak'
  }

  const itemsComputed = computed(() => (props.items ?? []).map(i => {
    const map = props.klassMap ?? damageClassRuMap
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

<style scoped>
.result-data-table :deep(tbody tr.row-strong) { background-color: rgba(34,197,94,0.15); }
.result-data-table :deep(tbody tr.row-medium) { background-color: rgba(234,179,8,0.15); }
.result-data-table :deep(tbody tr.row-weak) { background-color: rgba(244,63,94,0.15); }
</style>
