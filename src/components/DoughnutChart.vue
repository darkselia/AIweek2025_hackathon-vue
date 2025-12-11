<script setup lang="ts">
  import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
  import { computed } from 'vue'
  import { Doughnut } from 'vue-chartjs'

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
    crazing: '#3B82F6',
    inclusion: '#10B981',
    patches: '#EAB308',
    pitted_surface: '#6366F1',
    rolled_in_scale: '#14B8A6',
    scratches: '#F43F5E',
  }

  const colorsComputed = computed(() => {
    return (props.labels ?? []).map(lbl => {
      const key = lbl.replace(/_defect$/i, '')
      const base = basePalette[key] ?? '#64748B' // default slate
      const isDefect = /_defect$/i.test(lbl)
      const hex = isDefect ? darken(base, 0.7) : base
      const bg = hexToRgba(hex, 0.5)
      const border = hexToRgba(hex, 1)
      return { bg, border }
    })
  })

  const chartData = computed(() => ({
    labels: props.labels ?? [],
    datasets: [
      {
        label: props.title ?? 'Распределение повреждений по категориям',
        data: props.data ?? [],
        backgroundColor: colorsComputed.value.map(c => c.bg),
        borderColor: colorsComputed.value.map(c => c.border),
        borderWidth: 1,
      },
    ],
  }))

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
/* высоту задаёт родитель */
</style>
