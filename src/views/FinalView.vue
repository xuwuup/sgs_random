<template>
  <section class="final-view immersive-mode">
    <!-- 1. 助手模式主体：大号体力管理 (勾玉血量界面) -->
    <div class="helper-container">
      <!-- 左上角微缩头像：点击触发技能浮层 -->
      <div class="mini-avatar-box left-top" @click="showSkillOverlay = !showSkillOverlay">
        <img :src="drawStore.confirmedCard?.image" class="mini-img" />
        <div class="mini-name">{{ drawStore.confirmedCard?.name }}</div>
        <div class="exit-hint">点击看技能</div>
      </div>

      <!-- 右上角返回按钮 -->
      <div class="top-right-actions">
        <button class="button button--secondary btn-small" @click="handleRedraw">重新抽取</button>
      </div>

      <!-- 主体：大号体力管理 -->
      <div class="health-tracker">
        <h2 class="helper-title">线下体力同步</h2>
        <div class="magatama-giant-row">
          <div 
            v-for="i in drawStore.maxHealth" 
            :key="i"
            class="magatama-giant"
            :class="getMagatamaClass(i)"
            @click="drawStore.currentHealth = i"
          >
            <img :src="getMagatamaSrc(i)" class="magatama-icon" />
          </div>
        </div>
        <div class="health-controls">
          <button class="health-btn minus" @click="drawStore.changeHealth(-1)">-</button>
          <span class="health-num">{{ drawStore.currentHealth }} / {{ drawStore.maxHealth }}</span>
          <button class="health-btn plus" @click="drawStore.changeHealth(1)">+</button>
        </div>
      </div>

      <!-- 技能详情浮层 (缩略图预览) -->
      <Transition name="fade">
        <div v-if="showSkillOverlay" class="skill-overlay" @click.self="showSkillOverlay = false">
          <div class="overlay-content">
             <CardDetails :card="drawStore.confirmedCard" layout="split" />
             <button class="close-overlay" @click="showSkillOverlay = false">×</button>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDrawStore } from '../stores/drawStore'
import CardDetails from '../components/CardDetails.vue'

const router = useRouter()
const drawStore = useDrawStore()
const showSkillOverlay = ref(false)

function handleRedraw() {
  drawStore.reset()
  router.push('/')
}

function getMagatamaSrc(index: number) {
  if (index > drawStore.currentHealth) return '/assets/noname/hp/ol4.png';
  
  // 根据剩余血量百分比或绝对值决定颜色
  if (drawStore.currentHealth >= 3) return '/assets/noname/hp/ol1.png';
  if (drawStore.currentHealth === 2) return '/assets/noname/hp/ol2.png';
  return '/assets/noname/hp/ol3.png';
}

function getMagatamaClass(index: number) {
  return {
    lost: index > drawStore.currentHealth,
    active: index === drawStore.currentHealth
  };
}
</script>

<style scoped>
.final-view {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0; left: 0;
  background: url('/assets/noname/background/main_bg.jpg') no-repeat center center;
  background-size: cover;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000; /* 确保覆盖所有内容，包括 App.vue 的 h1 */
}

.helper-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 左上角头像 */
.mini-avatar-box.left-top {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 90px;
  background: #3d342d;
  border: 2px solid #cfb78f;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.6);
  cursor: pointer;
  z-index: 50;
  transition: transform 0.2s;
}
.mini-avatar-box:hover { transform: scale(1.05); }

.mini-img { width: 100%; height: 70px; object-fit: cover; border-radius: 4px; }
.mini-name { font-size: 13px; text-align: center; color: #fff; margin-top: 3px; font-weight: bold; }
.exit-hint { font-size: 9px; color: #a69888; text-align: center; }

/* 右上角操作 */
.top-right-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 50;
}
.btn-small { padding: 8px 15px; font-size: 13px; }

/* 体力管理区 */
.health-tracker {
  background: rgba(43, 37, 33, 0.85);
  padding: 50px 60px;
  border-radius: 20px;
  border: 1px solid #5a4a3a;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.4);
}
.helper-title { color: #ffe066; margin-bottom: 40px; font-size: 26px; letter-spacing: 4px; }

.magatama-giant-row {
  display: flex; justify-content: center; gap: 20px; margin-bottom: 50px;
}
.magatama-giant {
  width: 70px; height: 70px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex; align-items: center; justify-content: center;
}
.magatama-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
}
.magatama-giant:active { transform: scale(0.9); }
.magatama-giant.lost .magatama-icon {
  opacity: 0.3;
  filter: grayscale(1);
}
.magatama-giant.active .magatama-icon {
  filter: drop-shadow(0 0 10px #ffe066);
}

.health-controls { display: flex; align-items: center; justify-content: center; gap: 40px; }
.health-btn {
  width: 50px; height: 50px; border-radius: 50%;
  border: 2px solid #ffe066; background: transparent;
  color: #ffe066; font-size: 24px; cursor: pointer;
}
.health-btn:active { background: #ffe066; color: #000; }
.health-num { font-size: 48px; color: #fff; font-weight: bold; min-width: 140px; text-shadow: 0 0 10px rgba(0,0,0,0.5); }

/* 技能详情浮层 */
.skill-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
}
.overlay-content {
  position: relative;
  width: 90%; max-width: 950px;
}
.close-overlay {
  position: absolute; top: -40px; right: 0;
  background: transparent; border: none; color: #fff;
  font-size: 36px; cursor: pointer;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media screen and (orientation: portrait) {
  .health-tracker { padding: 30px; width: 90%; }
  .magatama-giant { width: 45px; height: 60px; }
  .health-num { font-size: 32px; min-width: 100px; }
}
</style>
