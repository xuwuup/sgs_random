<template>
  <section class="showcase-view">
    <!-- Dramatic backdrop -->
    <div class="showcase-backdrop"></div>

    <!-- Title -->
    <div class="showcase-header">
      <h2 class="showcase-title">武将预览</h2>
      <p class="showcase-subtitle" v-if="drawStore.selectedCard">
        {{ drawStore.selectedCard.title || '' }} · {{ drawStore.selectedCard.name }}
      </p>
    </div>

    <!-- Character Showcase -->
    <div class="showcase-body">
      <CardDetails :card="drawStore.selectedCard" layout="split" />
    </div>

    <!-- Action Buttons -->
    <div class="showcase-actions">
      <button class="action-btn btn-reject" @click="handleBackToSelection">
        <span class="btn-icon">↩</span>
        <span>返回重选</span>
      </button>
      <button class="action-btn btn-confirm" @click="handleConfirm">
        <span class="btn-icon">✦</span>
        <span>确认选取</span>
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
.showcase-view {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 60;
  overflow: hidden;
}

.showcase-backdrop {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: radial-gradient(ellipse at 50% 30%, #2b1d15 0%, #0a0606 70%);
  z-index: 0;
}
.showcase-backdrop::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  /* Subtle particle-like noise overlay */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
}

/* Header */
.showcase-header {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 30px;
  animation: fadeInDown 0.5s ease-out;
}

.showcase-title {
  color: #ffeb3b;
  font-size: 28px;
  letter-spacing: 6px;
  text-shadow: 0 0 15px rgba(255, 235, 59, 0.3);
  margin: 0 0 8px 0;
}

.showcase-subtitle {
  color: #c8a97e;
  font-size: 16px;
  letter-spacing: 3px;
  margin: 0;
}

/* Body */
.showcase-body {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
  animation: fadeIn 0.6s ease-out 0.2s backwards;
}

/* Action Buttons */
.showcase-actions {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 30px;
  padding: 20px 0 40px;
  animation: fadeInUp 0.5s ease-out 0.4s backwards;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 35px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  font-family: var(--font-family-base);
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.btn-reject {
  background: rgba(255, 255, 255, 0.08);
  color: #e5dfd9;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.btn-reject:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-confirm {
  background: linear-gradient(135deg, #8c2222 0%, #b32d2d 100%);
  color: #fff;
  border: 1px solid #d44;
  box-shadow: 0 4px 20px rgba(140, 34, 34, 0.5);
}
.btn-confirm:hover {
  background: linear-gradient(135deg, #b32d2d 0%, #d44040 100%);
  box-shadow: 0 6px 30px rgba(140, 34, 34, 0.7);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 20px;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media screen and (max-width: 768px) {
  .showcase-actions {
    flex-direction: column;
    gap: 15px;
    width: 80%;
    align-items: stretch;
  }
  .action-btn {
    justify-content: center;
    padding: 12px 20px;
    font-size: 16px;
  }
}
</style>
