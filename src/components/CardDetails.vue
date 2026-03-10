<template>
  <div 
    class="card-details-container" 
    :data-faction="card?.faction || ''" 
    :class="[layout, { placeholder: !card }]"
  >
    <!-- 1. 经典实体卡牌模式 (Standard Card) -->
    <div v-if="layout === 'card'" class="card-frame">
      <img class="card-bg-image" v-if="card?.image" :src="card.image" @error="hideImg" />
      <div class="card-overlay"></div>
      <div class="card-faction-badge" v-if="card">
        <img :src="getFactionIcon(card?.faction)" class="faction-icon" />
      </div>
      <div class="card-health-container" v-if="card && (card.health !== undefined && card.health !== null)">
        <div v-for="i in Math.floor(card.startingHealth ?? card.health ?? 0)" :key="i" class="magatama">
          <img :src="getMagatamaSrc(i, card.health)" class="magatama-img" />
        </div>
      </div>
      <div class="card-name-panel" v-if="card">
        <div class="card-name-wrapper">
          <div class="card-appellation" v-if="card.title">{{ parseVertical(card.title) }}</div>
          <div class="card-name-vertical">{{ parseVertical(card.name) }}</div>
        </div>
      </div>
      <div class="card-skills-board" v-if="card">
        <div class="skills-list">
          <div v-for="skill in card.skills" :key="skill.skillName" class="skill-item">
            <div class="skill-header">
              <span class="skill-tag">【{{ skill.skillName }}】</span>
            </div>
            <span class="skill-description">{{ skill.skillDescription }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 横屏沉浸式预览模式 (Landscape Split View / 平铺技能) -->
    <div v-else-if="layout === 'split'" class="split-view">
      <!-- 左侧：武将形象与核心信息 -->
      <div class="left-card-area">
        <div class="card-frame mini">
           <img class="card-bg-image" v-if="card?.image" :src="card.image" />
           <div class="card-overlay"></div>
           <div class="card-faction-badge">
             <img :src="getFactionIcon(card?.faction)" class="faction-icon" />
           </div>
           <div class="card-name-panel">
            <div class="card-name-vertical">{{ parseVertical(card?.name) }}</div>
           </div>
        </div>
        <div class="card-health-row" v-if="card">
          <div v-for="i in Math.floor(card.startingHealth ?? (card.health ?? 0))" :key="i" class="magatama mini">
            <img :src="getMagatamaSrc(i, card.health)" class="magatama-img" />
          </div>
        </div>
      </div>

      <!-- 右侧：技能平铺显示 (无页眉导航) -->
      <div class="right-info-panel tiled-skills">
        <div class="skill-scroll-area">
          <div 
            v-for="skill in card?.skills" 
            :key="skill.skillName" 
            class="tiled-skill-item"
          >
            <h3 class="tiled-skill-name">【{{ skill.skillName }}】</h3>
            <p class="tiled-skill-desc">{{ skill.skillDescription }}</p>
          </div>
          <div v-if="!card?.skills || card.skills.length === 0" class="placeholder-tab">
            该武将暂无技能描述
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '../types';

const props = withDefaults(defineProps<{ 
  card: Character | null;
  layout?: 'card' | 'split';
}>(), {
  layout: 'card'
});

function hideImg(event: Event) {
  (event.target as HTMLImageElement).style.visibility = 'hidden';
}

function getFactionIcon(faction: string | undefined): string {
  const f = (faction || '').substring(0, 1);
  const map: Record<string, string> = {
    '魏': 'wei', '蜀': 'shu', '吴': 'wu', '群': 'qun', '晋': 'jin', '神': 'shen'
  };
  return `/assets/noname/group/${map[f] || 'qun'}.png`;
}

function getMagatamaSrc(index: number, currentHealth: number | null | undefined) {
  const cur = currentHealth ?? 0;
  
  if (index > cur) return '/assets/noname/hp/ol4.png';
  if (cur >= 3) return '/assets/noname/hp/ol1.png';
  if (cur === 2) return '/assets/noname/hp/ol2.png';
  return '/assets/noname/hp/ol3.png';
}

function parseVertical(text: string | undefined): string {
  if (!text) return '';
  return text.split('').join('\n');
}
</script>

<style scoped>
.card-details-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.card-details-container.placeholder { opacity: 0.3; }

.card-frame {
  width: 350px;
  height: 490px;
  border-radius: 12px;
  border: 4px solid #4a3e35;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), inset 0 0 0 2px #cfb78f;
  position: relative;
  overflow: hidden;
  background: url('/assets/noname/card/border_gold.jpg') no-repeat center center;
  background-size: cover;
  flex-shrink: 0;
}

[data-faction="魏"] .card-frame { border-color: var(--color-wei); box-shadow: 0 10px 30px rgba(45, 90, 136, 0.4), inset 0 0 0 2px #cfb78f; }
[data-faction="蜀"] .card-frame { border-color: var(--color-shu); box-shadow: 0 10px 30px rgba(179, 45, 45, 0.4), inset 0 0 0 2px #cfb78f; }
[data-faction="吴"] .card-frame { border-color: var(--color-wu); box-shadow: 0 10px 30px rgba(65, 130, 65, 0.4), inset 0 0 0 2px #cfb78f; }
[data-faction="群"] .card-frame { border-color: var(--color-qun); box-shadow: 0 10px 30px rgba(110, 110, 110, 0.4), inset 0 0 0 2px #cfb78f; }
[data-faction="神"] .card-frame { border-color: var(--color-shen); box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4), inset 0 0 0 2px #cfb78f; }

.card-bg-image {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover; object-position: center top; z-index: 1;
}

.card-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: 
    linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 30%),
    linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 20%);
  z-index: 2; pointer-events: none;
}

.card-faction-badge {
  position: absolute; top: 12px; left: 12px;
  width: 52px; height: 52px;
  z-index: 4; display: flex; align-items: center; justify-content: center;
}
.faction-icon {
  width: 100%; height: 100%; object-fit: contain;
  filter: drop-shadow(0 2px 10px rgba(0,0,0,0.8));
}

.card-health-container {
  position: absolute; top: 12px; left: 65px;
  display: flex; gap: 2px; z-index: 4;
}

.magatama {
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
}
.magatama-img {
  width: 100%; height: 100%; object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
}
.magatama.mini { width: 16px; height: 16px; }

.card-name-panel {
  position: absolute; top: 50px; left: 15px;
  z-index: 5;
}
.card-name-wrapper {
  display: flex; gap: 8px;
  align-items: flex-start;
}

.card-appellation {
  white-space: pre-line; font-size: 14px; color: #ffeb3b;
  line-height: 1.1; text-shadow: 1px 1px 2px #000;
  margin-top: 15px; letter-spacing: 2px;
  font-weight: bold;
}
.card-name-vertical {
  white-space: pre-line; 
  font-size: 38px; 
  font-weight: 900; 
  color: #fff;
  line-height: 1.0; 
  letter-spacing: 2px;
  /* 核心艺术字特效：描边 + 多重投影 */
  -webkit-text-stroke: 1.5px #000;
  text-shadow: 
    2px 2px 0px #000,
    0 0 10px rgba(0,0,0,0.8),
    0 0 20px rgba(255,255,255,0.2);
  filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
}

.card-skills-board {
  position: absolute; bottom: 8px; left: 50%;
  transform: translateX(-50%);
  width: 95%; height: 40%;
  /* 毛玻璃质感背景 */
  background: linear-gradient(135deg, rgba(30,25,20,0.85) 0%, rgba(15,10,5,0.92) 100%);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(200,180,150,0.3);
  border-radius: 4px;
  z-index: 3; padding: 12px; display: flex; flex-direction: column;
  box-shadow: 0 -5px 15px rgba(0,0,0,0.4);
}

.skills-list {
  display: flex; flex-direction: column; gap: 10px;
  overflow-y: auto; scrollbar-width: none;
}
.skills-list::-webkit-scrollbar { display: none; }
.skill-item { color: #e5dfd9; font-size: 13px; line-height: 1.5; text-align: justify; }

.skill-header { margin-bottom: 4px; }
.skill-tag { 
  display: inline-block;
  background: linear-gradient(to bottom, #d4b483, #8c6e4a);
  color: #000;
  font-weight: 900;
  font-size: 12px;
  padding: 2px 10px;
  /* 平行四边形标签效果 */
  clip-path: polygon(0 0, 92% 0, 100% 100%, 8% 100%);
  text-shadow: none;
}
.skill-description { 
  display: block; 
  padding-left: 5px;
  border-left: 1px solid rgba(212,180,131,0.3);
}

/* --- Split View 特定样式 (平铺技能) --- */
.split-view {
  display: flex; width: 100%; max-width: 950px;
  height: clamp(350px, 75vh, 520px); gap: 20px;
  background: rgba(20, 15, 10, 0.7);
  padding: 20px; border-radius: 12px;
  border: 1px solid #5a4a3a;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.8);
}

.left-card-area {
  flex: 0 0 260px; display: flex; flex-direction: column;
  align-items: center; gap: 15px;
}
.card-frame.mini { width: 220px; height: 308px; border-width: 2px; }
.card-frame.mini .card-name-vertical { font-size: 24px; }
.card-health-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }

.right-info-panel.tiled-skills {
  flex: 1; display: flex; flex-direction: column;
  background: 
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"),
    rgba(43, 37, 33, 0.9);
  border: 1px solid #5a4a3a; border-radius: 8px;
  box-shadow: inset 0 0 30px rgba(0,0,0,0.6);
  overflow: hidden;
}

.skill-scroll-area {
  flex: 1; padding: 25px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 25px;
  scrollbar-width: thin; scrollbar-color: #5a4a3a transparent;
}
.skill-scroll-area::-webkit-scrollbar { width: 6px; }
.skill-scroll-area::-webkit-scrollbar-thumb { background: #5a4a3a; border-radius: 3px; }

.tiled-skill-item {
  position: relative; padding-bottom: 20px;
  border-bottom: 1px solid rgba(132, 116, 101, 0.2);
}
.tiled-skill-item:last-child { border-bottom: none; }

.tiled-skill-name {
  color: #ffe066; font-size: 18px; margin-bottom: 12px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  display: flex; align-items: center; gap: 10px;
}
.tiled-skill-name::after {
  content: ""; flex: 1; height: 1px;
  background: linear-gradient(to right, rgba(255, 224, 102, 0.3), transparent);
}

.tiled-skill-desc {
  color: #e5dfd9; line-height: 1.7; font-size: 15px;
  text-align: justify; word-break: break-all;
}

.placeholder-tab {
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  height: 100%; color: #8c7e73; font-style: italic;
}

@media screen and (orientation: portrait) {
  .split-view { flex-direction: column; height: auto; max-height: 85vh; width: 95vw; }
  .left-card-area { flex: 0 0 auto; margin-bottom: 10px; }
  .right-info-panel.tiled-skills { min-height: 250px; }
}

@media (max-width: 480px) {
  .card-frame:not(.mini) { width: 320px; height: 448px; }
  .tiled-skill-name { font-size: 16px; }
  .tiled-skill-desc { font-size: 14px; }
}
</style>