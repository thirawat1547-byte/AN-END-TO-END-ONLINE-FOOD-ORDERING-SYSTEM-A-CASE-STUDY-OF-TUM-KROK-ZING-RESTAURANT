<script setup>
import { ref } from 'vue'
import { adminStore } from '../store/adminData'

const savedNotice = ref(false)

function saveSettings() {
  savedNotice.value = true
  setTimeout(() => {
    savedNotice.value = false
  }, 3000)
}
</script>

<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">ตั้งค่าระบบร้านค้า (Store Settings)</h1>
        <p class="text-xs text-slate-500">ข้อมูลร้านค้า การชำระเงิน PromptPay เวลาเปิด-ปิด และการจัดการพนักงาน</p>
      </div>
      <button 
        @click="saveSettings"
        class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
      >
        💾 บันทึกการตั้งค่า
      </button>
    </div>

    <div v-if="savedNotice" class="p-3 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300">
      ✅ บันทึกข้อมูลการตั้งค่าเรียบร้อยแล้ว!
    </div>

    <!-- Store Info Card -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
      <h2 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
        <span>🏪</span> ข้อมูลทั่วไปของร้าน
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">ชื่อร้านค้า</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.storeName"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-bold"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">สโลแกน / Tagline</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.tagline"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">ที่อยู่ร้าน</label>
        <input 
          type="text" 
          v-model="adminStore.storeSettings.address"
          class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">เวลาเปิดร้าน</label>
          <input 
            type="time" 
            v-model="adminStore.storeSettings.openTime"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">เวลาปิดร้าน</label>
          <input 
            type="time" 
            v-model="adminStore.storeSettings.closeTime"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Payment & Tax Card -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
      <h2 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
        <span>💳</span> ตั้งค่าการชำระเงินและภาษี (PromptPay & Tax)
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">เบอร์พร้อมเพย์ (PromptPay ID)</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.promptpayNumber"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-mono font-bold text-amber-700"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ชื่อบัญชีรับเงิน</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.promptpayName"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">อัตราภาษีมูลค่าเพิ่ม VAT (%)</label>
          <input 
            type="number" 
            v-model="adminStore.storeSettings.vatRate"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.taxId"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-mono"
          />
        </div>
      </div>
    </div>

    <!-- Staff Accounts Table -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
      <h2 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
        <span>👥</span> ผู้ใช้งานและสิทธิ์การเข้าถึง (Role-Based Access)
      </h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
            <tr>
              <th class="p-3">Username</th>
              <th class="p-3">Email</th>
              <th class="p-3">เบอร์โทรศัพท์</th>
              <th class="p-3">สิทธิ์ (Role)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in adminStore.users" :key="u.user_id">
              <td class="p-3 font-bold text-slate-900">{{ u.username }}</td>
              <td class="p-3 text-slate-500">{{ u.email }}</td>
              <td class="p-3 text-slate-500">{{ u.phone_number }}</td>
              <td class="p-3">
                <span 
                  :class="[
                    'px-2.5 py-0.5 rounded-full font-bold text-[10px]',
                    u.role === 'Admin' ? 'bg-amber-100 text-amber-900' :
                    u.role === 'Staff' ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ u.role }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
