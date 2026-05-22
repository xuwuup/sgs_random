<template>
  <div class="gacha-controls glass-panel">
    <p class="pool-status" v-if="poolSize === 0">卡池为空，请先选择卡包</p>
    
    <div class="draw-actions" v-else>
      <!-- Draw 1 Button -->
      <button 
        class="gacha-btn btn-single" 
        :disabled="!canDraw(1)" 
        @click="emitDraw(1)"
      >
        <span class="btn-title">招募 1 次</span>
        <span class="btn-subtitle">消耗 1 祈愿</span>
      </button>

      <!-- Draw N Button with Input -->
      <div class="multi-draw-container">
        <label for="multi-count" class="multi-label">批量招募数量:</label>
        <input 
          id="multi-count" 
          type="number" 
          v-model.number="count" 
          :min="1" 
          :max="max"
          class="multi-input"
        />
        <button 
          class="gacha-btn btn-multi" 
          :disabled="!canDraw(count)" 
          @click="emitDraw(count)"
        >
          <span class="btn-title">招募 {{ count }} 次</span>
          <span class="btn-subtitle">消耗 {{ count }} 祈愿</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

const props = defineProps<{
  poolSize: number;
  displayPacks: string[];
  modelValue: number;
}>();
const emit = defineEmits<{
  (e: 'draw', count: number): void;
  (e: 'update:modelValue', value: number): void;
}>();

const count = computed({
  get: () => {
    // 默认给个漂亮的 10 连，如果卡池不够就是最大值
    if (props.modelValue === 1 && props.poolSize >= 10) return 10;
    return props.modelValue;
  },
  set: (value) => emit('update:modelValue', value)
});

const max = computed(() => Math.max(props.poolSize, 1));

watch(max, val => {
  if (count.value > val) count.value = val;
});

function canDraw(amount: number) {
  return props.poolSize > 0 && amount >= 1 && amount <= props.poolSize;
}

function emitDraw(amount: number) {
  emit('draw', amount);
}
</script>

<style scoped>
.gacha-controls {
  padding: 20px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 320px;
}

.pool-status {
  text-align: center;
  color: #ffaa00;
  font-weight: bold;
  margin: 0;
}

.draw-actions {
  display: flex;
  gap: 20px;
  align-items: flex-end;
}

.gacha-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  background-size: 200% auto;
}

.gacha-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(100%);
}

.gacha-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.btn-single {
  background-image: linear-gradient(to right, #ece9e6 0%, #ffffff 51%, #ece9e6 100%);
  color: #3b434a;
  border: 1px solid #d4c4b7;
}
.btn-single:hover:not(:disabled) {
  background-position: right center;
}

.btn-multi {
  background-image: linear-gradient(to right, #f6d365 0%, #fda085 51%, #f6d365 100%);
  color: #fff;
  border: 1px solid #e5a93c;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.btn-multi:hover:not(:disabled) {
  background-position: right center;
}

.btn-title {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2px;
}

.btn-subtitle {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.multi-draw-container {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.multi-label {
  font-size: 12px;
  color: #e5dfd9;
}

.multi-input {
  width: 100%;
  padding: 8px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255, 215, 100, 0.3);
  color: #fff;
  border-radius: 4px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
}
.multi-input:focus {
  outline: none;
  border-color: #f6d365;
}

@media screen and (max-width: 768px) {
  .draw-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>