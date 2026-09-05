import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Sidebar from '../Sidebar.vue'

// Mock router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/kitchen', component: { template: '<div />' } },
    { path: '/kitchen/inventory', component: { template: '<div />' } },
    { path: '/kitchen/reports', component: { template: '<div />' } },
    { path: '/kitchen/tables', component: { template: '<div />' } },
    { path: '/login', component: { template: '<div />' } },
  ],
})

describe('Sidebar.vue', () => {
  it('renders the restaurant logo and name', async () => {
    await router.push('/kitchen')
    const wrapper = mount(Sidebar, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('TumKrokZing')
    expect(wrapper.text()).toContain('Chef Station 1')
  })

  it('renders 4 navigation menu items', async () => {
    await router.push('/kitchen')
    const wrapper = mount(Sidebar, { global: { plugins: [router] } })
    const links = wrapper.findAll('a')
    expect(links.length).toBe(4)
  })

  it('shows all correct menu labels', async () => {
    await router.push('/kitchen')
    const wrapper = mount(Sidebar, { global: { plugins: [router] } })
    const text = wrapper.text()
    expect(text).toContain('ออเดอร์ปัจจุบัน')
    expect(text).toContain('สต็อกสินค้า')
    expect(text).toContain('รายงาน')
    expect(text).toContain('จัดการโต๊ะ')
  })

  it('has a logout button', async () => {
    await router.push('/kitchen')
    const wrapper = mount(Sidebar, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('ออกจากระบบ')
  })

  it('logout button navigates to /login', async () => {
    await router.push('/kitchen')
    const wrapper = mount(Sidebar, { global: { plugins: [router] } })
    const logoutBtn = wrapper.find('button')
    await logoutBtn.trigger('click')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('active route highlights the correct menu item', async () => {
    await router.push('/kitchen/inventory')
    await router.isReady()
    const wrapper = mount(Sidebar, { global: { plugins: [router] } })
    const activeLink = wrapper.find('a.bg-white')
    expect(activeLink.exists()).toBe(true)
    expect(activeLink.text()).toContain('สต็อกสินค้า')
  })
})
