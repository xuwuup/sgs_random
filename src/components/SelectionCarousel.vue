<template>
  <div class="pull-grid">
    <p v-if="items.length === 0" class="placeholder">无卡牌可显示</p>
    
    <div
      v-for="(card, index) in items"
      :key="index"
      class="pull-card"
      :class="getFactionClass(card.faction)"
      :style="{ animationDelay: `${index * 0.15}s` }"
      @click="select(index)"
    >
      <div class="card-inner">
        <div class="card-image-box">
          <img :src="card.image || ''" :alt="card.name" loading="lazy" @error="hideImg" />
          <div class="faction-icon" v-if="card.faction">
             {{ card.faction.substring(0, 1) }}
          </div>
        </div>
        
        <div class="card-info">
          <span class="card-name">{{ card.name }}</span>
          <span class="card-pack">{{ card.displayPack || '未知包' }}</span>
        </div>
      </div>
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
  (event.target as HTMLImageElement).style.visibility = 'hidden';
}

function getFactionClass(faction: string | undefined): string {
  if (!faction) return 'faction-default';
  const f = faction.substring(0, 1);
  const map: Record<string, string> = {
    '魏': 'faction-wei',
    '蜀': 'faction-shu',
    '吴': 'faction-wu',
    '群': 'faction-qun',
    '神': 'faction-shen',
    '晋': 'faction-jin'
  };
  return map[f] || 'faction-default';
}
</script>

<style scoped>
.pull-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.placeholder {
  color: #a69888;
  font-size: 18px;
}

.pull-card {
  width: 140px;
  height: 220px;
  cursor: pointer;
  perspective: 1000px;
  /* Entrance animation */
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  animation: revealCard 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes revealCard {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-inner {
  width: 100%;
  height: 100%;
  background: #1e1914;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  border: 1px solid #3d342d;
  display: flex;
  flex-direction: column;
}

.pull-card:hover .card-inner {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.7), 0 0 15px var(--glow-color, rgba(255,255,255,0.2));
  border-color: var(--glow-color, #c8a97e);
}

.card-image-box {
  width: 100%;
  height: 70%;
  position: relative;
  overflow: hidden;
  background: #2a241d;
}

.card-image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  transition: transform 0.5s ease;
}

.pull-card:hover .card-image-box img {
  transform: scale(1.05);
}

.faction-icon {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.7);
  color: var(--glow-color, #fff);
  border: 1px solid var(--glow-color, #fff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px;
  background: linear-gradient(to top, #110e0c, #1e1914);
}

.card-name {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px #000;
}

.card-pack {
  color: #a69888;
  font-size: 11px;
  margin-top: 2px;
}

/* Faction Glow Colors */
.faction-wei { --glow-color: #4a90e2; }
.faction-shu { --glow-color: #e24a4a; }
.faction-wu { --glow-color: #4ae25b; }
.faction-qun { --glow-color: #a0a0a0; }
.faction-shen { --glow-color: #ffd700; }
.faction-jin { --glow-color: #b04ae2; }

@media screen and (max-width: 768px) {
  .pull-card { width: 105px; height: 165px; }
  .card-name { font-size: 14px; }
  .pull-grid { gap: 10px; }
}
</style>