<template>
  <div class="pack-selector">
    <h2>选择卡包</h2>
    <div v-if="!packs || packs.length === 0" class="loading">加载中...</div>
    <div v-else class="packs-list">
      <div
        v-for="pack in packs"
        :key="pack.id"
        class="pack-list-item"
        :class="{ selected: isSelected(pack.folder) }"
        @click="togglePack(pack.folder)"
      >
        <!-- 选择指示器 -->
        <div class="selection-indicator">
          <input
            type="checkbox"
            :value="pack.folder"
            v-model="localSelected"
            @change="emitSelected"
            @click.stop
          />
        </div>

        <!-- 卡包信息 -->
        <div class="pack-info">
          <span class="pack-name">{{ pack.nameForCheckbox }}</span>
          <span class="pack-folder">({{ pack.folder }})</span>
        </div>

        <!-- 数量统计 -->
        <div class="pack-count">
          {{ getPackCharacterCount(pack) }} 张
        </div>
      </div>
    </div>

    <!-- 选择统计 -->
    <div class="selection-summary" v-if="packs && packs.length > 0">
      已选择 {{ localSelected.length }} 个卡包
      <span class="total-characters">（共 {{ getTotalCharacterCount() }} 张武将牌）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PackInfo } from '../types';
import { loadIndex } from '../services/packService';

const props = defineProps<{
  packs: PackInfo[];
  modelValue: string[];
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const localSelected = ref<string[]>([]);
const packCharacterCounts = ref<Record<string, number>>({});

watch(
  () => props.modelValue,
  v => {
    localSelected.value = v ? [...v] : [];
  },
  { immediate: true }
);

// 加载卡包武将数量
async function loadCharacterCounts() {
  try {
    const index = await loadIndex();
    const counts: Record<string, number> = {};
    for (const pack of props.packs) {
      const characters = index.characters[pack.id] || [];
      counts[pack.folder] = characters.length;
    }
    packCharacterCounts.value = counts;
  } catch (error) {
    console.error('加载卡包数据失败:', error);
  }
}

// 组件挂载时加载数据
if (props.packs.length > 0) {
  loadCharacterCounts();
}

function emitSelected() {
  emit('update:modelValue', localSelected.value);
}

function togglePack(folder: string) {
  const index = localSelected.value.indexOf(folder);
  if (index > -1) {
    localSelected.value.splice(index, 1);
  } else {
    localSelected.value.push(folder);
  }
  emitSelected();
}

function isSelected(folder: string): boolean {
  return localSelected.value.includes(folder);
}

function getPackCharacterCount(pack: PackInfo): number {
  return packCharacterCounts.value[pack.folder] || 0;
}

function getTotalCharacterCount(): number {
  return localSelected.value.reduce((total, folder) => {
    return total + (packCharacterCounts.value[folder] || 0);
  }, 0);
}
</script>

<style scoped>
.pack-selector {
  padding: 10px;
}

.pack-selector h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

/* 紧凑列表样式 */
.packs-list {
  display: grid;
  grid-template-columns: 1fr; /* Default to single column */
  gap: 8px;
  margin-bottom: 20px;
  max-height: calc(100vh - 300px); /* Responsive height */
  min-height: 200px;
  overflow-y: auto;
  padding: 5px;
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(140, 34, 34, 0.4) rgba(0,0,0,0.05);
}

@media screen and (min-width: 768px), screen and (orientation: landscape) {
  .packs-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    max-height: calc(100vh - 250px);
  }
}

.packs-list::-webkit-scrollbar {
  width: 6px;
}
.packs-list::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
}
.packs-list::-webkit-scrollbar-thumb {
  background: rgba(140, 34, 34, 0.4);
  border-radius: 3px;
}

.pack-list-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pack-list-item:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.pack-list-item.selected {
  background: rgba(140, 34, 34, 0.08); /* 极淡的暗红 */
  border-color: var(--color-primary);
  border-left: 4px solid var(--color-primary);
}

.selection-indicator {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.selection-indicator input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.pack-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.pack-name {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.pack-folder {
  font-size: 13px;
  color: var(--color-text-light);
  font-family: monospace;
}

.pack-count {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: bold;
  background: rgba(140, 34, 34, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
}

.selection-summary {
  text-align: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  font-size: 15px;
  color: var(--color-text-primary);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
}

.total-characters {
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .pack-list-item {
    padding: 8px 10px;
  }
  .pack-info {
    flex-direction: column;
    gap: 2px;
  }
}
</style>