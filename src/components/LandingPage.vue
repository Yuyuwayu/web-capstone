<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="min-h-screen bg-gray-50 p-6">
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Dashboard Monitoring Ikan</h1>
        <p class="text-gray-600">Pantau suhu, pH, kekeruhan air, dan nafsu makan ikan secara real-time</p>
        <div class="mb-4 text-gray-700">
          <strong>Waktu Makan Terakhir:</strong>
          <span>{{ lastFeedTime }}</span>
        </div>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card title="Suhu (°C)" :value="sensorData.temperature" color="red" />
        <Card title="pH" :value="sensorData.ph" color="blue" />
        <Card title="Kekeruhan (NTU)" :value="sensorData.turbidity" color="yellow" />
        <Card title="Nafsu Makan" :value="sensorData.appetite" color="green" />
      </section>

      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <!-- KIRI: Deteksi Nafsu Makan -->
        <section class="bg-white p-6 rounded-xl shadow-md">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">Deteksi Nafsu Makan Otomatis</h2>
            <span class="text-sm text-gray-500 italic">Deteksi otomatis setiap 10 detik</span>
          </div>

          <p class="mb-4 text-gray-600">Status:
            <span class="font-semibold text-green-600">{{ appetiteStatus }}</span>
          </p>

          <img :src="videoStreamUrl" alt="Live Stream" class="w-full rounded-lg border shadow" />
        </section>

        <!-- KANAN: Riwayat Nafsu Makan + Pagination -->
        <section class="bg-white p-6 rounded-xl shadow-md relative min-h-[300px] pb-16">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">Riwayat Nafsu Makan</h2>
            <button @click="resetData" class="text-sm text-red-600 hover:underline font-medium">Reset Data</button>
          </div>

          <div class="overflow-x-auto max-w-full">
            <table class="min-w-full text-sm divide-y divide-gray-200 table-auto">
              <thead>
              <tr class="bg-gray-100 text-left">
                <th class="px-4 py-2 font-semibold">Waktu</th>
                <th class="px-4 py-2 font-semibold">Nafsu Makan</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, index) in paginatedHistory" :key="index">
                <td class="px-4 py-2 text-gray-700">{{ item.timestamp }}</td>
                <td class="px-4 py-2 text-gray-700">{{ item.appetite }}</td>
              </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-auto pt-4">
            <div class="flex justify-center gap-3 items-center text-sm">
              <button
                  class="px-4 py-2 rounded-xl font-semibold transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="currentPage === 1"
                  @click="currentPage--"
              >
                ⬅️ Sebelumnya
              </button>

              <span class="text-gray-600 font-medium">Halaman {{ currentPage }} / {{ totalPages }}</span>

              <button
                  class="px-4 py-2 rounded-xl font-semibold transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="currentPage === totalPages"
                  @click="currentPage++"
              >
                Selanjutnya ➡️
              </button>
            </div>
          </div>

        </section>
      </div>

      <!-- Grafik -->
      <section class="bg-white p-4 rounded-2xl shadow mb-6">
        <h2 class="text-xl font-semibold mb-2">Grafik Perubahan Parameter</h2>
        <LineChart :chart-data="chartData" />
      </section>

      <!-- Riwayat Sensor -->
      <div class="bg-white p-6 rounded-xl shadow-md flex flex-col" style="min-height: 400px;">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">Riwayat Data Sensor</h2>

        <div class="flex-1 overflow-x-auto">
          <table class="min-w-full text-sm divide-y divide-gray-200">
            <thead>
            <tr class="bg-gray-100 text-left">
              <th class="px-4 py-2 font-semibold">Waktu</th>
              <th class="px-4 py-2 font-semibold">Suhu</th>
              <th class="px-4 py-2 font-semibold">pH</th>
              <th class="px-4 py-2 font-semibold">Kekeruhan</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
            <tr v-for="(item, index) in paginatedSensorHistory" :key="index">
              <td class="px-4 py-2 text-gray-700">{{ item.timestamp }}</td>
              <td class="px-4 py-2 text-gray-700">{{ item.temperature }}°C</td>
              <td class="px-4 py-2 text-gray-700">{{ item.ph }}</td>
              <td class="px-4 py-2 text-gray-700">{{ item.turbidity }} NTU</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-auto pt-4">
          <div class="flex justify-center gap-3 items-center text-sm">
            <button
                class="px-4 py-2 rounded-xl font-semibold transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="sensorPage === 1"
                @click="sensorPage--">
              ⬅️ Sebelumnya
            </button>

            <span class="text-gray-600 font-medium">Halaman {{ sensorPage }} / {{ sensorTotalPages }}</span>

            <button
                class="px-4 py-2 rounded-xl font-semibold transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="sensorPage === sensorTotalPages"
                @click="sensorPage++">
              Selanjutnya ➡️
            </button>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import Card from './Card.vue'
