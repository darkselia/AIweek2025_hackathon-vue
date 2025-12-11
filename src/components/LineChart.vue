<script setup lang="ts">
  import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
  } from 'chart.js'
  import { computed } from 'vue'
  import { Line } from 'vue-chartjs'

  ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale)

  const props = defineProps<{
    labels: string[]
    data: number[]
    title?: string
    borderColor?: string
    backgroundColor?: string
    yPaddingPoints?: number
  }>()

  const chartData = computed(() => ({
    labels: props.labels ?? [],
    datasets: [
      {
        data: props.data ?? [],
        borderColor: props.borderColor ?? 'rgb(59, 130, 246)',
        backgroundColor: props.backgroundColor ?? 'rgba(59, 130, 246, 0.25)',
        tension: 0.25,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  }))

  const chartOptions = computed(() => {
    const maxVal = (props.data?.length ?? 0) > 0 ? Math.max(...props.data) : 0
    const suggestedMax = maxVal + (props.yPaddingPoints ?? 3)

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: !!props.title, text: props.title ?? '' },
        tooltip: { mode: 'index' as const, intersect: false },
      },
      interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
      scales: {
        x: { title: { display: true, text: 'Дата' } },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Количество' },
          suggestedMax,
          grace: '5%',
        },
      },
    }
  })
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<style scoped>
</style>
