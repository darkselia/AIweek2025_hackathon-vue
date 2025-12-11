<script setup lang="ts">
  import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
  } from 'chart.js'
  import { computed } from 'vue'
  import { Bar } from 'vue-chartjs'

  ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Title, Tooltip)

  interface Props {
    labels: string[]
    data: number[]
    title?: string
    borderColor?: string
    backgroundColor?: string
  }

  const props = defineProps<Props>()

  const chartData = computed(() => ({
    labels: props.labels ?? [],
    datasets: [
      {
        data: props.data ?? [],
        backgroundColor: props.backgroundColor ?? 'rgba(16, 185, 129, 0.35)',
        borderColor: props.borderColor ?? 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  }))

  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: !!props.title, text: props.title ?? '' },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: { title: { display: true, text: 'Сотрудники' } },
      y: { beginAtZero: true, title: { display: true, text: 'Количество' } },
    },
  }))
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<style scoped>
</style>
