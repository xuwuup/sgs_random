import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Character } from '../types';
import { usePackStore } from './packStore';

export const useDrawStore = defineStore('draw', () => {
  // 从 packStore 获取卡池
  const packStore = usePackStore();

  // 抽取设置
  const drawCount = ref(1);

  // 抽取结果
  const drawnBatch = ref<Character[]>([]);
  const selectedCard = ref<Character | null>(null);
  const confirmedCard = ref<Character | null>(null);
  const isLocked = ref(false);

  // 抽取卡牌
  const drawCards = () => {
    if (packStore.pool.length === 0) return;

    // 此处可引入 utils/randomizer 进行更优雅的随机抽取
    const poolCopy = [...packStore.pool];
    const shuffled = poolCopy.sort(() => Math.random() - 0.5);
    drawnBatch.value = shuffled.slice(0, drawCount.value);
    
    selectedCard.value = null;
    confirmedCard.value = null;
    isLocked.value = false;
  };

  // 选择卡牌
  const selectCard = (card: Character) => {
    selectedCard.value = card;
  };

  // 确认选择
  const confirmSelection = () => {
    if (selectedCard.value) {
      confirmedCard.value = selectedCard.value;
    }
  };

  // 重新抽取
  const redraw = () => {
    drawCards();
  };

  // 锁定/解锁结果
  const lockResult = () => {
    isLocked.value = !isLocked.value;
  };

  // 重置游戏状态
  const reset = () => {
    drawnBatch.value = [];
    selectedCard.value = null;
    confirmedCard.value = null;
    isLocked.value = false;
  };

  return {
    drawCount,
    drawnBatch,
    selectedCard,
    confirmedCard,
    isLocked,
    drawCards,
    selectCard,
    confirmSelection,
    redraw,
    lockResult,
    reset
  };
}, {
  persist: true
});
