<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminStore, thaiDateStr } from '../store/adminData'

// โหลดโปรโมชันจริงจาก Backend ทันทีที่เปิดหน้าเว็บ
// (โปรที่หมดอายุ: ไม่เคยใช้ = backend ลบให้เอง, เคยใช้แล้ว = ปิดใช้งานไว้เป็นประวัติ)
onMounted(async () => {
  if (typeof adminStore.fetchPromotionsFromAPI === 'function') {
    await adminStore.fetchPromotionsFromAPI()
  }
})

const isModalOpen = ref(false)
const editingId = ref(null) // null = สร้างใหม่, มีค่า = แก้ไขโปรนั้น
const isSaving = ref(false)
const simBillAmount = ref(450)
const simCode = ref('ZING50')

const blankPromo = () => ({
  code: '',
  discount_type: 'Fixed',
  discount_value: 50,
  min_order_price: 300,
  start_date: thaiDateStr(0), // ตอนสร้างล็อกเป็นวันนี้
  expiry_date: thaiDateStr(30),
  is_active: true
})
const newPromo = ref(blankPromo())

const isExpired = (promo) => Boolean(promo.expiry_date) && promo.expiry_date < thaiDateStr(0)
const notStarted = (promo) => Boolean(promo.start_date) && promo.start_date > thaiDateStr(0)

function openCreate() {
  editingId.value = null
  newPromo.value = blankPromo()
  isModalOpen.value = true
}

function openEdit(promo) {
  editingId.value = promo.promo_id
  newPromo.value = { ...promo }
  isModalOpen.value = true
}

async function savePromo() {
  if (!newPromo.value.code || !newPromo.value.discount_value) {
    alert('กรุณากรอกรหัสโปรโมชันและมูลค่าส่วนลด')
    return
  }
  if (!newPromo.value.expiry_date || newPromo.value.expiry_date < newPromo.value.start_date) {
    alert('วันหมดอายุต้องไม่ก่อนวันเริ่ม')
    return
  }
  isSaving.value = true
  const result = editingId.value
    ? await adminStore.updatePromotionAPI(editingId.value, { ...newPromo.value })
    : await adminStore.addPromotionAPI({ ...newPromo.value })
  isSaving.value = false
  if (!result?.ok) {
    alert(`บันทึกไม่สำเร็จ: ${result?.message || 'กรุณาลองใหม่'}`)
    return
  }
  isModalOpen.value = false
}

async function deletePromo(id) {
  if (confirm('คุณต้องการลบโปรโมชันนี้ใช่หรือไม่?')) {
    if (typeof adminStore.deletePromotionAPI === 'function') {
      await adminStore.deletePromotionAPI(id)
    } else {
      adminStore.deletePromotion(id)
    }
  }
}

async function togglePromo(promoId) {
  const result = await adminStore.togglePromoStatusAPI(promoId)
  if (result && !result.ok) alert(result.message)
}

