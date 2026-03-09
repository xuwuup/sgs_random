<template>
  <div class="character-list">
    <h2>武将列表</h2>
    <div v-if="characters.length === 0">暂无武将</div>
    <ul>
      <li v-for="c in characters" :key="c.name" class="character-item">
        <img v-if="c.image" :src="c.image" :alt="c.name" class="thumb" />
        <span>{{ c.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '../types';

const props = defineProps<{
  characters: Character[];
}>();
</script>

<style scoped>
.character-item {
  list-style: none;
  display: flex;
  align-items: center;
  margin: 0.5em 0;
}
.thumb {
  width: 40px;
  height: 40px;
  margin-right: 0.5em;
  object-fit: cover;
}
</style>