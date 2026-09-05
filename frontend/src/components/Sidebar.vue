<script setup>
import { useRoute, useRouter } from 'vue-router'
import logoImg from '@/assets/logo.png'

const route = useRoute()
const router = useRouter()

const navItems = [
  { label: 'ออเดอร์ปัจจุบัน', path: '/kitchen', type: 'receipt' },
  { label: 'สต็อกสินค้า', path: '/kitchen/inventory', type: 'archive' },
  { label: 'รายงาน', path: '/kitchen/reports', type: 'chart' },
  { label: 'จัดการโต๊ะ', path: '/kitchen/tables', type: 'qrcode' },
]

const isActive = (path) => {
  if (!route) return false
  if (path === '/kitchen') return route.path === '/kitchen'
  return route.path.startsWith(path)
}

const logout = () => {
  router.push('/login')
}
</script>

<template>
  <aside style="width: 288px; height: 100vh; background-color: #EFE8DD; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; user-select: none; flex-shrink: 0; border-right: 1px solid rgba(227,222,195,0.6); box-sizing: border-box;">
    <div>
      <!-- Logo Brand Section -->
      <div style="display: flex; align-items: center; gap: 12px; padding: 8px; margin-bottom: 16px;">
        <img
          :src="logoImg"
          alt="TumKrokZing Logo"
          style="width: 48px; height: 48px; object-fit: contain; flex-shrink: 0;"
        />
        <h1 style="font-weight: 700; font-size: 24px; color: #2D5A43; margin: 0; letter-spacing: -0.025em;">
          TumKrokZing
        </h1>
      </div>

      <!-- Station Badge -->
      <div style="display: flex; align-items: center; gap: 12px; padding: 0 8px; margin-bottom: 32px;">
        <div style="width: 40px; height: 40px; border-radius: 9999px; background-color: #CFDAD0; color: #3D634C; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          CS1
        </div>
        <span style="font-size: 14px; color: #5C5852; font-weight: 600;">Chef Station 1</span>
      </div>

      <!-- Navigation Links -->
      <nav style="display: flex; flex-direction: column; gap: 10px;">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          style="position: relative; display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-top-right-radius: 16px; border-bottom-right-radius: 16px; font-size: 16px; font-weight: 500; text-decoration: none; transition: all 0.15s ease;"
          :style="isActive(item.path) 
            ? 'background-color: #DCE0D3; color: #2E573F; font-weight: 700; box-shadow: 0 1px 2px rgba(0,0,0,0.05);' 
            : 'color: #5A554E;'"
          @mouseover="$event.currentTarget.style.backgroundColor = isActive(item.path) ? '#DCE0D3' : 'rgba(0,0,0,0.05)'; $event.currentTarget.style.color = isActive(item.path) ? '#2E573F' : '#2E312F';"
          @mouseleave="$event.currentTarget.style.backgroundColor = isActive(item.path) ? '#DCE0D3' : 'transparent'; $event.currentTarget.style.color = isActive(item.path) ? '#2E573F' : '#5A554E';"
        >
          <!-- Active Green Left Indicator Line -->
          <span
            v-if="isActive(item.path)"
            style="position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background-color: #2E573F; border-top-left-radius: 6px; border-bottom-left-radius: 6px;"
          ></span>

          <!-- Icons -->
          <svg
            v-if="item.type === 'receipt'"
            xmlns="http://www.w3.org/2000/svg"
            style="width: 24px; height: 24px; flex-shrink: 0;"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
            <path d="M8 7h8" />
            <path d="M8 11h8" />
            <path d="M8 15h5" />
          </svg>

          <svg
            v-else-if="item.type === 'archive'"
            xmlns="http://www.w3.org/2000/svg"
            style="width: 24px; height: 24px; flex-shrink: 0;"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="20" height="5" x="2" y="3" rx="1" />
            <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
            <path d="M10 12h4" />
          </svg>

          <svg
            v-else-if="item.type === 'chart'"
            xmlns="http://www.w3.org/2000/svg"
            style="width: 24px; height: 24px; flex-shrink: 0;"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M8 16v-4" />
            <path d="M12 16v-8" />
            <path d="M16 16v-6" />
          </svg>

          <svg
            v-else-if="item.type === 'qrcode'"
            xmlns="http://www.w3.org/2000/svg"
            style="width: 24px; height: 24px; flex-shrink: 0;"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="5" height="5" x="3" y="3" rx="1" />
            <rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" />
            <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            <path d="M21 21v.01" />
            <path d="M12 7v3a2 2 0 0 1-2 2H7" />
            <path d="M3 12h.01" />
            <path d="M12 3h.01" />
            <path d="M12 16v.01" />
            <path d="M16 12h1" />
            <path d="M21 12v.01" />
            <path d="M12 21v-1" />
          </svg>

          <span style="letter-spacing: 0.025em;">{{ item.label }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Logout Button -->
    <div style="padding-top: 16px; padding-left: 8px; padding-right: 8px; padding-bottom: 8px; border-top: 1px solid rgba(209,213,219,0.5);">
      <button
        @click="logout"
        style="width: 100%; display: flex; align-items: center; gap: 14px; padding: 12px; font-size: 14px; font-weight: 600; color: #5A554E; background: transparent; border: none; border-radius: 12px; cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease;"
        @mouseover="$event.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; $event.currentTarget.style.color = '#2E312F';"
        @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'; $event.currentTarget.style.color = '#5A554E';"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style="width: 20px; height: 20px; flex-shrink: 0; color: #5A554E;"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
        <span>ออกจากระบบ</span>
      </button>
    </div>
  </aside>
</template>