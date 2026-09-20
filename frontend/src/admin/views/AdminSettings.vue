<script setup>
import { ref, onMounted } from 'vue'
import { adminStore } from '../store/adminData'

const savedNotice = ref(false)
const isSaving = ref(false)

// โหลดข้อมูลตั้งค่าจาก Backend ทันทีเมื่อเปิดหน้าเว็บ
onMounted(async () => {
  await adminStore.fetchSettingsFromAPI()
})

async function saveSettings() {
  isSaving.value = true
  try {
    await adminStore.saveSettingsToAPI(adminStore.storeSettings)
    savedNotice.value = true
    setTimeout(() => {
      savedNotice.value = false
    }, 3000)
  } catch (err) {
    alert('บันทึกข้อมูลไม่สำเร็จ: ' + err.message)
  } finally {
    isSaving.value = false
  }
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
        :disabled="isSaving"
        class="px-5 py-2.5 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition disabled:opacity-50"
      >
        {{ isSaving ? '⏳ กำลังบันทึก...' : '💾 บันทึกการตั้งค่า' }}
      </button>
    </div>

    <div v-if="savedNotice" class="p-3 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300">
      ✅ บันทึกข้อมูลการตั้งค่าลงฐานข้อมูลเรียบร้อยแล้ว!
    </div>

    <!-- Store Status Switch Card -->
    <div 
      :class="[
        'p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
        adminStore.storeSettings.isOpen 
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
          : 'bg-red-50 border-red-300 text-red-950'
      ]"
    >
      <div class="flex items-center gap-3">
        <span 
          :class="[
            'w-4 h-4 rounded-full flex-shrink-0',
            adminStore.storeSettings.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
          ]"
        ></span>
        <div>
          <h2 class="text-sm font-bold flex items-center gap-2">
            สถานะร้านค้าปัจจุบัน: 
            <span :class="adminStore.storeSettings.isOpen ? 'text-emerald-700' : 'text-red-600'">
              {{ adminStore.storeSettings.isOpen ? '🟢 เปิดให้บริการตามปกติ' : '🔴 ปิดร้านชั่วคราว (งดรับออเดอร์)' }}
            </span>
          </h2>
          <p class="text-xs opacity-75 mt-0.5">
            {{ adminStore.storeSettings.isOpen 
              ? 'ลูกค้าสามารถสั่งอาหารผ่าน QR โต๊ะอาหาร และระบบเดลิเวอรีได้ตามปกติ' 
              : 'ระบบจะระงับการสั่งอาหารของลูกค้าทั้งหมด ทั้งที่โต๊ะอาหารและทางหน้าเว็บ จนกว่าจะเปิดร้านใหม่อีกครั้ง' 
            }}
          </p>
        </div>
      </div>

      <button 
        @click="adminStore.toggleStoreStatus()"
        :class="[
          'px-5 py-2.5 rounded-xl font-bold text-xs shadow transition flex items-center gap-2 self-end sm:self-auto',
          adminStore.storeSettings.isOpen 
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200' 
            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-200'
        ]"
      >
        <span>{{ adminStore.storeSettings.isOpen ? '🛑 สั่งปิดร้านชั่วคราว' : '✅ สั่งเปิดร้านทันที' }}</span>
      </button>
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
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-bold"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">สโลแกน / Tagline</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.tagline"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">ที่อยู่ร้าน</label>
        <input 
          type="text" 
          v-model="adminStore.storeSettings.address"
          class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">เวลาเปิดร้าน</label>
          <input 
            type="time" 
            v-model="adminStore.storeSettings.openTime"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">เวลาปิดร้าน</label>
          <input 
            type="time" 
            v-model="adminStore.storeSettings.closeTime"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
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
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-mono font-bold text-[#2d5a43]"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ชื่อบัญชีรับเงิน</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.promptpayName"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">อัตราภาษีมูลค่าเพิ่ม VAT (%)</label>
          <input 
            type="number" 
            v-model="adminStore.storeSettings.vatRate"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
          <input 
            type="text" 
            v-model="adminStore.storeSettings.taxId"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-mono"
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
                    u.role === 'Admin' ? 'bg-emerald-100 text-[#183324]' :
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