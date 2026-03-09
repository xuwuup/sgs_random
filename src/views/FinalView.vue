<template>
  <section class="view final-view">
    <div class="final-view__controls">
      <button id="btn-redraw" class="button button--secondary" @click="handleRedraw" :disabled="drawStore.isLocked">
        重新抽取
      </button>
      <button
        id="btn-lock"
        class="button button--lock"
        :class="{ locked: drawStore.isLocked }"
        @click="handleLockToggle"
        :aria-pressed="drawStore.isLocked"
        :title="drawStore.isLocked ? '解锁卡牌' : '锁定卡牌'"
      >
        <i :class="['fas', drawStore.isLocked ? 'fa-lock' : 'fa-unlock']" aria-hidden="true"></i>
        <span>{{ drawStore.isLocked ? '锁定' : '解锁' }}</span>
      </button>
    </div>
    <div class="card-display-area card-display-area--large">
      <CardDetails :card="drawStore.confirmedCard" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDrawStore } from '../stores/drawStore'
import CardDetails from '../components/CardDetails.vue'

const router = useRouter()
const drawStore = useDrawStore()

function handleRedraw() {
  if (drawStore.isLocked) {
    return
  }
  drawStore.reset()
  router.push('/')
}

function handleLockToggle() {
  drawStore.lockResult()
}
</script>
