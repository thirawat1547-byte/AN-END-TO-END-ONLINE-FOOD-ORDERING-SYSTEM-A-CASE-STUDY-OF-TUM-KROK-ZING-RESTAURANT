import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import KitchenMonitor from '../KitchenMonitor.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/kitchen', component: { template: '<div />' } }],
})

describe('KitchenMonitor.vue', () => {
  beforeEach(async () => {
    await router.push('/kitchen')
  })

  it('renders the page header correctly', () => {
    const wrapper = mount(KitchenMonitor, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('ออเดอร์ห้องครัว')
    expect(wrapper.text()).toContain('Kitchen Display System')
  })

  it('shows both tabs: Incoming and Completed', () => {
    const wrapper = mount(KitchenMonitor, { global: { plugins: [router] } })
    const text = wrapper.text()
    expect(text).toContain('ออเดอร์ใหม่ (Incoming)')
    expect(text).toContain('เสร็จสิ้น (Completed)')
  })

  it('displays order cards on the Incoming tab by default', () => {
    const wrapper = mount(KitchenMonitor, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('T-03')
    expect(wrapper.text()).toContain('T-07')
  })

  it('shows serve button for incoming orders', () => {
    const wrapper = mount(KitchenMonitor, { global: { plugins: [router] } })
    const serveButtons = wrapper.findAll('button').filter(b => b.text().includes('เสิร์ฟ'))
    expect(serveButtons.length).toBeGreaterThan(0)
  })

  it('moves order to Completed tab when Serve is clicked', async () => {
    const wrapper = mount(KitchenMonitor, { global: { plugins: [router] } })
    const initialIncoming = wrapper.findAll('button').filter(b => b.text().includes('เสิร์ฟ')).length

    // Click first serve button
    const firstServeBtn = wrapper.findAll('button').find(b => b.text().includes('เสิร์ฟ'))
    await firstServeBtn.trigger('click')

    const newServeButtons = wrapper.findAll('button').filter(b => b.text().includes('เสิร์ฟ'))
    expect(newServeButtons.length).toBe(initialIncoming - 1)
  })

  it('switches to Completed tab and shows recall button', async () => {
    const wrapper = mount(KitchenMonitor, { global: { plugins: [router] } })

    const tabs = wrapper.findAll('button').filter(b => b.text().includes('เสร็จสิ้น'))
    await tabs[0].trigger('click')

    expect(wrapper.text()).toContain('ดึงออเดอร์กลับ')
  })

  it('moves order back to Incoming when recall is clicked', async () => {
    const wrapper = mount(KitchenMonitor, { global: { plugins: [router] } })

    // Switch to completed tab
    const completedTab = wrapper.findAll('button').find(b => b.text().includes('เสร็จสิ้น (Completed)'))
    await completedTab.trigger('click')

    const initialRecallBtns = wrapper.findAll('button').filter(b => b.text().includes('ดึงออเดอร์กลับ')).length
    const firstRecall = wrapper.findAll('button').find(b => b.text().includes('ดึงออเดอร์กลับ'))
    await firstRecall.trigger('click')

    const newRecallBtns = wrapper.findAll('button').filter(b => b.text().includes('ดึงออเดอร์กลับ')).length
    expect(newRecallBtns).toBe(initialRecallBtns - 1)
  })

  it('displays order notes if present', () => {
    const wrapper = mount(KitchenMonitor, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('ไม่เผ็ด')
    expect(wrapper.text()).toContain('เส้นไม่เละ')
  })

  it('shows notification badge with incoming orders count', () => {
    const wrapper = mount(KitchenMonitor, { global: { plugins: [router] } })
    // Badge should show 4 (initial incoming orders count)
    const spans = wrapper.findAll('span').filter(s => s.text() === '4')
    expect(spans.length).toBeGreaterThan(0)
  })
})
