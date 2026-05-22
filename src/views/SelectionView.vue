<template>
  <section class="results-view">
    <div class="results-header">
      <h2 class="title">招募结果</h2>
      <p class="subtitle">点击选中你需要作为主将的卡牌</p>
    </div>

    <div class="results-content">
      <SelectionCarousel :items="drawStore.drawnBatch" @select="handleCarouselSelect" />
    </div>

    <div class="results-footer">
      <button class="button button--secondary btn-back" @click="handleCancelSelection">
        放弃并返回
      </button>
    </div>
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

<style scoped>
.results-view {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: radial-gradient(circle at center, #2b1d15 0%, #0a0808 100%);
  display: flex;
  flex-direction: column;
  z-index: 50;
  overflow: hidden;
}

.results-header {
  text-align: center;
  margin-top: 40px;
  animation: fadeInDown 0.6s ease-out;
}

.title {
  color: #ffeb3b;
  font-size: 36px;
  letter-spacing: 8px;
  text-shadow: 0 0 20px rgba(255, 235, 59, 0.4);
  margin: 0 0 10px 0;
}

.subtitle {
  color: #a69888;
  font-size: 16px;
  letter-spacing: 2px;
}

.results-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.results-footer {
  padding: 30px;
  text-align: center;
  animation: fadeInUp 0.6s ease-out 0.3s backwards;
}

.btn-back {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 30px;
  font-size: 16px;
}
.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
