<template>
  <section class="banner-view">
    <!-- Banner Background -->
    <div class="banner-background"></div>

    <!-- Top Left: Branding & Pool Info (acting as Banner Title) -->
    <div class="banner-header glass-panel">
      <h1 class="game-title">三国杀武将抽卡器</h1>
      <div class="pool-summary">
        <span class="pool-size">当前卡池容量: <strong>{{ packStore.poolSize }}</strong></span>
        <button class="btn-details" @click="showPackModal = true">卡包详情 / 切换</button>
      </div>
    </div>

    <!-- Bottom Right: Draw Controls -->
    <div class="banner-actions">
      <DrawControls
        v-model="drawStore.drawCount"
        :poolSize="packStore.poolSize"
        :displayPacks="displayPacksArray"
        @draw="handleDraw"
      />
    </div>

    <!-- Modal for Pack Selector -->
    <Transition name="fade">
      <div v-if="showPackModal" class="modal-overlay" @click.self="showPackModal = false">
        <div class="modal-content glass-panel">
          <button class="modal-close" @click="showPackModal = false">&times;</button>
          <PackSelector v-model="packStore.selectedFolders" :packs="packStore.packList" />
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePackStore } from '../stores/packStore'
import { useDrawStore } from '../stores/drawStore'
import PackSelector from '../components/PackSelector.vue'
import DrawControls from '../components/DrawControls.vue'

const router = useRouter()
const packStore = usePackStore()
const drawStore = useDrawStore()

const showPackModal = ref(false)
const displayPacksArray = computed(() => Array.from(packStore.displayPacks))

function handleDraw(count: number) {
  drawStore.drawCount = count
  drawStore.drawCards()
  router.push('/selection')
}
</script>

<style scoped>
.banner-view {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/banner_bg.png'); /* 动态生成的华丽背景 */
  background-size: cover;
  background-position: center;
  z-index: 1;
}

/* 顶部信息面板 */
.banner-header {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 10;
  padding: 15px 30px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.game-title {
  margin: 0;
  font-size: 28px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255, 215, 100, 0.5);
  font-family: var(--font-family-base);
  letter-spacing: 2px;
}

.pool-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #e5dfd9;
  font-size: 14px;
}

.pool-size strong {
  color: #ffeb3b;
  font-size: 18px;
}

.btn-details {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-details:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #ffeb3b;
}

/* 底部操作区 */
.banner-actions {
  position: absolute;
  bottom: 40px;
  right: 40px;
  z-index: 10;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  z-index: 110;
  line-height: 1;
}
.modal-close:hover {
  color: #ffeb3b;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media screen and (max-width: 768px) {
  .banner-header {
    top: 20px;
    left: 20px;
    right: 20px;
  }
  .banner-actions {
    bottom: 20px;
    right: 50%;
    transform: translateX(50%);
    width: 90%;
  }
}
</style>
