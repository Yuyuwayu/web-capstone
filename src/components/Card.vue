<template>
  <div :class="['rounded-xl p-6 text-white shadow-md', colorClass]">
    <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
    <p class="text-3xl font-bold">{{ value }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: [String, Number],
  color: String
})

const colorMap = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500'
}

const colorClass = computed(() => colorMap[props.color] || 'bg-gray-400')
</script>
