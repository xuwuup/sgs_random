import type { PackInfo, Character } from '../types';
import { request } from '../utils/request';

/**
 * 从 public/packs/packs.json 中获取包列表
 */
export async function fetchPackList(): Promise<PackInfo[]> {
  try {
    return await request<PackInfo[]>('/packs/packs.json');
  } catch (error) {
    console.error('获取包列表失败', error);
    throw new Error('无法加载包列表，请检查网络连接');
  }
}

// ----------------- 新增高效数据加载逻辑 -----------------
interface IndexData {
  packs: PackInfo[];
  characters: Record<string, Character[]>;
}

let indexCache: IndexData | null = null;

/**
 * 加载预构建的 index.json（包含所有包和武将数据）
 */
export async function loadIndex(): Promise<IndexData> {
  if (indexCache) return indexCache;
  try {
    indexCache = await request<IndexData>('/packs/index.json');
    return indexCache;
  } catch (error) {
    console.error('获取包数据索引失败', error);
    throw new Error('无法加载数据索引，请检查网络连接');
  }
}

/**
 * 根据选中的包 ID 列表，构建卡池
 * 现在只需一次 fetch，然后内存过滤
 */
export async function buildPool(folders: string[]): Promise<{ characters: Character[]; displayPacks: Set<string> }> {
  const index = await loadIndex();
  const pool: Character[] = [];
  const displayNames = new Set<string>();

  folders.forEach(folder => {
    const pack = index.packs.find(p => p.folder === folder);
    if (pack && index.characters[pack.id]) {
      const chars = index.characters[pack.id]!;
      pool.push(...chars);
      // 从第一个武将提取 displayPack（假设同包相同）
      const firstChar = chars[0];
      if (firstChar?.displayPack) {
        const mainPack = firstChar.displayPack.split(' - ')[0];
        if (mainPack) {
          displayNames.add(mainPack); // 提取主包名
        }
      }
    }
  });

  return { characters: pool, displayPacks: displayNames };
}

// ----------- 旧方法保留供参考，未来可移除 -----------
// 利用 Vite 的 glob 导入所有包内的 JSON 数据
// 返回 folder -> Character[] 映射
// 使用 query 选项替代已弃用的 as
const packModules = import.meta.glob('/packs/*/*.json?json');

/**
 * 加载指定目录下的所有 JSON 并合并为角色数组
 * 这个方法对打包后没有明确包名的场景有用，
 * 但它不会提供 displayPack 等元数据。
 */
export async function loadCharacters(folder: string): Promise<Character[]> {
  const keys = Object.keys(packModules).filter(k => k.includes(`/packs/${folder}/`));
  const results: Character[][] = await Promise.all(
    keys.map(k => packModules[k]?.() as Promise<Character[]>).filter(Boolean)
  );
  return results.flat();
}
