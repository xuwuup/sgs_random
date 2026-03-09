import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import SettingsView from '../views/SettingsView.vue'
import SelectionView from '../views/SelectionView.vue'
import ConfirmationView from '../views/ConfirmationView.vue'
import FinalView from '../views/FinalView.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Settings',
    component: SettingsView,
    meta: { title: '设置 - 三国杀武将抽卡器' }
  },
  {
    path: '/selection',
    name: 'Selection',
    component: SelectionView,
    meta: { title: '选择 - 三国杀武将抽卡器' }
  },
  {
    path: '/confirmation',
    name: 'Confirmation',
    component: ConfirmationView,
    meta: { title: '确认 - 三国杀武将抽卡器' }
  },
  {
    path: '/final',
    name: 'Final',
    component: FinalView,
    meta: { title: '结果 - 三国杀武将抽卡器' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 更新页面标题
router.afterEach((to) => {
  document.title = (to.meta.title as string) || '三国杀武将抽卡器'
})

export default router
