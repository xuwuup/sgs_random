<template>
  <div class="card-details" :data-faction="card?.faction || ''" :class="{placeholder: !card}">
    <div class="card-frame">
      <!-- 全幅底图 -->
      <img
        class="card-bg-image"
        v-if="card?.image"
        :src="card.image"
        :alt="card.name + ' 武将图片'"
        @error="hideImg"
      />
      
      <!-- 卡牌蒙版与边框修饰 -->
      <div class="card-overlay"></div>

      <!-- 左上角：势力标识 -->
      <div class="card-faction-badge" v-if="card">
        {{ card.faction?.charAt(0) || '?' }}
      </div>

      <!-- 顶部：勾玉 (体力值) -->
      <div class="card-health-container" v-if="card && (card.health !== undefined && card.health !== null)">
        <div 
          v-for="i in Math.floor(card.health)" 
          :key="'health'+i" 
          class="magatama"
          :class="{'magatama-lost': (card.startingHealth ?? card.health) < i}"
        ></div>
        <div v-if="card.health % 1 !== 0" class="magatama half"></div>
      </div>

      <!-- 左侧垂直信息面板：武将称号与名字 -->
      <div class="card-name-panel" v-if="card">
        <div class="card-title-vertical" v-if="card.title">{{ parseVertical(card.title) }}</div>
        <div class="card-name-vertical">{{ parseVertical(card.name) }}</div>
      </div>

      <!-- 底部：技能遮罩板 -->
      <div class="card-skills-board" v-if="card">
        <div class="skills-list">
          <div v-if="!card.skills || card.skills.length === 0" class="no-skills">
            该武将无特殊技能。
          </div>
          <div v-for="skill in card?.skills || []" :key="skill.skillName" class="skill-item">
            <span class="skill-name">【{{ skill.skillName }}】</span>
            <span class="skill-description">{{ skill.skillDescription }}</span>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '../types';

const props = defineProps<{ card: Character | null }>();

function hideImg(event: Event) {
  (event.target as HTMLImageElement).style.visibility = 'hidden';
}

function parseVertical(text: string | undefined): string {
  if (!text) return '';
  return text.split('').join('\n');
}
</script>

<style scoped>
.card-details {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.card-details.placeholder {
  opacity: 0.3;
}

.card-frame {
  width: 350px;
  height: 490px;
  border-radius: 12px;
  border: 4px solid #4a3e35;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 0 2px #cfb78f;
  position: relative;
  overflow: hidden;
  background-color: #d1bfae; /* 无图时的古风纸色 */
}

/* 势力判定修饰边框（可选，强化派系颜色） */
.card-details[data-faction="魏"] .card-frame { border-color: var(--color-wei); box-shadow: 0 10px 30px rgba(45, 90, 136, 0.4), inset 0 0 0 2px #cfb78f; }
.card-details[data-faction="蜀"] .card-frame { border-color: var(--color-shu); box-shadow: 0 10px 30px rgba(179, 45, 45, 0.4), inset 0 0 0 2px #cfb78f; }
.card-details[data-faction="吴"] .card-frame { border-color: var(--color-wu); box-shadow: 0 10px 30px rgba(65, 130, 65, 0.4), inset 0 0 0 2px #cfb78f; }
.card-details[data-faction="群"] .card-frame { border-color: var(--color-qun); box-shadow: 0 10px 30px rgba(110, 110, 110, 0.4), inset 0 0 0 2px #cfb78f; }
.card-details[data-faction="神"] .card-frame { border-color: var(--color-shen); box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4), inset 0 0 0 2px #cfb78f; }
.card-details[data-faction="晋"] .card-frame { border-color: var(--color-jin); }

/* 全底图插画 */
.card-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  z-index: 1;
}

/* 一层四周向内渐变的黑色蒙版，让文字可读 */
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 25%),
    linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 15%);
  z-index: 2;
  pointer-events: none;
}

/* 势力徽章（左上角） */
.card-faction-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #555;
  color: #fff;
  font-family: var(--font-family-base);
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  border: 2px solid #cfb78f;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

.card-details[data-faction="魏"] .card-faction-badge { background: linear-gradient(135deg, #4b83b8, var(--color-wei)); }
.card-details[data-faction="蜀"] .card-faction-badge { background: linear-gradient(135deg, #d44d4d, var(--color-shu)); }
.card-details[data-faction="吴"] .card-faction-badge { background: linear-gradient(135deg, #62b362, var(--color-wu)); }
.card-details[data-faction="群"] .card-faction-badge { background: linear-gradient(135deg, #999, var(--color-qun)); }
.card-details[data-faction="神"] .card-faction-badge { background: linear-gradient(135deg, #ffe066, var(--color-shen)); color: #8c2222;}
.card-details[data-faction="晋"] .card-faction-badge { background: linear-gradient(135deg, #ab6ac9, var(--color-jin)); }

/* 勾玉体力区域 */
.card-health-container {
  position: absolute;
  top: 15px;
  left: 60px;
  display: flex;
  gap: 4px;
  z-index: 3;
}

.magatama {
  width: 18px;
  height: 24px;
  background-color: #c93630;
  border-radius: 50% 50% 50% 10% / 60% 60% 40% 10%;
  transform: rotate(-30deg);
  box-shadow: inset -2px -2px 4px rgba(0,0,0,0.5), 1px 1px 2px rgba(0,0,0,0.3);
  border: 1px solid #751410;
}

.magatama.half {
  background: linear-gradient(to right, #c93630 50%, rgba(200,200,200,0.3) 50%);
}

.magatama-lost {
  background-color: rgba(200, 200, 200, 0.3);
  box-shadow: inset -2px -2px 4px rgba(0,0,0,0.2);
  border-color: rgba(100,100,100,0.4);
}

/* 名称和称号面板 */
.card-name-panel {
  position: absolute;
  top: 60px;
  left: 10px;
  display: flex;
  gap: 5px;
  z-index: 3;
}

.card-title-vertical {
  white-space: pre-line;
  font-size: 16px;
  color: #cfb78f;
  line-height: 1.1;
  text-shadow: 1px 1px 2px #000;
  margin-top: 20px;
  letter-spacing: 2px;
}

.card-name-vertical {
  white-space: pre-line;
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  line-height: 1.1;
  text-shadow: 2px 2px 4px #000, 0 0 8px rgba(0,0,0,0.8);
  letter-spacing: 4px;
}

/* 技能半透明遮盖板 */
.card-skills-board {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 38%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0.95) 100%);
  z-index: 3;
  padding: 30px 15px 15px 15px;
  display: flex;
  flex-direction: column;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  /* 隐藏滚动条但保留功能 */
  scrollbar-width: none;
}
.skills-list::-webkit-scrollbar { display: none; }

.skill-item {
  color: #e5e5e5;
  font-size: 13.5px;
  line-height: 1.5;
  text-align: justify;
}

.skill-name {
  font-weight: bold;
  color: #ffe066; /* 亮金黄色 */
  text-shadow: 0 1px 2px #000;
  margin-left: -5px; /* 对齐书名号 */
}

.no-skills {
  color: #999;
  text-align: center;
  font-style: italic;
  margin-top: 10px;
}

/* 响应式自适应 */
@media (max-width: 480px) {
  .card-frame {
    width: 320px;
    height: 448px;
  }
  .card-skills-board {
    height: 42%;
  }
}
</style>