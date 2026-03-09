import type { Character } from '../types';

/**
 * 从字符数组中随机选择指定数量的元素
 * 如果数量大于数组长度，会直接返回乱序数组
 */
export function pickRandom<T>(items: T[], count: number): T[] {
  const clone = items.slice();
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = clone[i]!;
    clone[i] = clone[j] as T;
    clone[j] = temp;
  }
  return clone.slice(0, count);
}

export function pickRandomCharacters(characters: Character[], count: number): Character[] {
  return pickRandom(characters, count);
}
