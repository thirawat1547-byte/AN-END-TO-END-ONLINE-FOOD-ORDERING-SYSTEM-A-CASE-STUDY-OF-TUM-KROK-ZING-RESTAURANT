<template>
  <div class="space-y-3">
    <!-- ข้อมูลลูกค้าและที่อยู่จัดส่ง -->
    <section class="bg-white rounded-2xl border border-slate-200 p-4">
      <h4 class="text-xs font-bold text-slate-500 mb-2">ผู้รับและจุดจัดส่ง</h4>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-bold text-slate-900">{{ customerName }}</p>
          <p class="text-sm text-slate-600">โทร {{ customerPhone }}</p>
        </div>
        <a
          v-if="phoneDigits"
          :href="'tel:' + phoneDigits"
          class="shrink-0 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          📞 โทร
        </a>
      </div>
      <div class="mt-3 bg-slate-50 rounded-xl p-3 text-sm">
        <p class="text-slate-800">📍 {{ address }}</p>
        <p v-if="order.order_notes" class="mt-1.5 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 text-xs">
          📝 หมายเหตุ: {{ order.order_notes }}
        </p>
        <a
          :href="mapsUrl"
          target="_blank"
          rel="noopener"
          class="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
        >
          🧭 นำทางด้วย Google Maps{{ hasGps ? ' (พิกัด GPS)' : '' }}
        </a>
      </div>
    </section>

    <!-- รายการอาหาร -->
    <section class="bg-white rounded-2xl border border-slate-200 p-4">
      <h4 class="text-xs font-bold text-slate-500 mb-2">รายการอาหาร ({{ totalQty }} ชิ้น)</h4>
      <ul class="divide-y divide-slate-100">
        <li v-for="item in order.order_items || []" :key="item.order_item_id" class="py-2 flex justify-between gap-3 text-sm">
          <div class="min-w-0">
            <p class="text-slate-900">
              <span class="font-bold text-emerald-700">{{ item.quantity }}×</span>
              {{ item.menu?.menu_name || 'รายการอาหาร' }}
            </p>
            <p v-if="optionText(item)" class="text-xs text-slate-500">{{ optionText(item) }}</p>
            <p v-if="item.notes" class="text-xs text-amber-700">หมายเหตุ: {{ item.notes }}</p>
          </div>
          <span class="shrink-0 text-slate-700">฿{{ money(Number(item.unit_price || 0) * (item.quantity || 1)) }}</span>
        </li>
      </ul>
      <div class="mt-2 pt-2 border-t border-slate-200 space-y-1 text-sm">
        <div v-if="Number(order.delivery_fee)" class="flex justify-between text-slate-600">
          <span>ค่าจัดส่ง</span><span>฿{{ money(order.delivery_fee) }}</span>
        </div>
        <div v-if="Number(order.discount_amount)" class="flex justify-between text-rose-600">
          <span>ส่วนลด</span><span>-฿{{ money(order.discount_amount) }}</span>
        </div>
        <div class="flex justify-between font-extrabold text-slate-900">
          <span>ยอดรวม</span><span>฿{{ money(order.total_price) }}</span>
        </div>
      </div>
    </section>

    <!-- การชำระเงิน -->
    <section
      class="rounded-2xl border p-3 text-sm font-bold flex items-center justify-between"
      :class="collectCash ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-800'"
    >
      <span>{{ collectCash ? '💵 เก็บเงินสดปลายทาง' : '✅ ' + paymentLabel }}</span>
      <span v-if="collectCash">฿{{ money(order.total_price) }}</span>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: { type: Object, required: true }
})

const money = (v) => Number(v || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

const delivery = computed(() => props.order.delivery || {})
const customerName = computed(() => delivery.value.customer_name || props.order.user?.username || 'ลูกค้าเดลิเวอรี')
const customerPhone = computed(() => delivery.value.customer_phone || props.order.delivery_phone || props.order.user?.phone_number || '-')
const phoneDigits = computed(() => customerPhone.value.replace(/[^\d+]/g, ''))
const address = computed(() => delivery.value.delivery_address || props.order.delivery_address || props.order.user?.address || '-')

const hasGps = computed(() => Number(delivery.value.customer_lat) && Number(delivery.value.customer_lng))
const mapsUrl = computed(() => {
  const dest = hasGps.value
    ? `${Number(delivery.value.customer_lat)},${Number(delivery.value.customer_lng)}`
    : address.value
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
})

const totalQty = computed(() => (props.order.order_items || []).reduce((s, i) => s + (i.quantity || 1), 0))
const optionText = (item) => (item.order_item_options || []).map((o) => o.option_name).join(', ')

const txn = computed(() => {
  const list = props.order.transaction || []
  return list[list.length - 1] || null
})
const collectCash = computed(() => {
  if (!txn.value) return false
  return /cash/i.test(txn.value.payment_method || '') && (txn.value.payment_status || '').toUpperCase() !== 'COMPLETED'
})
const paymentLabel = computed(() => {
  if (!txn.value) return 'ไม่มีข้อมูลการชำระเงิน'
  const st = (txn.value.payment_status || '').toUpperCase()
  if (st === 'COMPLETED') return `ชำระแล้ว (${txn.value.payment_method})`
  return `${txn.value.payment_method} • รอตรวจสอบยอด`
})
</script>
