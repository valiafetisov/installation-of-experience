<script setup lang="ts">
import { format } from 'date-fns'
import { useIntervalFn, useWindowSize } from '@vueuse/core'

const now = useState('now', () => new Date())
const { width, height } = useWindowSize()
const { data, refresh } = await useFetch('/api/visits', { timeout: 3000 })

const amountOfRowsThatFitsOnScreen = computed(() => {
  const fontSize = width.value * 0.03 // font-size: 3vw
  const blockSize = fontSize * 1.5 // line-height: 1.5
  const availableSpace = height.value - fontSize * 4 // height: calc(100vh - 4rem)
  return Math.floor(availableSpace / blockSize)
})
const amountToDisplay = computed(() => 1 + data.value.total % amountOfRowsThatFitsOnScreen.value + amountOfRowsThatFitsOnScreen.value * 2)
const limitedVisits = computed(() => {
  if (data.value.visits.length > amountToDisplay.value) {
    return data.value.visits.slice(amountToDisplay.value * -1) // -1 since we want to get the latest visits from array
  }
  return data.value.visits
})

const formatTime = (date: string) => {
  return format(new Date(date), 'HH:mm')
}
const formatNow = (date: Date) => {
  return format(date, 'HH:mm:ss')
}

useIntervalFn(() => {
  now.value = new Date()
  refresh()
}, 500)
</script>

<template>
  <div class="container">
    <div v-for="visit in limitedVisits" :id="visit.id">
      <span v-if="visit.visitFinishedAt">
        {{`${formatTime(visit.visitStartedAt)} – ${formatTime(visit.visitFinishedAt)}`}}
      </span>
      <span v-else>
        {{`${formatTime(visit.visitStartedAt)} – ${formatNow(now)}`}}
      </span>
    </div>
  </div>
</template>

<style>
html, body {
  color: #141414;
  background-color: #e1e1e1;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-size: 3vw;
  padding: 0;
  margin: 0;
}
.container {
  padding: 2rem;
  height: calc(100vh - 4rem);
  width: auto;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
}
.container > div {
  text-wrap: nowrap;
  min-width: 8rem;
  width: 30vw;
}
</style>
