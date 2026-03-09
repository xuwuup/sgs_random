<template>
  <section class="view confirmation-view">
    <h2>确认选择这张卡牌吗？</h2>
    <CardDetails :card="drawStore.selectedCard" />
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
