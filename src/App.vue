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
    <h1>三国杀武将抽卡器</h1>
    <RouterView />
  </div>
</template>

<style>
#app {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

h1 {
  text-align: center;
  font-size: 2.2em;
  color: var(--color-primary);
  text-shadow: 2px 2px 4px rgba(59, 45, 33, 0.3);
  letter-spacing: 2px;
}

.view {
  margin-top: 1.5rem;
}
</style>
