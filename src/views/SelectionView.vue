<template>
  <section class="view selection-view">
    <h2>请选择一张卡牌查看详情 (左右滑动)</h2>
    <SelectionCarousel :items="drawStore.drawnBatch" @select="handleCarouselSelect" />
    <button id="btn-cancel-selection" class="button button--secondary" @click="handleCancelSelection">
      返回设置
    </button>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDrawStore } from '../stores/drawStore'
import SelectionCarousel from '../components/SelectionCarousel.vue'

const router = useRouter()
const drawStore = useDrawStore()

function handleCarouselSelect(index: number) {
  const card = drawStore.drawnBatch[index]
  if (card) {
    drawStore.selectCard(card)
    router.push('/confirmation')
  }
}

function handleCancelSelection() {
  drawStore.reset()
  router.push('/')
}
</script>
