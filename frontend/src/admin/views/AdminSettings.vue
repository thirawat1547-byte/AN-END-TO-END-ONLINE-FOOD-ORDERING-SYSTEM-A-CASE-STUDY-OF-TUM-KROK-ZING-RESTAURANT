<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminStore } from '../store/adminData'

const savedNotice = ref(false)
const isSaving = ref(false)

// ค่ารอบไรเดอร์ตามระยะทาง (สูตรเดียวกับ backend: calcRiderFee)
const hasStoreLocation = computed(() =>
  Number(adminStore.storeSettings.storeLat) && Number(adminStore.storeSettings.storeLng)
)
const exampleFee = (km) => {
  const s = adminStore.storeSettings
  const extraKm = Math.max(0, Math.ceil(km - Number(s.riderFreeKm || 0)))
  return Number(s.riderFee || 0) + extraKm * Number(s.riderFeePerKm || 0)
}

const isLocating = ref(false)
const locateError = ref('')
function useCurrentLocation() {
  if (!navigator.geolocation) {
    locateError.value = 'เบราว์เซอร์นี้ไม่รองรับการหาตำแหน่ง กรุณากรอกพิกัดเอง'
    return
  }
  isLocating.value = true
  locateError.value = ''
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      adminStore.storeSettings.storeLat = Number(pos.coords.latitude.toFixed(7))
      adminStore.storeSettings.storeLng = Number(pos.coords.longitude.toFixed(7))
      isLocating.value = false
    },
    () => {
      locateError.value = 'หาตำแหน่งไม่สำเร็จ (อาจไม่ได้อนุญาตการเข้าถึงตำแหน่ง) กรุณากรอกพิกัดเอง'
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

// โหลดข้อมูลตั้งค่าจาก Backend ทันทีเมื่อเปิดหน้าเว็บ
onMounted(async () => {
  await Promise.all([
    adminStore.fetchSettingsFromAPI(),
    adminStore.fetchUsersFromAPI()
  ])
})

// สีป้ายสิทธิ์ตาม role จริงจากฐานข้อมูล (ADMIN / KITCHEN / STAFF / RIDER / CUSTOMER)
function roleBadgeClass(role) {
  const r = String(role || '').toUpperCase()
  if (r === 'ADMIN') return 'bg-emerald-100 text-[#183324]'
  if (r === 'KITCHEN' || r === 'STAFF') return 'bg-blue-100 text-blue-900'
  if (r === 'RIDER') return 'bg-amber-100 text-amber-900'
  return 'bg-slate-100 text-slate-700'
}

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

    <!-- Delivery & Rider Logistics Settings Card -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
      <h2 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
        <span>🛵</span> ตั้งค่าเดลิเวอรีและค่ารอบไรเดอร์ (Delivery & Rider Logistics)
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">ค่าจัดส่งพื้นฐาน (บาท)</label>
          <input 
            type="number" 
            step="1"
            v-model="adminStore.storeSettings.baseDeliveryFee"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-bold text-slate-800"
          />
          <span class="text-[10px] text-slate-400 mt-0.5 block">คิดเป็นอัตราเริ่มต้นทุกออเดอร์เดลิเวอรี</span>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ค่าส่งต่อ กม. (บาท/กม.)</label>
          <input 
            type="number" 
            step="1"
            v-model="adminStore.storeSettings.deliveryFeePerKm"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-bold text-slate-800"
          />
          <span class="text-[10px] text-slate-400 mt-0.5 block">อัตราคิดเพิ่มตามระยะทางคำนวณจาก GPS</span>
        </div>
      </div>

      <!-- ค่ารอบไรเดอร์ตามระยะทาง -->
      <div class="pt-3 border-t border-slate-100 space-y-3">
        <h3 class="font-bold text-slate-800">ค่ารอบไรเดอร์ (คิดตามระยะทาง)</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ค่ารอบเริ่มต้น (บาท)</label>
            <input
              type="number"
              step="1"
              min="0"
              v-model.number="adminStore.storeSettings.riderFee"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-bold text-emerald-700 font-mono"
            />
            <span class="text-[10px] text-slate-400 mt-0.5 block">ได้ทุกเที่ยว ครอบคลุมระยะทางช่วงแรก</span>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">ระยะที่รวมในค่าเริ่มต้น (กม.)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              v-model.number="adminStore.storeSettings.riderFreeKm"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-bold text-slate-800"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">ส่วนที่เกิน (บาท/กม.)</label>
            <input
              type="number"
              step="1"
              min="0"
              v-model.number="adminStore.storeSettings.riderFeePerKm"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-bold text-slate-800"
            />
            <span class="text-[10px] text-slate-400 mt-0.5 block">ปัดขึ้นเป็นกิโลเต็ม</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ละติจูดร้าน</label>
            <input
              type="number"
              step="any"
              v-model="adminStore.storeSettings.storeLat"
              placeholder="เช่น 13.8876"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">ลองจิจูดร้าน</label>
            <input
              type="number"
              step="any"
              v-model="adminStore.storeSettings.storeLng"
              placeholder="เช่น 100.5790"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none font-mono"
            />
          </div>
          <button
            type="button"
            @click="useCurrentLocation"
            :disabled="isLocating"
            class="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 disabled:opacity-50"
          >
            {{ isLocating ? 'กำลังหาตำแหน่ง…' : '📍 ใช้ตำแหน่งปัจจุบัน (ยืนอยู่ที่ร้าน)' }}
          </button>
        </div>
        <p v-if="locateError" class="text-rose-600">{{ locateError }}</p>

        <div
          class="rounded-xl p-3 border"
          :class="hasStoreLocation ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'"
        >
          <template v-if="hasStoreLocation">
            ตัวอย่างค่ารอบ: 2 กม. = ฿{{ exampleFee(2) }} • 5 กม. = ฿{{ exampleFee(5) }} • 10 กม. = ฿{{ exampleFee(10) }}
            <span class="block text-[10px] opacity-80 mt-0.5">ระยะทางประมาณจากพิกัด GPS ร้านถึงหมุดลูกค้า (เส้นตรง × 1.3 ตามเส้นทางถนน) ค่ารอบจริงล็อกตอนไรเดอร์กดรับงาน</span>
          </template>
          <template v-else>
            ⚠️ ยังไม่ได้ตั้งพิกัดร้าน ระบบจะจ่ายค่ารอบเริ่มต้น ฿{{ Number(adminStore.storeSettings.riderFee || 0) }} ทุกเที่ยว จนกว่าจะใส่พิกัดร้าน
          </template>
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
            <tr v-if="adminStore.usersLoadStatus === 'loading' && adminStore.users.length === 0">
              <td colspan="4" class="p-4 text-center text-slate-400">กำลังโหลดรายชื่อผู้ใช้...</td>
            </tr>
            <tr v-else-if="adminStore.usersLoadStatus === 'error'">
              <td colspan="4" class="p-4 text-center text-red-600">
                โหลดรายชื่อผู้ใช้ไม่สำเร็จ
                <button class="ml-2 underline font-bold" @click="adminStore.fetchUsersFromAPI()">ลองใหม่</button>
              </td>
            </tr>
            <tr v-else-if="adminStore.users.length === 0">
              <td colspan="4" class="p-4 text-center text-slate-400">ยังไม่มีผู้ใช้งานในระบบ</td>
            </tr>
            <tr v-for="u in adminStore.users" :key="u.user_id">
              <td class="p-3 font-bold text-slate-900">{{ u.username }}</td>
              <td class="p-3 text-slate-500">{{ u.email || '-' }}</td>
              <td class="p-3 text-slate-500">{{ u.phone_number || '-' }}</td>
              <td class="p-3">
                <span :class="['px-2.5 py-0.5 rounded-full font-bold text-[10px]', roleBadgeClass(u.role)]">
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