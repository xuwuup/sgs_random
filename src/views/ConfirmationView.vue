<template>
  <section class="confirmation-view content-area">
    <h2 class="view-title">武将技能预览</h2>
    
    <div class="character-preview-area">
      <CardDetails :card="drawStore.selectedCard" layout="split" />
    </div>

    <div class="confirmation-buttons">
      <button class="button button--secondary" @click="handleBackToSelection">
        返回重选
      </button>
      <button class="button button--primary" @click="handleConfirm">
        确认选取
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDrawStore } from '../stores/drawStore'
import CardDetails from '../components/CardDetails.vue'

const router = useRouter()
const drawStore = useDrawStore()

function handleBackToSelection() {
  router.push('/selection')
}

function handleConfirm() {
  drawStore.confirmSelection()
  router.push('/final')
}
</script>

<style scoped>
.confirmation-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95vw;
  max-width: 1200px;
  margin: 20px auto;
  background-color: var(--color-surface);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.3);
}

.view-title {
  color: var(--color-primary);
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

.character-preview-area {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.confirmation-buttons {
  display: flex;
  gap: 30px;
  margin-top: 10px;
}

@media screen and (orientation: portrait) {
  .confirmation-buttons {
    flex-direction: column;
    gap: 15px;
    width: 60%;
  }
}
</style>
