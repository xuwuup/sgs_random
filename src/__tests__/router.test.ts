import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '../router'

describe('Router Configuration', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes
    })
  })

  it('should have all required routes', () => {
    const routeNames = router.getRoutes().map(r => r.name)
    
    expect(routeNames).toContain('Settings')
    expect(routeNames).toContain('Selection')
    expect(routeNames).toContain('Confirmation')
    expect(routeNames).toContain('Final')
  })

  it('should navigate to settings page by default', async () => {
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('Settings')
  })

  it('should navigate to selection page', async () => {
    await router.push('/selection')
    expect(router.currentRoute.value.name).toBe('Selection')
  })

  it('should navigate to confirmation page', async () => {
    await router.push('/confirmation')
    expect(router.currentRoute.value.name).toBe('Confirmation')
  })

  it('should navigate to final page', async () => {
    await router.push('/final')
    expect(router.currentRoute.value.name).toBe('Final')
  })

  it('should redirect unknown routes to home', async () => {
    await router.push('/unknown-route')
    expect(router.currentRoute.value.name).toBe('Settings')
  })

  it('should have correct meta titles', () => {
    const routes = router.getRoutes()
    
    const settingsRoute = routes.find(r => r.name === 'Settings')
    expect(settingsRoute?.meta?.title).toContain('设置')

    const selectionRoute = routes.find(r => r.name === 'Selection')
    expect(selectionRoute?.meta?.title).toContain('选择')

    const confirmationRoute = routes.find(r => r.name === 'Confirmation')
    expect(confirmationRoute?.meta?.title).toContain('确认')

    const finalRoute = routes.find(r => r.name === 'Final')
    expect(finalRoute?.meta?.title).toContain('结果')
  })
})