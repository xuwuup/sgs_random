<template>
  <div class="draw-controls">
    <fieldset class="draw-options">
      <legend>抽卡设置</legend>
      <label for="draw-count-input">一次抽取数量:</label>
      <input
        id="draw-count-input"
        type="number"
        v-model.number="count"
        :min="1"
        :max="max"
      />
      <button
        class="button button--primary"
        :disabled="!canDraw"
        @click="emitDraw"
      >开始抽取</button>
    </fieldset>
    <p class="pool-status">{{ poolInfo }}</p>
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
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const max = computed(() => Math.max(props.poolSize, 1));

watch(max, val => {
  if (count.value > val) count.value = val;
});

const poolInfo = computed(() => {
  if (props.poolSize === 0) return '卡池为空';
  const packs = props.displayPacks.join(', ');
  return `当前卡池共 ${props.poolSize} 名武将 (来自: ${packs})`;
});

const canDraw = computed(() => props.poolSize > 0 && count.value >= 1 && count.value <= props.poolSize);

function emitDraw() {
  emit('draw', count.value);
}
</script>

<style scoped>
.draw-options {
  margin-bottom: 1em;
}
.pool-status {
  font-size: 0.9rem;
  color: #333;
}
</style>