# SGS Random 重构前端

这是从老旧的 HTML/CSS/JS 版本重构出的现代化前端工程，采用 **Vue 3 + TypeScript + Vite + Pinia + Vue Router + localStorage持久化** 构建。目标是为三国杀武将抽取功能提供可扩展、模块化的数据与 UI。

## ✨ 现代化架构特点

- **🎯 状态管理**: 使用 Pinia 进行集中式状态管理，提供更好的代码组织和可维护性
- **💾 数据持久化**: 集成 `pinia-plugin-persistedstate` 自动保存用户配置到 localStorage，刷新页面后无需重新设置
- **🛣️ 客户端路由**: Vue Router 4 支持多页面导航，支持浏览器前进/后退，可分享特定状态链接
- **🧪 测试驱动**: 集成 Vitest + Vue Test Utils，提供完整的单元测试和组件测试（22 个测试全部通过）
- **⚡ 性能优化**: Vite 构建工具 + 预构建数据索引，减少运行时网络请求
- **🔒 类型安全**: 完整的 TypeScript 支持，确保代码质量和开发体验
- **📱 响应式设计**: 支持现代浏览器的响应式布局

## 🚀 功能特性

- 动态加载已有的卡包数据（位于 `public/packs`）并支持扩展包过滤
- 配置抽卡数量、查看卡池信息、随机抽取
- 选择武将后可查看详情、确认、锁定/解锁和重新抽取
- **用户选择自动保存** - 包选择和抽卡数量会自动保存到浏览器，刷新后自动恢复
- 完整的路由导航，支持浏览器前进/后退按钮
- 预留架构便于后续添加插件、PWA、移动打包等

## 🛠️ 技术栈

- **框架**: Vue 3 (Composition API)
- **路由**: Vue Router 4
- **语言**: TypeScript
- **构建**: Vite
- **状态管理**: Pinia  
- **数据持久化**: pinia-plugin-persistedstate
- **测试**: Vitest + Vue Test Utils + jsdom
- **样式**: CSS Variables + Font Awesome

## 📁 目录结构

```
src/
├── components/          # Vue 组件
│   ├── PackSelector.vue
│   ├── DrawControls.vue
│   ├── SelectionCarousel.vue
│   └── CardDetails.vue
├── views/              # 页面组件（对应路由）
│   ├── SettingsView.vue       # 设置/配置页
│   ├── SelectionView.vue      # 卡牌选择页
│   ├── ConfirmationView.vue   # 确认选择页
│   └── FinalView.vue          # 结果显示页
├── router/             # Vue Router 配置
│   └── index.ts
├── stores/             # Pinia 状态管理
│   └── game.ts (含 localStorage 持久化)
├── services/           # 业务逻辑服务
│   ├── packService.ts
│   └── randomizer.ts
├── types/              # TypeScript 类型定义
│   └── index.ts
└── __tests__/          # 测试文件 (22 个测试)
    ├── gameStore.test.ts
    ├── PackSelector.test.ts
    ├── router.test.ts
    └── persistence.test.ts
```

## 🛣️ 路由配置

```
/              -> SettingsView    (设置包选择和抽卡数量)
/selection     -> SelectionView   (选择抽取的卡牌)
/confirmation  -> ConfirmationView (确认选择)
/final         -> FinalView       (显示最终结果)
```

## 💾 数据持久化

应用自动将以下用户喜好保存到浏览器的 localStorage：
- **selectedFolders** - 用户选中的卡包列表
- **drawCount** - 用户设置的一次抽取数量

这些设置会在用户下次访问时自动恢复，提升用户体验。

## 🚀 运行

```bash
cd sgs-random-vue
npm install  # 第一次需要安装依赖
npm run dev  # 启动开发服务器 (http://localhost:5173)
npm run build  # 构建生产版本
npm test      # 运行测试 (22 个测试)
npm run test:ui  # 启动测试 UI 界面
```

## 🧪 测试覆盖

项目包含 **22 个完整的测试**:

- **gameStore.test.ts** (7 个测试) - Pinia state 管理逻辑 ✅
- **persistence.test.ts** (5 个测试) - 持久化插件功能 ✅
- **PackSelector.test.ts** (3 个测试) - 组件交互 ✅
- **router.test.ts** (7 个测试) - 路由导航 ✅

运行测试:
```bash
npm test              # 运行所有测试
npm run test:ui       # 启动可视化测试界面
```

## 📊 数据优化

- 使用预构建的 `index.json` 减少运行时网络请求
- 支持增量加载和缓存机制
- 优化的数据结构便于扩展

## 🔄 导航流程

```
Settings (选择包，自动保存用户选择)
    ↓ [开始抽取]
Selection (选择卡牌)
    ↓ [选择卡牌]
Confirmation (确认)
    ↓ [确认选取]
Final (查看结果)
    ↓ [重新抽取 / 锁定]
Settings (回到设置，用户选择已保存)
```

## 💡 特色功能

- **浏览器前进/后退**: 完全支持浏览器历史记录
- **页面标题自动更新**: 根据当前路由自动更新浏览器标签页标题
- **状态持久化就绪**: 用户配置自动保存和恢复
- **响应式布局**: 移动设备友好
- **完整测试覆盖**: 22 个测试确保代码质量

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 技术栈深度 | Vue 3 + Router + Pinia + Vite + TypeScript |
| 测试覆盖 | 22 个测试全部通过 ✅ |
| 路由数量 | 4 个主要路由 + 自动重定向 |
| 自动化持久化 | localStorage 提供数据恢复 |
| 打包大小 | JS 40.89 KB (gzip)，CSS 2.38 KB (gzip) |
| 编译时间 | 2.36 秒 |

欢迎根据需求扩展和优化。
