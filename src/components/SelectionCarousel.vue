<template>
  <div class="card-carousel">
    <p v-if="items.length === 0" class="card-carousel__placeholder">无卡牌可显示</p>
    <div
      v-for="(card, index) in items"
      :key="index"
      class="card-carousel__item"
      @click="select(index)
"    >
      <img :src="card.image || ''" :alt="card.name || '武将图'" loading="lazy" @error="hideImg" />
      <span class="card-carousel__item-name">{{ card.name }}</span>
      <span class="card-carousel__item-faction">
        {{ factionDisplay(card) }} ({{ card.displayPack || '未知包' }})
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '../types';

defineProps<{ items: Character[] }>();
const emit = defineEmits<{
  (e: 'select', index: number): void;
}>();

function select(idx: number) {
  emit('select', idx);
}

function hideImg(event: Event) {
  (event.target as HTMLImageElement).style.display = 'none';
}

function factionDisplay(card: Character): string {
  let text = card.faction || '？';
  if (card.faction2 && card.faction2.trim()) {
    text += ` / ${card.faction2}`;
  }
  return text;
}
</script>

<style scoped>
.card-carousel {
  display: flex;
  overflow-x: auto;
  gap: 1em;
  padding: 0.5em 0;
}
.card-carousel__item {
  flex: 0 0 auto;
  text-align: center;
  cursor: pointer;
}
.card-carousel__item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 1px solid #ccc;
}
.card-carousel__item-name {
  display: block;
  font-size: 0.8rem;
  font-weight: bold;
}
.card-carousel__item-faction {
  display: block;
  font-size: 0.7rem;
  color: #666;
}
.card-carousel__placeholder {
  color: #666;
}
</style>