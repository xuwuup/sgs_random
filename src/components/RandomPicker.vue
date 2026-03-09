<template>
  <div class="random-picker">
    <label>
      数量:
      <input type="number" v-model.number="count" min="1" />
    </label>
    <button @click="pick" :disabled="characters.length === 0">
      随机抽取
    </button>
    <ul v-if="result.length">
      <li v-for="c in result" :key="c.name">{{ c.name }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Character } from '../types';
import { pickRandomCharacters } from '../utils/randomizer';

const props = defineProps<{ characters: Character[] }>();
const count = ref(3);
const result = ref<Character[]>([]);

function pick() {
  result.value = pickRandomCharacters(props.characters, count.value);
}

watch(
  () => props.characters,
  () => {
    result.value = [];
  }
);
</script>

<style scoped>
.random-picker {
  margin: 1em 0;
}
</style>