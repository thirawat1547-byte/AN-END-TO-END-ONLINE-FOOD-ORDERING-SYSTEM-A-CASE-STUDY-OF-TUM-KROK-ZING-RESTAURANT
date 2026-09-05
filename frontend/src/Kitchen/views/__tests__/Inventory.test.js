import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Inventory from '../Inventory.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/kitchen/inventory', component: { template: '<div />' } }],
})

describe('Inventory.vue', () => {
  it('renders the page header', async () => {
    await router.push('/kitchen/inventory')
    const wrapper = mount(Inventory, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('จัดการสต็อกสินค้า')
    expect(wrapper.text()).toContain('Inventory Management')
  })

  it('renders category filter buttons', async () => {
    await router.push('/kitchen/inventory')
    const wrapper = mount(Inventory, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('ทั้งหมด')
    expect(wrapper.text()).toContain('อาหาร')
    expect(wrapper.text()).toContain('เครื่องดื่ม')
  })

  it('shows all 12 menu items by default', async () => {
    await router.push('/kitchen/inventory')
    const wrapper = mount(Inventory, { global: { plugins: [router] } })
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(12)
  })

  it('filters to show only food items when food category is clicked', async () => {
    await router.push('/kitchen/inventory')
    const wrapper = mount(Inventory, { global: { plugins: [router] } })
    const foodBtn = wrapper.findAll('button').find(b => b.text() === 'อาหาร')
    await foodBtn.trigger('click')
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(8)
  })

  it('filters to show only drink items when drink category is clicked', async () => {
    await router.push('/kitchen/inventory')
    const wrapper = mount(Inventory, { global: { plugins: [router] } })
    const drinkBtn = wrapper.findAll('button').find(b => b.text() === 'เครื่องดื่ม')
    await drinkBtn.trigger('click')
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(4)
  })

  it('filters items by search input', async () => {
    await router.push('/kitchen/inventory')
    const wrapper = mount(Inventory, { global: { plugins: [router] } })
    const input = wrapper.find('input[type="text"]')
    await input.setValue('มะนาว')
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(1)
    expect(wrapper.text()).toContain('น้ำมะนาว')
  })

  it('shows empty state when search has no results', async () => {
    await router.push('/kitchen/inventory')
    const wrapper = mount(Inventory, { global: { plugins: [router] } })
    const input = wrapper.find('input[type="text"]')
    await input.setValue('xxxxxxxxxx')
    expect(wrapper.text()).toContain('ไม่พบรายการที่ค้นหา')
  })

  it('toggles item availability when switch is clicked', async () => {
    await router.push('/kitchen/inventory')
    const wrapper = mount(Inventory, { global: { plugins: [router] } })

    // First item is "ข้าวผัดกระเพราหมูสับ" which is available
    const toggleBtns = wrapper.findAll('button').filter(b => b.classes().some(c => c.includes('rounded-full') && b.html().includes('translate')))
    const firstToggle = toggleBtns[0]
    const initialText = wrapper.text()

    await firstToggle.trigger('click')

    // Text should change (either มีสินค้า→สินค้าหมด or vice versa)
    const newText = wrapper.text()
    expect(newText).not.toBe(initialText)
  })

  it('shows correct status count in header', async () => {
    await router.push('/kitchen/inventory')
    const wrapper = mount(Inventory, { global: { plugins: [router] } })
    // 10 available out of 12 (ผัดไทยกุ้งสด and แกงเขียวหวานไก่ are unavailable)
    expect(wrapper.text()).toContain('10 / 12')
  })
})
