<template>
  <section class="view settings-view">
    <h2>设置</h2>
    <PackSelector v-model="packStore.selectedFolders" :packs="packStore.packList" />
    <DrawControls
      v-model="drawStore.drawCount"
      :poolSize="packStore.poolSize"
      :displayPacks="displayPacksArray"
      @draw="handleDraw"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePackStore } from '../stores/packStore'
import { useDrawStore } from '../stores/drawStore'
import PackSelector from '../components/PackSelector.vue'
import DrawControls from '../components/DrawControls.vue'

const router = useRouter()
const packStore = usePackStore()
const drawStore = useDrawStore()

const displayPacksArray = computed(() => Array.from(packStore.displayPacks))

function handleDraw(count: number) {
  drawStore.drawCount = count
  drawStore.drawCards()
  router.push('/selection')
}
</script>
