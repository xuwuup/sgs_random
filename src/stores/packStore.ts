import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Character, PackInfo } from '../types';
import { buildPool, fetchPackList } from '../services/packService';

export const usePackStore = defineStore('pack', () => {
  // 包选择状态
  const selectedFolders = ref<string[]>([]);
  const packList = ref<PackInfo[]>([]);

  // 卡池与显示状态
  const pool = ref<Character[]>([]);
  const displayPacks = ref<Set<string>>(new Set());

  // 计算属性
  const poolSize = computed(() => pool.value.length);
  const hasSelectedPacks = computed(() => selectedFolders.value.length > 0);

  // 初始化包列表
  const initializePacks = async () => {
    try {
      packList.value = await fetchPackList();
      // 默认全选
      selectedFolders.value = packList.value.map(p => p.folder);
    } catch (error) {
      console.error('Failed to load pack list:', error);
    }
  };

  // 重建卡池 - 防抖处理
  let debounceTimer: number | null = null;
  const rebuildPool = async () => {
    if (selectedFolders.value.length === 0) {
      pool.value = [];
      displayPacks.value.clear();
      return;
    }

    try {
      const result = await buildPool(selectedFolders.value);
      pool.value = result.characters;
      displayPacks.value = result.displayPacks;
    } catch (error) {
      console.error('Failed to build pool:', error);
      pool.value = [];
      displayPacks.value.clear();
    }
  };

  // 监听包选择变更
  watch(selectedFolders, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(rebuildPool, 300);
  });

  return {
    selectedFolders,
    packList,
    pool,
    displayPacks,
    poolSize,
    hasSelectedPacks,
    initializePacks,
    rebuildPool
  };
}, {
  persist: true
});
