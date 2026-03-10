<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { usePackStore } from './stores/packStore'

// 初始化包列表
const packStore = usePackStore()

onMounted(() => {
  packStore.initializePacks()
})
</script>

<template>
  <div id="app">
    <!-- 横屏引导提示层 (仅在移动端竖屏显示) -->
    <div class="portrait-hint">
      <div class="hint-content">
        <div class="hint-icon">📱🔄</div>
        <p>推荐横屏模式使用</p>
        <p class="hint-sub">以获得手机版三国杀最佳体验</p>
      </div>
    </div>

    <h1>三国杀武将抽卡器</h1>
    <RouterView />
  </div>
</template>

<style>
#app {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 引导层样式 */
.portrait-hint {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--color-background);
  z-index: 9999;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

@media screen and (orientation: portrait) and (max-width: 768px) {
  .portrait-hint {
    display: flex;
  }
}

.hint-content {
  padding: 2rem;
  background: var(--color-surface);
  border-radius: var(--border-radius);
  border: 2px solid var(--color-primary);
  box-shadow: var(--box-shadow);
}

.hint-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: rotate-hint 2s infinite ease-in-out;
}

@keyframes rotate-hint {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(90deg); }
  75% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.hint-sub {
  font-size: 0.9em;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

h1 {
  text-align: center;
  font-size: clamp(1.5em, 5vw, 2.2em);
  color: var(--color-primary);
  text-shadow: 2px 2px 4px rgba(59, 45, 33, 0.3);
  letter-spacing: 2px;
  margin: 1rem 0;
}

.view {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