import LineChart from './LineChart.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import axios from 'axios'
import {computed} from "vue"
const currentPage = ref(1)
const itemsPerPage = 10
// Pagination untuk Riwayat Data Sensor
const sensorPage = ref(1)
const sensorItemsPerPage = 10

const paginatedSensorHistory = computed(() => {
  const dataOnly = history.value.filter(item => item.temperature !== undefined)
  const start = (sensorPage.value - 1) * sensorItemsPerPage
  return dataOnly.slice(start, start + sensorItemsPerPage)
})

const sensorTotalPages = computed(() => {
  const dataOnly = history.value.filter(item => item.temperature !== undefined)
  return Math.ceil(dataOnly.length / sensorItemsPerPage) || 1
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return history.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() =>
    Math.ceil(history.value.length / itemsPerPage)
)

const lastFeedTime = ref('Belum ada')

const sensorData = useLocalStorage('sensorData', {
  temperature: 0,
  ph: 0,
  turbidity: 0,
  appetite: '-'
})

const history = useLocalStorage('historyData', [])

const chartData = ref({
  labels: [],
  datasets: [
    { label: 'Suhu', data: [], borderColor: 'rgb(239 68 68)', fill: false },
    { label: 'pH', data: [], borderColor: 'rgb(59 130 246)', fill: false },
    { label: 'Kekeruhan', data: [], borderColor: 'rgb(202 138 4)', fill: false }
  ]
})

const appetiteStatus = ref('Memuat...')
const videoStreamUrl = 'http://localhost:8000/video_feed' // Stream langsung dari server

const fetchDetection = async () => {
  try {
    const res = await axios.get('http://localhost:8000/deteksi')
    appetiteStatus.value = res.data.status
    sensorData.value.appetite = res.data.status

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
    history.value.push({
      timestamp,
      temperature: sensorData.value.temperature,
      ph: sensorData.value.ph,
      turbidity: sensorData.value.turbidity,
      appetite: res.data.status
    })

    updateChart()
  } catch (err) {
    appetiteStatus.value = 'Gagal mendeteksi'
    console.error('Error dari localhost:8000:', err)
  }
}

const fetchSensorData = async () => {
  try {
    const res = await axios.get('http://192.168.0.100/sensor')
    sensorData.value.temperature = res.data.temperature
    sensorData.value.ph = res.data.ph
    sensorData.value.turbidity = res.data.turbidity
  } catch (err) {
    console.error('Error dari Arduino:', err)
  }
}

const fetchLastFeedTime = async () => {
  try {
    const res = await axios.get('http://localhost:5000/hasil-terakhir')
    lastFeedTime.value = res.data.waktu_makan || 'Belum ada'
  } catch (err) {
    lastFeedTime.value = 'Gagal mengambil data'
    console.error('Gagal ambil waktu makan terakhir:', err)
  }
}

const updateChart = () => {
  chartData.value.labels = history.value.map(h => h.timestamp.slice(11, 16))
  chartData.value.datasets[0].data = history.value.map(h => h.temperature)
  chartData.value.datasets[1].data = history.value.map(h => h.ph)
  chartData.value.datasets[2].data = history.value.map(h => h.turbidity)
}

const resetData = () => {
  sensorData.value = {
    temperature: 0,
    ph: 0,
    turbidity: 0,
    appetite: '-'
  }
  history.value = []
  chartData.value.labels = []
  chartData.value.datasets.forEach(ds => (ds.data = []))
}

let intervalId

onMounted(() => {
  fetchSensorData()
  fetchDetection()
  fetchLastFeedTime()
  intervalId = setInterval(() => {
    fetchSensorData()
    fetchDetection()
    fetchLastFeedTime()
  }, 10000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>
