export interface Skill {
  skillName: string;
  skillDescription: string;
}

export interface Character {
  name: string;
  title?: string;
  image?: string;
  faction?: string;
  faction2?: string;
  gender?: string;
  health?: number;
  startingHealth?: number;
  initialArmor?: number;
  skills?: Skill[];

  // 以下为运行时由脚本添加的元数据
  parentPackName?: string;
  subPackName?: string;
  displayPack?: string;
}

export interface PackInfo {
  id: string;
  folder: string;
  nameForCheckbox: string;
}

export interface Pack {
  id: string;
  name?: string;
  version?: string;
  characters: Character[];
  dependencies?: string[];
}