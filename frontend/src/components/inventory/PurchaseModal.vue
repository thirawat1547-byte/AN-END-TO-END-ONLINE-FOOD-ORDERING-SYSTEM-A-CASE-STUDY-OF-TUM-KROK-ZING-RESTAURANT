<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="close">
    <form
      @submit.prevent="submit"
      class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 text-sm text-slate-800 shadow-xl"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-base font-black">🛒 สั่งวัตถุดิบเพิ่ม</h3>
        <button type="button" @click="close" class="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500">✕</button>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">วัตถุดิบ</label>
        <select
          v-model.number="form.ingredientId"
          required
          class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500/40 focus:outline-none"
        >
          <option :value="null" disabled>เลือกวัตถุดิบ</option>
          <option v-for="i in ingredients" :key="i.id" :value="i.id">{{ i.label }} (คงเหลือ {{ fmt(i.stock) }} {{ i.unitLabel }})</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold text-slate-700 mb-1">จำนวน</label>
          <input
            v-model.number="form.quantity"
            type="number"
            min="0.01"
            step="any"
            required
            placeholder="เช่น 5"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500/40 focus:outline-none font-bold"
          />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">หน่วย</label>
          <input
            :value="selected?.unitLabel || '-'"
            readonly
            class="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed"
            title="ใช้หน่วยเดียวกับสต็อกของวัตถุดิบ"
          />
        </div>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">ราคารวม (บาท)</label>
        <input
          v-model.number="form.totalPrice"
          type="number"
          min="0"
          step="any"
          required
          placeholder="เช่น 400"
          class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500/40 focus:outline-none font-bold"
        />
      </div>

      <div class="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900">
        <div class="flex justify-between">
          <span>ราคาต่อหน่วย</span>
          <b>{{ unitPrice !== null ? `฿${fmt(unitPrice)} / ${selected?.unitLabel || 'หน่วย'}` : '-' }}</b>
        </div>
        <div v-if="selected && Number(form.quantity) > 0" class="flex justify-between text-xs mt-1 text-emerald-700">
          <span>สต็อกหลังสั่ง</span>
          <span>{{ fmt(selected.stock) }} → <b>{{ fmt(Number(selected.stock) + Number(form.quantity)) }}</b> {{ selected.unitLabel }}</span>
        </div>
      </div>

      <p v-if="error" class="text-rose-600 text-xs">{{ error }}</p>

      <div class="flex gap-2">
        <button type="button" @click="close" class="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold hover:bg-slate-50">ยกเลิก</button>
        <button
          type="submit"
          :disabled="saving || !canSubmit"
          class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:bg-slate-300"
        >
          {{ saving ? 'กำลังบันทึก…' : 'ยืนยันสั่งเพิ่ม' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { API_BASE } from '../../config/api'

// ingredients: [{ id, label, unit (ค่าดิบที่ส่ง API), unitLabel (ข้อความแสดงผล), stock }]
const props = defineProps({
  open: { type: Boolean, default: false },
  ingredients: { type: Array, default: () => [] },
  initialId: { type: Number, default: null }
})
const emit = defineEmits(['close', 'saved'])

const form = ref({ ingredientId: null, quantity: null, totalPrice: null })
const saving = ref(false)
const error = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.value = { ingredientId: props.initialId ?? null, quantity: null, totalPrice: null }
      error.value = ''
    }
  },
  { immediate: true }
)

const selected = computed(() => props.ingredients.find((i) => i.id === form.value.ingredientId) || null)
const unitPrice = computed(() => {
  const q = Number(form.value.quantity)
  const p = Number(form.value.totalPrice)
  if (!(q > 0) || !(p >= 0) || form.value.totalPrice === null || form.value.totalPrice === '') return null
  return p / q
})
const canSubmit = computed(() => selected.value && Number(form.value.quantity) > 0 && unitPrice.value !== null)

const fmt = (v) => {
  const n = Number(v || 0)
  return n.toLocaleString('th-TH', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })
}

const close = () => {
  if (!saving.value) emit('close')
}

const submit = async () => {
  if (!canSubmit.value) return
  saving.value = true
  error.value = ''
  try {
    const { data } = await axios.post(`${API_BASE}/ingredients/${selected.value.id}/purchases`, {
      quantity: Number(form.value.quantity),
      total_price: Number(form.value.totalPrice),
      unit: selected.value.unit
    })
    emit('saved', data)
  } catch (err) {
    const m = err?.response?.data?.message
    error.value = (Array.isArray(m) ? m.join(', ') : m) || 'บันทึกการสั่งซื้อไม่สำเร็จ กรุณาลองใหม่'
  } finally {
    saving.value = false
  }
}
</script>
