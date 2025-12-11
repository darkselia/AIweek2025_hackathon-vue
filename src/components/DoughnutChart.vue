<script setup lang="ts">
  import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
  import { computed } from 'vue'
  import { Doughnut } from 'vue-chartjs'
  import { translateDamageLabel } from '@/lib/translations'

  ChartJS.register(ArcElement, Tooltip, Legend)

  interface Props {
    labels: string[]
    data: number[]
    title?: string
  }

  const props = defineProps<Props>()

  function hexToRgba (hex: string, alpha = 1): string {
    const m = hex.replace('#', '')
    const bigint = Number.parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  function darken (hex: string, factor = 0.85): string {
    const m = hex.replace('#', '')
    const bigint = Number.parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16)
    let r = (bigint >> 16) & 255
    let g = (bigint >> 8) & 255
    let b = bigint & 255
    r = Math.max(0, Math.floor(r * factor))
    g = Math.max(0, Math.floor(g * factor))
    b = Math.max(0, Math.floor(b * factor))
    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const basePalette: Record<string, string> = {
    'crazing': '#3B82F6',
    'inclusion': '#10B981',
    'patches': '#EAB308',
    'pitted_surface': '#b671f6',
    'rolled-in_scale': '#19ba1e',
    'scratches': '#F43F5E',
  }

  const colorsComputed = computed(() => (props.labels ?? []).map(lbl => {
    const key = lbl.replace(/_defect$/i, '')
    const base = basePalette[key] ?? '#64748B'
    const isDefect = /_defect$/i.test(lbl)
    const hex = isDefect ? darken(base, 0.7) : base
    return { bg: hexToRgba(hex, 0.5), border: hexToRgba(hex, 1) }
  }))

  const chartData = computed(() => {
    const labels = props.labels ?? []
    const values = props.data ?? []
    const colors = colorsComputed.value
    const defaultColor = { bg: hexToRgba('#64748B', 0.5), border: hexToRgba('#64748B', 1) }
    const pairs = labels.map((lbl, i) => ({ label: lbl, value: values[i] ?? 0, color: colors[i] ?? defaultColor }))
    pairs.sort((a, b) => a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' }))
    return {
      labels: pairs.map(p => translateDamageLabel(p.label)),
      datasets: [
        {
          label: props.title ?? 'Распределение повреждений по категориям',
          data: pairs.map(p => p.value),
          backgroundColor: pairs.map(p => (p.color?.bg ?? defaultColor.bg)),
          borderColor: pairs.map(p => (p.color?.border ?? defaultColor.border)),
          borderWidth: 1,
        },
      ],
    }
  })

  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'left' as const },
      title: { display: !!props.title, text: props.title ?? '' },
      tooltip: { intersect: true },
    },
  }))
</script>

<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<style scoped>
</style>
