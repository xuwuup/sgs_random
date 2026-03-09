import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PackSelector from '../components/PackSelector.vue'
import type { PackInfo } from '../types'

describe('PackSelector', () => {
  const mockPacks: PackInfo[] = [
    { id: 'test-pack-1', folder: 'test1', nameForCheckbox: 'Test Pack 1' },
    { id: 'test-pack-2', folder: 'test2', nameForCheckbox: 'Test Pack 2' }
  ]

  it('renders pack checkboxes', () => {
    const wrapper = mount(PackSelector, {
      props: {
        packs: mockPacks,
        modelValue: []
      }
    })

    expect(wrapper.text()).toContain('Test Pack 1')
    expect(wrapper.text()).toContain('Test Pack 2')

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(2)
  })

  it('emits update:modelValue when checkbox changes', async () => {
    const wrapper = mount(PackSelector, {
      props: {
        packs: mockPacks,
        modelValue: []
      }
    })

    const firstCheckbox = wrapper.find('input[type="checkbox"]')
    await firstCheckbox.setValue(true)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['test1']])
  })

  it('shows loading state when no packs', () => {
    const wrapper = mount(PackSelector, {
      props: {
        packs: [],
        modelValue: []
      }
    })

    expect(wrapper.text()).toContain('加载中...')
  })
})