// Discount Simulation
const simResult = computed(() => {
  const p = adminStore.promotions.find(x => x.code.toUpperCase() === simCode.value.toUpperCase() && x.is_active)
  if (!p) {
    return { valid: false, message: '❌ ไม่พบโค้ดส่วนลดนี้ หรือโค้ดปิดใช้งานอยู่', discount: 0, net: simBillAmount.value }
  }
  if (simBillAmount.value < p.min_order_price) {
    return { valid: false, message: `⚠️ ยอดสั่งซื้อขั้นต่ำต้องถึง ฿${p.min_order_price} (ปัจจุบัน ฿${simBillAmount.value})`, discount: 0, net: simBillAmount.value }
  }
  let discount = 0
  if (p.discount_type === 'Fixed') {
    discount = p.discount_value
  } else {
    discount = (simBillAmount.value * p.discount_value) / 100
  }
  const net = Math.max(0, simBillAmount.value - discount)
  return { valid: true, message: `✅ ใช้โค้ด ${p.code} สำเร็จ! ลดทันที ฿${discount}`, discount, net }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">จัดการโปรโมชันและแคมเปญส่วนลด (Promotions)</h1>
        <p class="text-xs text-slate-500">สร้างโค้ดส่วนลด กำหนดเงื่อนไขยอดสั่งซื้อขั้นต่ำ และควบคุมตรรกะส่วนลด (Order-level Discount Logic)</p>
      </div>
      <button
        @click="openCreate"
        class="px-4 py-2.5 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center gap-1.5"
      >
        <span>➕ สร้างโค้ดโปรโมชันใหม่</span>
      </button>
    </div>

    <!-- Promo Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="promo in adminStore.promotions" 
        :key="promo.promo_id"
        :class="[
          'bg-white rounded-2xl p-5 border transition shadow-sm flex flex-col justify-between relative overflow-hidden',
          promo.is_active ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200 bg-slate-50/70 opacity-70'
        ]"
      >
        <!-- Top Promo Badge -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏷️</span>
            <div>
              <h3 class="font-black text-base text-slate-900 font-mono tracking-wider">{{ promo.code }}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-[#183324]">
                {{ promo.discount_type === 'Percentage' ? `ลด ${promo.discount_value}%` : `ลด ฿${promo.discount_value} บาท` }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="openEdit(promo)"
              class="text-slate-400 hover:text-[#2d5a43] text-xs p-1"
              title="แก้ไข"
            >
              ✏️
            </button>
            <button
              @click="deletePromo(promo.promo_id)"
              class="text-slate-400 hover:text-red-500 text-xs p-1"
              title="ลบ"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Details -->
        <div class="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">สั่งขั้นต่ำ:</span>
            <span class="font-bold text-slate-800">฿{{ promo.min_order_price }} บาท</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">เริ่มใช้:</span>
            <span class="font-medium text-slate-800">
              {{ promo.start_date || '-' }}
              <span v-if="notStarted(promo)" class="ml-1 text-[10px] font-bold text-amber-600">(ยังไม่เริ่ม)</span>
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">หมดอายุ:</span>
            <span class="font-medium" :class="isExpired(promo) ? 'text-red-500' : 'text-slate-800'">
              {{ promo.expiry_date }}
              <span v-if="isExpired(promo)" class="ml-1 text-[10px] font-bold">(หมดอายุแล้ว)</span>
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">ใช้งานแล้ว:</span>
            <span class="font-bold text-[#2d5a43]">{{ promo.used_count }} ครั้ง</span>
          </div>
        </div>

        <!-- Toggle Switch -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs font-medium" :class="promo.is_active ? 'text-emerald-600 font-bold' : 'text-slate-400'">
            {{ promo.is_active ? '🟢 เปิดใช้งานอยู่' : '⚪ ปิดใช้งาน' }}
          </span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              :checked="promo.is_active" 
              @change="togglePromo(promo.promo_id)"
              class="sr-only peer"
            >
            <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Interactive Discount Logic Tester Tool -->
    <div class="bg-gradient-to-br from-[#183324] to-[#244633] text-white p-6 rounded-2xl shadow-xl space-y-4">
      <div class="flex items-center gap-2">
        <span class="text-xl">🧮</span>
        <div>
          <h2 class="text-base font-bold">เครื่องมือจำลองการคำนวณส่วนลด (Discount Simulator)</h2>
          <p class="text-xs text-emerald-200/70">ทดสอบตรรกะ Order-level Discount Logic ก่อนปล่อยแคมเปญให้ลูกค้าใช้งานจริง</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div>
          <label class="block text-xs font-medium text-emerald-200 mb-1">ยอดรวมคำสั่งซื้อ (บาท)</label>
          <input 
            type="number" 
            v-model="simBillAmount"
            class="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/20 text-white font-bold text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-emerald-200 mb-1">รหัสโปรโมชัน</label>
          <input 
            type="text" 
            v-model="simCode"
            placeholder="เช่น ZING50"
            class="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/20 text-white font-bold text-sm uppercase focus:ring-2 focus:ring-emerald-400 focus:outline-none"
          />
        </div>

        <div class="bg-black/30 p-3.5 rounded-xl border border-white/20 flex flex-col justify-between">
          <div class="text-xs font-medium" :class="simResult.valid ? 'text-emerald-300' : 'text-amber-300'">
            {{ simResult.message }}
          </div>
          <div class="flex items-center justify-between text-xs pt-1 border-t border-white/15 mt-1">
            <span class="text-emerald-200/80">ยอดสุทธิที่ต้องจ่าย:</span>
            <span class="text-base font-black text-emerald-300">฿{{ simResult.net }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add New Promo -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="font-bold text-base text-slate-900">{{ editingId ? '✏️ แก้ไขโค้ดโปรโมชัน' : '➕ สร้างโค้ดโปรโมชันใหม่' }}</h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">รหัสคูปอง (Promo Code) *</label>
            <input 
              type="text" 
              v-model="newPromo.code"
              placeholder="เช่น ZING100"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 uppercase font-mono font-bold focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">ประเภทส่วนลด *</label>
              <select 
                v-model="newPromo.discount_type"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
              >
                <option value="Fixed">ลดเป็นบาท (Fixed ฿)</option>
                <option value="Percentage">ลดเป็นเปอร์เซ็นต์ (%)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">มูลค่าส่วนลด *</label>
              <input 
                type="number" 
                v-model="newPromo.discount_value"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">ยอดสั่งซื้อขั้นต่ำ (บาท)</label>
            <input
              type="number"
              v-model="newPromo.min_order_price"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">วันเริ่ม {{ editingId ? '' : '🔒' }}</label>
              <input
                type="date"
                v-model="newPromo.start_date"
                :disabled="!editingId"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
              <span v-if="!editingId" class="text-[10px] text-slate-400 mt-0.5 block">ล็อกเป็นวันนี้ เปลี่ยนได้ตอนแก้ไข</span>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">วันหมดอายุ *</label>
              <input
                type="date"
                v-model="newPromo.expiry_date"
                :min="newPromo.start_date"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#2d5a43]/50 focus:outline-none"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block">ใช้ได้ถึงสิ้นวัน · หมดอายุแล้วระบบปิด/ลบให้เอง</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button 
            @click="isModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs"
          >
            ยกเลิก
          </button>
          <button
            @click="savePromo"
            :disabled="isSaving"
            class="px-5 py-2 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition disabled:opacity-60"
          >
            {{ isSaving ? 'กำลังบันทึก…' : (editingId ? 'บันทึกการแก้ไข' : 'บันทึกโปรโมชัน') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>