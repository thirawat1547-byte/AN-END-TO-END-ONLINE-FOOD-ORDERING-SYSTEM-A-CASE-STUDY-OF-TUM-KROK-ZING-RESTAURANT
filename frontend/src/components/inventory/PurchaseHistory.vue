<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-800">
    <div class="p-4 flex flex-wrap items-end gap-3 border-b border-slate-100">
      <div>
        <label class="block font-bold text-slate-500 mb-1">ตั้งแต่</label>
        <input v-model="from" type="date" class="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200" />
      </div>
      <div>
        <label class="block font-bold text-slate-500 mb-1">ถึง</label>
        <input v-model="to" type="date" class="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200" />
      </div>
      <button @click="load" :disabled="loading" class="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold disabled:opacity-50">
        {{ loading ? 'กำลังโหลด…' : 'ค้นหา' }}
      </button>
      <div class="ml-auto text-right">
        <p class="text-slate-500">รวม {{ rows.length }} รายการ</p>
        <p class="text-base font-black text-rose-700">฿{{ fmt(total) }}</p>
      </div>
    </div>

    <p v-if="error" class="p-4 text-rose-600">{{ error }}</p>
    <p v-else-if="!loading && !rows.length" class="p-6 text-center text-slate-400">ยังไม่มีประวัติการสั่งซื้อในช่วงนี้</p>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-slate-50 text-slate-500">
          <tr>
            <th class="p-3 font-bold">วันที่</th>
            <th class="p-3 font-bold">วัตถุดิบ</th>
            <th class="p-3 font-bold text-right">จำนวน</th>
            <th class="p-3 font-bold text-right">ราคารวม</th>
            <th class="p-3 font-bold text-right">ราคา/หน่วย</th>
            <th class="p-3 font-bold">ผู้สั่ง</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="r in rows" :key="r.purchase_id">
            <td class="p-3 text-slate-500 whitespace-nowrap">{{ fmtDate(r.purchased_at) }}</td>
            <td class="p-3 font-bold">{{ r.ingredient_name || r.ingredient?.name || '-' }}</td>
            <td class="p-3 text-right">{{ fmt(r.quantity) }} {{ r.unit }}</td>
            <td class="p-3 text-right font-bold">฿{{ fmt(r.total_price) }}</td>
            <td class="p-3 text-right text-slate-500">฿{{ fmt(Number(r.quantity) > 0 ? Number(r.total_price) / Number(r.quantity) : 0) }}</td>
            <td class="p-3 text-slate-500">{{ r.purchaser?.username || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { API_BASE } from '../../config/api'

// refreshKey: เปลี่ยนค่าเมื่อมีการสั่งซื้อใหม่ เพื่อโหลดรายการใหม่
const props = defineProps({ refreshKey: { type: Number, default: 0 } })

const toDateInput = (d) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
const now = new Date()
const from = ref(toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)))
const to = ref(toDateInput(now))
const rows = ref([])
const loading = ref(false)
const error = ref('')

const total = computed(() => rows.value.reduce((s, r) => s + Number(r.total_price || 0), 0))
const fmt = (v) => {
  const n = Number(v || 0)
  return n.toLocaleString('th-TH', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })
}
const fmtDate = (d) => (d ? new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.get(`${API_BASE}/ingredients/purchases`, { params: { from: from.value, to: to.value } })
    rows.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err?.response?.data?.message || 'โหลดประวัติการสั่งซื้อไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.refreshKey, load)
</script>
