import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Character } from '../types'
import { usePackStore } from './packStore'

export const useDrawStore = defineStore('draw', () => {
  const selectedCard = ref<Character | null>(null)
  const confirmedCard = ref<Character | null>(null)
  const drawnBatch = ref<Character[]>([])
  const drawCount = ref(1)

  // 助手模式状态
  const isHelperMode = ref(false)
  const currentHealth = ref(0)
  const maxHealth = ref(0)

  const hasSelection = computed(() => !!selectedCard.value)
  const isConfirmed = computed(() => !!confirmedCard.value)

  function drawCards() {
    const packStore = usePackStore()
    if (packStore.pool.length === 0) return

    // 随机乱序并抽取指定数量
    const shuffled = [...packStore.pool].sort(() => Math.random() - 0.5)
    drawnBatch.value = shuffled.slice(0, drawCount.value)

    // 开启新一轮时重置状态
    selectedCard.value = null
    confirmedCard.value = null
    isHelperMode.value = false
  }

  function selectCard(card: Character) {
    selectedCard.value = card
  }

  function confirmSelection() {
    if (selectedCard.value) {
      confirmedCard.value = selectedCard.value
      // 初始化体力
      maxHealth.value = Math.floor(selectedCard.value.health || 3)
      currentHealth.value = maxHealth.value
      // 自动进入助手模式
      isHelperMode.value = true
    }
  }

  function reset() {
    selectedCard.value = null
    confirmedCard.value = null
    isHelperMode.value = false
    currentHealth.value = 0
    maxHealth.value = 0
    drawnBatch.value = []
  }

  function changeHealth(delta: number) {
    const newVal = currentHealth.value + delta
    if (newVal >= 0 && newVal <= maxHealth.value) {
      currentHealth.value = newVal
    }
  }

  function setMaxHealth(val: number) {
    maxHealth.value = val
    if (currentHealth.value > val) currentHealth.value = val
  }

  return {
    selectedCard,
    confirmedCard,
    drawnBatch,
    drawCount,
    isHelperMode,
    currentHealth,
    maxHealth,
    hasSelection,
    isConfirmed,
    drawCards,
    selectCard,
    confirmSelection,
    reset,
    changeHealth,
    setMaxHealth
  }
})
