<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import QRCode from 'qrcode'
import { API_BASE } from '../../config/api'
import { adminStore } from '../store/adminData'

const router = useRouter()

// ตัวกรองสถานะที่เลือกอยู่
const activeFilter = ref('all')
let pollingTimer = null

// ป๊อปอัปสำหรับเพิ่มโต๊ะใหม่
const isAddModalOpen = ref(false)
const newTable = ref({
  id: '',
  capacity: 4
})

// Modal เปิดโต๊ะพร้อมเลือกจำนวนคน
const isTableOpenModalVisible = ref(false)
const selectedOpenTable = ref(null)
const openTableGuests = ref(2)

// รายการ Presets จำกัดตามความจุโต๊ะจริง (T-01: 2, T-02/03: 4, T-04: 6, T-05: 8)
const getAvailablePresets = (capacity) => {
  const cap = Number(capacity) || 4
  const list = []
  for (let i = 1; i <= cap; i++) {
    list.push(i)
  }
  return list
}

const openTableModal = (table) => {
  selectedOpenTable.value = table
  const cap = Number(table.capacity) || 4
  openTableGuests.value = table.seats > 0 ? Math.min(cap, table.seats) : Math.min(2, cap)
  isTableOpenModalVisible.value = true
}

const confirmOpenTable = async () => {
  if (!selectedOpenTable.value) return
  const t = selectedOpenTable.value
  const cap = Number(t.capacity) || 4
  const guests = Math.max(1, Math.min(cap, openTableGuests.value))
  
  try {
    if (t.table_id) {
      await axios.patch(`${API_BASE}/tables/${t.table_id}/status`, { status: 'OCCUPIED' })
    }
    localStorage.setItem(`table_guests_${t.table_id || t.id}`, String(guests))
    t.status = 'occupied'
    t.seats = guests
    isTableOpenModalVisible.value = false
    await fetchTablesData()
  } catch (err) {
    console.error('ไม่สามารถเปิดโต๊ะได้:', err)
    alert('เกิดข้อผิดพลาดในการเปิดโต๊ะ')
  }
}

const closeOrClearTable = async (table) => {
  const hasUnpaid = table.total > 0 || (table.activeOrders && table.activeOrders.length > 0)
  const confirmMsg = hasUnpaid 
    ? `โต๊ะ ${table.id} ยังมียอดค้างชำระ ฿${table.total.toLocaleString()} ต้องการปิดโต๊ะและเปลี่ยนเป็นสถานะ "ว่าง" ใช่หรือไม่?`
    : `ต้องการปิดโต๊ะ ${table.id} และเปลี่ยนเป็นสถานะ "ว่าง" ใช่หรือไม่?`

  if (!confirm(confirmMsg)) return

  try {
    if (table.table_id) {
      await axios.patch(`${API_BASE}/tables/${table.table_id}/status`, { status: 'AVAILABLE' })
    }
    localStorage.removeItem(`table_guests_${table.table_id || table.id}`)
    table.status = 'available'
    table.seats = 0
    await fetchTablesData()
  } catch (err) {
    console.error('ไม่สามารถปิดโต๊ะได้:', err)
    alert('เกิดข้อผิดพลาดในการปิดโต๊ะ')
  }
}

const adjustTableGuests = (table, delta) => {
  if (table.status === 'available') {
    openTableModal(table)
    return
  }
  const cap = Number(table.capacity) || 4
  const current = Number(table.seats) || 1
  const updated = Math.max(1, Math.min(cap, current + delta))
  table.seats = updated
  localStorage.setItem(`table_guests_${table.table_id || table.id}`, String(updated))
}

// แผนที่สถานะและสีประจำสถานะ
const statusMap = {
  available: { label: 'ว่าง', bg: 'bg-[#E3DFD5]', text: 'text-gray-700', border: 'border-transparent' },
  occupied: { label: 'กำลังทาน', bg: 'bg-[#48785A]', text: 'text-white', border: 'border-l-4 border-l-[#3D664C]' },
  billing: { label: 'รอเช็คบิล', bg: 'bg-[#819BF8]', text: 'text-white', border: 'border-l-4 border-l-[#4F46E5]' }
}

// รายการโต๊ะ
const tables = ref([])

// ดึงข้อมูลโต๊ะและออเดอร์จริงจาก Backend
const fetchTablesData = async () => {
  try {
    const [tablesRes, ordersRes] = await Promise.all([
      axios.get(`${API_BASE}/tables`),
      axios.get(`${API_BASE}/orders`)
    ])

    const dbTables = tablesRes.data || []
    const allOrders = ordersRes.data || []

    tables.value = dbTables.map((t) => {
      const activeOrders = allOrders.filter((o) => {
        const matchesTableId = o.table_id === t.table_id || o.table?.table_id === t.table_id
        const matchesTableNum = o.table?.table_number === t.table_number || (typeof o.table === 'string' && o.table === t.table_number)
        const isTableOrder = matchesTableId || matchesTableNum
        const isActiveStatus = ['PENDING', 'COOKING', 'READY', 'SERVED'].includes((o.status || '').toUpperCase())
        return isTableOrder && isActiveStatus
      })

      const totalAmount = activeOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)

      let currentStatus = 'available'
      if (activeOrders.length > 0) {
        currentStatus = t.status === 'BILLING' ? 'billing' : 'occupied'
      } else if (t.status === 'OCCUPIED') {
        currentStatus = 'occupied'
      } else if (t.status === 'BILLING') {
        currentStatus = 'billing'
      }

      // ดึงจำนวนแขกที่นั่งจาก localStorage (จำกัดไม่เกินความจุโต๊ะ)
      const cap = Number(t.capacity) || 4
      const savedGuests = localStorage.getItem(`table_guests_${t.table_id || t.table_number}`)
      let guestCount = 0
      if (currentStatus === 'occupied' || currentStatus === 'billing') {
        guestCount = savedGuests ? Math.max(1, Math.min(cap, Number(savedGuests))) : Math.min(2, cap)
      }

      return {
        table_id: t.table_id,
        id: t.table_number || `T-0${t.table_id}`,
        status: currentStatus,
        seats: guestCount,
        capacity: t.capacity || 4,
        total: totalAmount,
        activeOrders
      }
    })

    // ซิงค์เข้า adminStore.tables เพื่อให้ badge แถบเมนูด้านซ้ายอัปเดตตรงกัน
    adminStore.tables = tables.value.map(t => ({
      table_id: t.table_id,
      table_number: t.id,
      capacity: t.capacity,
      status: t.status === 'occupied' ? 'Occupied' : t.status === 'billing' ? 'Billing' : 'Empty',
      currentBill: t.total
    }))
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลโต๊ะจาก API ได้:', err)
  }
}

onMounted(() => {
  fetchTablesData()
  pollingTimer = setInterval(fetchTablesData, 4000)
})

onBeforeUnmount(() => {
  if (pollingTimer) clearInterval(pollingTimer)
})

// ฟังก์ชันนับจำนวนตามสถานะจริง
const countAll = computed(() => tables.value.length)
const countAvailable = computed(() => tables.value.filter(t => t.status === 'available').length)
const countOccupied = computed(() => tables.value.filter(t => t.status === 'occupied').length)
const countBilling = computed(() => tables.value.filter(t => t.status === 'billing').length)

// กรองรายการโต๊ะตาม Filter ที่เลือก
const filteredTables = computed(() => {
  if (activeFilter.value === 'all') return tables.value
  return tables.value.filter(t => t.status === activeFilter.value)
})

// คลิกที่โต๊ะเพื่อเข้าไปดูรายละเอียด
const goToTableDetail = (tableId) => {
  router.push(`/kitchen/tables/${tableId}`)
}

// คำนวณรหัส CRC16 สำหรับ PromptPay EMVCo
function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generatePromptPayPayload(target, amount) {
  const cleanTarget = String(target || '0812345678').replace(/[^0-9]/g, '');
  const targetType = cleanTarget.length >= 13 ? '02' : '01';
  let formattedTarget = cleanTarget;
  if (targetType === '01') {
    formattedTarget = '0066' + cleanTarget.replace(/^0/, '');
  }
  const targetTag = targetType + String(formattedTarget.length).padStart(2, '0') + formattedTarget;
  const aid = '0016A000000677010111';
  const merchantInfo = aid + targetTag;
  const merchantTag = '29' + String(merchantInfo.length).padStart(2, '0') + merchantInfo;
  
  let payload = '000201' + '010212' + merchantTag + '5802TH' + '5303764';
  if (amount !== undefined && amount !== null && Number(amount) > 0) {
    const formattedAmount = Number(amount).toFixed(2);
    payload += '54' + String(formattedAmount.length).padStart(2, '0') + formattedAmount;
  }
  payload += '6304';
  payload += crc16(payload);
  return payload;
}

// ข้อมูลสำหรับ Modal แสดง QR โต๊ะเดี่ยว
const selectedQrTable = ref(null)
const selectedQrUrl = ref('')
const selectedQrDataUrl = ref('')
const isQrModalOpen = ref(false)

// ข้อมูลสำหรับ Modal ชำระเงิน / เช็คบิล
const selectedPayTable = ref(null)
const payQrDataUrl = ref('')
const isPaymentModalOpen = ref(false)
const isPaying = ref(false)

const openPaymentModal = async (table) => {
  selectedPayTable.value = table
  const amount = table.total || 0
  if (amount <= 0) {
    alert('โต๊ะนี้ยังไม่มียอดค้างชำระครับ')
    return
  }

  try {
    const payload = generatePromptPayPayload('081-234-5678', amount)
    payQrDataUrl.value = await QRCode.toDataURL(payload, {
      width: 260,
      margin: 2,
      color: { dark: '#003B70', light: '#FFFFFF' }
    })
    isPaymentModalOpen.value = true
  } catch (e) {
    console.error(e)
  }
}

const printTablePaymentSlip = () => {
  if (!selectedPayTable.value) return
  const t = selectedPayTable.value
  const printWindow = window.open('', '_blank', 'width=450,height=720')
  if (!printWindow) return

  const nowStr = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) + ' น.'

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>ใบแจ้งยอดชำระเงิน - โต๊ะ ${t.id}</title>
      <style>
        @page { size: 80mm auto; margin: 4mm; }
        body { font-family: 'Sarabun', 'Prompt', sans-serif; text-align: center; padding: 16px 12px; margin: 0; color: #111827; background: #fff; }
        .brand { font-size: 20px; font-weight: 800; color: #336846; }
        .sub { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-top: 2px; }
        .table-box { border: 2px solid #111827; background: #f9fafb; border-radius: 12px; padding: 8px 18px; display: inline-block; font-size: 24px; font-weight: 900; margin: 12px 0 6px 0; }
        .instruction { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px; }
        .qr-img { width: 200px; height: 200px; display: block; margin: 0 auto; border: 2px solid #003B70; border-radius: 12px; }
        .amount { font-size: 26px; font-weight: 900; color: #003B70; margin: 8px 0; }
        .divider { border-top: 1px dashed #9ca3af; margin: 14px 0 10px 0; }
        .footer { font-size: 11px; color: #6b7280; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="brand">🌶️ ร้านตำครกซิ่ง</div>
      <div class="sub">TUMKROKZING RESTAURANT</div>
      <div class="table-box">ใบแจ้งยอดชำระเงิน (โต๊ะ ${t.id})</div>
      <div>วันที่: ${nowStr}</div>
      <div class="amount">ยอดสุทธิ ฿${t.total.toLocaleString()}</div>
      <div class="instruction">📱 สแกน QR ผ่าน Mobile Banking หรือ Stripe เพื่อชำระเงิน</div>
      <img class="qr-img" src="${payQrDataUrl.value}" alt="QR Code" />
      <div style="font-size: 11px; color: #4b5563; margin-top: 8px;">
        ร้านตำครกซิ่ง | พร้อมเพย์: 081-234-5678
      </div>
      <div class="divider"></div>
      <div class="footer">
        สแกนผ่านแอปธนาคารทุกธนาคารเพื่อชำระเงินได้ทันที<br/>
        ขอบคุณที่ใช้บริการครับ / ค่ะ
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 200);
        };
      <\/script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

const confirmTablePaymentFromModal = async () => {
  if (!selectedPayTable.value || isPaying.value) return
  isPaying.value = true
  const t = selectedPayTable.value

  try {
    const ordersRes = await axios.get(`${API_BASE}/orders`)
    const allOrders = ordersRes.data || []
    const activeOrders = allOrders.filter(o => 
      (o.table_id === t.table_id || o.table?.table_number === t.id) &&
      ['PENDING', 'COOKING', 'READY', 'SERVED'].includes((o.status || '').toUpperCase())
    )

    for (const ord of activeOrders) {
      await axios.post(`${API_BASE}/transactions/stripe/confirm-test/${ord.order_id}`).catch(() => {
        return axios.patch(`${API_BASE}/orders/${ord.order_id}/status`, { status: 'PAID' })
      })
    }

    if (t.table_id) {
      await axios.patch(`${API_BASE}/tables/${t.table_id}/status`, { status: 'AVAILABLE' }).catch(() => {})
    }

    alert(`ชำระเงินโต๊ะ ${t.id} สำเร็จเรียบร้อยแล้ว`)
    isPaymentModalOpen.value = false
    await fetchTablesData()
  } catch (err) {
    console.error('ชำระเงินไม่สำเร็จ:', err)
    alert('เกิดข้อผิดพลาดในการชำระเงิน')
  } finally {
    isPaying.value = false
  }
}

const openQrModal = async (table) => {
  selectedQrTable.value = table
  const numId = table.table_id || Number(String(table.id).replace(/\D/g, '')) || 1
  selectedQrUrl.value = `${window.location.origin}/table/${numId}`
  try {
    selectedQrDataUrl.value = await QRCode.toDataURL(selectedQrUrl.value, {
      width: 260,
      margin: 2,
      color: { dark: '#1B3828', light: '#FFFFFF' }
    })
    isQrModalOpen.value = true
  } catch (e) {
    console.error(e)
  }
}

const printSingleQr = () => {
  if (!selectedQrTable.value) return
  const printWindow = window.open('', '_blank', 'width=450,height=640')
  if (!printWindow) return
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>QR สั่งอาหาร - โต๊ะ ${selectedQrTable.value.id}</title>
      <style>
        @page { size: 80mm auto; margin: 4mm; }
        body { font-family: 'Sarabun', 'Prompt', sans-serif; text-align: center; padding: 16px 12px; margin: 0; color: #111827; background: #fff; }
        .brand { font-size: 22px; font-weight: 800; color: #336846; }
        .sub { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-top: 2px; }
        .table-box { border: 2px solid #111827; background: #f9fafb; border-radius: 12px; padding: 8px 18px; display: inline-block; font-size: 26px; font-weight: 900; margin: 12px 0 6px 0; }
        .instruction { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; }
        .qr-img { width: 220px; height: 220px; display: block; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; }
        .url-text { font-size: 11px; color: #6b7280; word-break: break-all; margin-top: 8px; font-family: monospace; }
        .divider { border-top: 1px dashed #9ca3af; margin: 14px 0 10px 0; }
        .footer { font-size: 11px; color: #6b7280; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="brand">🌶️ ร้านตำครกซิ่ง</div>
      <div class="sub">TUMKROKZING RESTAURANT</div>
      <div class="table-box">โต๊ะ ${selectedQrTable.value.id}</div>
      <div class="instruction">📱 สแกน QR Code เพื่อสั่งอาหาร</div>
      <img class="qr-img" src="${selectedQrDataUrl.value}" alt="QR Code" />
      <div class="url-text">${selectedQrUrl.value}</div>
      <div class="divider"></div>
      <div class="footer">
        สแกนผ่านกล้องโทรศัพท์ หรือ LINE เพื่อเลือกเมนูสั่งอาหารได้ทันที<br/>
        ขอบคุณที่ใช้บริการครับ / ค่ะ
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 200);
        };
      <\/script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

const printAllTablesQr = async () => {
  const qrItems = []
  for (const t of tables.value) {
    const numId = t.table_id || Number(String(t.id).replace(/\D/g, '')) || 1
    const url = `${window.location.origin}/table/${numId}`
    const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 2, color: { dark: '#1B3828', light: '#FFFFFF' } })
    qrItems.push({ id: t.id, url, dataUrl })
  }

  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) return

  const cardsHtml = qrItems.map(item => `
    <div style="border: 2px dashed #336846; border-radius: 16px; padding: 14px; text-align: center; background: white; page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size: 18px; font-weight: 800; color: #336846;">🌶️ ร้านตำครกซิ่ง</div>
      <div style="font-size: 10px; color: #6b7280; text-transform: uppercase;">TUMKROKZING</div>
      <div style="border: 2px solid #111827; background: #f9fafb; border-radius: 10px; padding: 4px 12px; display: inline-block; font-size: 20px; font-weight: 900; margin: 6px 0;">
        โต๊ะ ${item.id}
      </div>
      <div style="font-size: 11px; font-weight: bold; color: #374151; margin-bottom: 4px;">📱 สแกนสั่งอาหาร</div>
      <img src="${item.dataUrl}" style="width: 150px; height: 150px; display: block; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 6px;" />
      <div style="font-size: 10px; color: #6b7280; font-family: monospace; margin-top: 4px;">${item.url}</div>
    </div>
  `).join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>พิมพ์ QR Code ทุกโต๊ะ - ร้านตำครกซิ่ง</title>
      <style>
        @page { size: A4 portrait; margin: 8mm; }
        body { font-family: 'Sarabun', 'Prompt', sans-serif; margin: 0; padding: 8px; background: #fff; }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 12px;">
        <h2 style="margin: 0; color: #336846;">ใบ QR Code สำหรับตั้งโต๊ะอาหาร (ร้านตำครกซิ่ง)</h2>
        <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">พิมพ์ ตัดตามรอยประ และนำไปวางใส่ป้ายอะคริลิคประจำแต่ละโต๊ะ</p>
      </div>
      <div class="grid-container">
        ${cardsHtml}
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 200);
        };
      <\/script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

const copyQrUrl = () => {
  if (!selectedQrUrl.value) return
  navigator.clipboard.writeText(selectedQrUrl.value)
  alert('คัดลอกลิงก์สั่งอาหารของโต๊ะนี้แล้ว: ' + selectedQrUrl.value)
}

const handleAddTable = async () => {
  if (!newTable.value.id.trim()) {
    alert('กรุณากรอกชื่อหรือหมายเลขโต๊ะ เช่น T-06')
    return
  }

  try {
    await axios.post(`${API_BASE}/tables`, {
      table_number: newTable.value.id.trim(),
      capacity: Number(newTable.value.capacity) || 4
    })
    await fetchTablesData()
  } catch (e) {
    tables.value.push({
      id: newTable.value.id.trim(),
      status: 'available',
      seats: 0,
      capacity: Number(newTable.value.capacity) || 4,
      total: 0
    })
  }

  // รีเซ็ตค่าและปิด Modal
  newTable.value = { id: '', capacity: 4 }
  isAddModalOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900">แผนผังและการจัดการโต๊ะอาหาร (Table Controller)</h1>
        <p class="text-xs text-slate-500">แสดงสถานะโต๊ะแบบเรียลไทม์ (ว่าง, กำลังทาน, รอเช็คบิล) ควบคุม QR Code ประจำโต๊ะ</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ว่าง: {{ countAvailable }}
        </span>
        <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> มีลูกค้า: {{ countOccupied }}
        </span>
        <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> รอเช็คบิล: {{ countBilling }}
        </span>
      </div>
    </div>

    <!-- Filter Bar Card -->
    <div style="background-color: #EFECE3; border-radius: 20px; padding: 12px 16px; border: 1px solid rgba(227,222,195,0.8); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <!-- ทั้งหมด -->
        <button
          @click="activeFilter = 'all'"
          style="padding: 8px 20px; border-radius: 12px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s;"
          :style="activeFilter === 'all' ? 'background-color: #48785A; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'background-color: transparent; color: #4B5563;'"
        >
          ทั้งหมด ({{ countAll }})
        </button>

        <!-- ว่าง -->
        <button
          @click="activeFilter = 'available'"
          style="padding: 8px 20px; border-radius: 12px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s;"
          :style="activeFilter === 'available' ? 'background-color: #48785A; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'background-color: #E3DFD5; color: #4B5563;'"
        >
          ว่าง ({{ countAvailable }})
        </button>

        <!-- กำลังทาน -->
        <button
          @click="activeFilter = 'occupied'"
          style="padding: 8px 20px; border-radius: 12px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s;"
          :style="activeFilter === 'occupied' ? 'background-color: #48785A; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'background-color: #E3DFD5; color: #4B5563;'"
        >
          กำลังทาน ({{ countOccupied }})
        </button>

        <!-- รอเช็คบิล -->
        <button
          @click="activeFilter = 'billing'"
          style="padding: 8px 20px; border-radius: 12px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s;"
          :style="activeFilter === 'billing' ? 'background-color: #819BF8; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'background-color: rgba(129,155,248,0.3); color: #374151;'"
        >
          รอเช็คบิล ({{ countBilling }})
        </button>
      </div>

      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <!-- ปุ่มพิมพ์ QR ทุกโต๊ะ -->
        <button 
          @click="printAllTablesQr"
          style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background-color: #336846; color: white; border: none; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;"
          title="พิมพ์ QR Code ใบตั้งโต๊ะสำหรับทั้ง 5 โต๊ะพร้อมกัน"
        >
          <span>🖨️</span> พิมพ์ QR ทุกโต๊ะ
        </button>

        <!-- ปุ่มเพิ่มโต๊ะใหม่ -->
        <button 
          @click="isAddModalOpen = true"
          style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background-color: white; border: 1px solid #D1D5DB; border-radius: 12px; font-size: 12px; font-weight: 600; color: #1F2937; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: background-color 0.2s;"
        >
          <span style="font-size: 14px; font-weight: bold;">+</span> เพิ่มโต๊ะใหม่
        </button>
      </div>
    </div>

    <!-- Tables Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;">
      <div
        v-for="table in filteredTables"
        :key="table.id"
        @click="goToTableDetail(table.id)"
        style="background-color: #EFECE3; border-radius: 20px; padding: 18px; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.02); cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; min-height: 165px; position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;"
        :style="table.status === 'occupied' ? 'border-left: 5px solid #3D664C;' : table.status === 'billing' ? 'border-left: 5px solid #4F46E5;' : 'border-left: 5px solid #D1D5DB;'"
      >
        <!-- Card Top Row (Table Name & Status Badge) -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h3 style="font-size: 22px; font-weight: 700; color: #1F2937; margin: 0; letter-spacing: -0.5px;">
            {{ table.id }}
          </h3>
          <span
            style="font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 8px; display: flex; align-items: center; gap: 6px;"
            :style="table.status === 'occupied' ? 'background-color: #48785A; color: white;' : table.status === 'billing' ? 'background-color: #819BF8; color: white;' : 'background-color: #E3DFD5; color: #4B5563;'"
          >
            <span v-if="table.status === 'occupied' || table.status === 'billing'" style="width: 6px; height: 6px; border-radius: 9999px; background-color: white; display: inline-block;"></span>
            {{ statusMap[table.status].label }}
          </span>
        </div>

        <!-- Card Middle Row (Customer Count / Guests Controls จำกัดไม่เกินความจุโต๊ะ) -->
        <div style="margin: 8px 0;">
          <div 
            v-if="table.status === 'occupied' || table.status === 'billing'" 
            style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.6); padding: 5px 8px; border-radius: 10px; border: 1px solid rgba(209,213,219,0.5);"
          >
            <span style="font-size: 12px; color: #374151; font-weight: 600;">👥 ลูกค้า:</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button 
                @click.stop="adjustTableGuests(table, -1)" 
                :disabled="table.seats <= 1"
                style="width: 22px; height: 22px; border-radius: 6px; background: white; border: 1px solid #D1D5DB; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #374151; font-size: 13px;"
                :style="table.seats <= 1 ? 'opacity: 0.4; cursor: not-allowed;' : ''"
                title="ลดจำนวนคน"
              >-</button>
              <b style="font-size: 14px; color: #111827; min-width: 14px; text-align: center;">{{ table.seats }}</b>
              <button 
                @click.stop="adjustTableGuests(table, 1)" 
                :disabled="table.seats >= table.capacity"
                style="width: 22px; height: 22px; border-radius: 6px; background: white; border: 1px solid #D1D5DB; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #374151; font-size: 13px;"
                :style="table.seats >= table.capacity ? 'opacity: 0.4; cursor: not-allowed;' : ''"
                title="เพิ่มจำนวนคน (ไม่เกินความจุโต๊ะ)"
              >+</button>
              <span style="font-size: 11px; color: #6B7280;">/ {{ table.capacity }} ที่</span>
            </div>
          </div>
          <div 
            v-else 
            style="display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; color: #6B7280; font-size: 12px;"
          >
            <span style="display: flex; align-items: center; gap: 4px; font-weight: 500;">
              <span>👥 โต๊ะว่าง</span>
            </span>
            <span style="font-size: 11px; color: #9CA3AF;">จุได้ {{ table.capacity }} ที่นั่ง</span>
          </div>
        </div>

        <!-- Card Bottom Row (Open/Close Button, QR Button & Total Price) -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 13px; gap: 4px;">
          <!-- Open / Close Table Action Button -->
          <div>
            <button
              v-if="table.status === 'available'"
              @click.stop="openTableModal(table)"
              style="padding: 5px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; background: #48785A; color: white; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;"
              title="เปิดโต๊ะเพื่อรับลูกค้า"
            >
              <span>🟢</span> เปิดโต๊ะ
            </button>
            <button
              v-else
              @click.stop="closeOrClearTable(table)"
              style="padding: 5px 10px; border-radius: 10px; font-size: 11px; font-weight: 700; background: #FEE2E2; color: #B91C1C; border: 1px solid #FCA5A5; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background-color 0.2s;"
              title="ปิดโต๊ะและเปลี่ยนสถานะเป็นว่าง"
            >
              <span>⚪</span> ปิดโต๊ะ
            </button>
          </div>

          <!-- Right: Payment, QR & Total -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <button
              v-if="table.total > 0"
              @click.stop="openPaymentModal(table)"
              style="padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; background: #003B70; color: white; border: none; cursor: pointer; display: flex; align-items: center; gap: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;"
              title="พิมพ์ใบเรียกเก็บเงินและ QR ชำระเงิน"
            >
              <span>🧾</span> จ่ายเงิน
            </button>
            <button
              @click.stop="openQrModal(table)"
              style="padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; background: white; border: 1px solid #D1D5DB; color: #374151; cursor: pointer; display: flex; align-items: center; gap: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); transition: background-color 0.2s;"
              title="ดู QR Code สำหรับสแกนสั่งอาหารของโต๊ะนี้"
            >
              <span>📱</span> QR
            </button>
            <div style="font-weight: 700; font-size: 14px;" :style="table.total > 0 ? 'color: #2563EB;' : 'color: #9CA3AF;'">
              ฿{{ table.total.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal เปิดโต๊ะพร้อมเลือกจำนวนคน (จำกัดไม่เกินความจุโต๊ะ) -->
    <div v-if="isTableOpenModalVisible && selectedOpenTable" style="position: fixed; inset: 0; background-color: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 60;">
      <div style="background-color: white; border-radius: 24px; max-width: 380px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 18px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px;">
          <div>
            <h3 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0;">
              🟢 เปิดโต๊ะ {{ selectedOpenTable.id }}
            </h3>
            <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0 0;">
              ความจุโต๊ะ: {{ selectedOpenTable.capacity }} ที่นั่ง
            </p>
          </div>
          <button @click="isTableOpenModalVisible = false" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #9CA3AF; padding: 4px;">✕</button>
        </div>

        <!-- Guest count input / Stepper -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <label style="font-size: 13px; font-weight: 700; color: #374151;">ระบุจำนวนลูกค้าที่นั่ง (สูงสุด {{ selectedOpenTable.capacity }} คน):</label>
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px; background-color: #F9FAFB; padding: 12px; border-radius: 16px; border: 1.5px solid #E5E7EB;">
            <button
              @click="openTableGuests = Math.max(1, openTableGuests - 1)"
              :disabled="openTableGuests <= 1"
              style="width: 40px; height: 40px; border-radius: 12px; background: white; border: 1px solid #D1D5DB; font-size: 20px; font-weight: bold; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"
              :style="openTableGuests <= 1 ? 'opacity: 0.4; cursor: not-allowed;' : ''"
              title="ลดจำนวนคน"
            >-</button>
            <div style="font-size: 28px; font-weight: 900; color: #111827; min-width: 48px; text-align: center;">
              {{ openTableGuests }}
            </div>
            <button
              @click="openTableGuests = Math.min(selectedOpenTable.capacity, openTableGuests + 1)"
              :disabled="openTableGuests >= selectedOpenTable.capacity"
              style="width: 40px; height: 40px; border-radius: 12px; background: white; border: 1px solid #D1D5DB; font-size: 20px; font-weight: bold; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"
              :style="openTableGuests >= selectedOpenTable.capacity ? 'opacity: 0.4; cursor: not-allowed;' : ''"
              title="เพิ่มจำนวนคน"
            >+</button>
            <span style="font-size: 15px; font-weight: 600; color: #4B5563;">/ {{ selectedOpenTable.capacity }} คน</span>
          </div>

          <!-- Quick Presets -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;">
            <button
              v-for="num in getAvailablePresets(selectedOpenTable.capacity)"
              :key="num"
              @click="openTableGuests = num"
              :style="{
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700',
                border: openTableGuests === num ? '1.5px solid #48785A' : '1px solid #E5E7EB',
                backgroundColor: openTableGuests === num ? '#E8F3EC' : 'white',
                color: openTableGuests === num ? '#48785A' : '#4B5563',
                cursor: 'pointer'
              }"
            >
              {{ num }} คน
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 8px;">
          <button
            @click="isTableOpenModalVisible = false"
            style="flex: 1; padding: 12px 0; border-radius: 14px; font-size: 14px; font-weight: 600; background: #F3F4F6; color: #4B5563; border: none; cursor: pointer;"
          >
            ยกเลิก
          </button>
          <button
            @click="confirmOpenTable"
            style="flex: 1; padding: 12px 0; border-radius: 14px; font-size: 14px; font-weight: 700; background: #48785A; color: white; border: none; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
          >
            ยืนยันเปิดโต๊ะ
          </button>
        </div>
      </div>
    </div>

    <!-- Modal เพิ่มโต๊ะใหม่ -->
    <div v-if="isAddModalOpen" style="position: fixed; inset: 0; background-color: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
      <div style="background-color: white; border-radius: 20px; max-width: 360px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1F2937; margin: 0;">เพิ่มโต๊ะอาหารใหม่</h3>
          <button @click="isAddModalOpen = false" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #9CA3AF;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 13px; font-weight: 600; color: #4B5563;">ชื่อ / หมายเลขโต๊ะ</label>
          <input 
            v-model="newTable.id" 
            type="text" 
            placeholder="เช่น T-06 หรือ VIP-1" 
            style="padding: 10px 14px; border-radius: 12px; border: 1px solid #D1D5DB; font-size: 14px; outline: none;"
          />
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 13px; font-weight: 600; color: #4B5563;">จำนวนที่นั่ง (ความจุ)</label>
          <input 
            v-model.number="newTable.capacity" 
            type="number" 
            min="1" 
            max="30"
            style="padding: 10px 14px; border-radius: 12px; border: 1px solid #D1D5DB; font-size: 14px; outline: none;"
          />
        </div>

        <div style="display: flex; gap: 10px; margin-top: 8px;">
          <button 
            @click="isAddModalOpen = false" 
            style="flex: 1; padding: 10px 0; border-radius: 12px; font-size: 13px; font-weight: 600; background: #F3F4F6; color: #4B5563; border: none; cursor: pointer;"
          >
            ยกเลิก
          </button>
          <button 
            @click="handleAddTable" 
            style="flex: 1; padding: 10px 0; border-radius: 12px; font-size: 13px; font-weight: 600; background: #48785A; color: white; border: none; cursor: pointer;"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>

    <!-- Modal แสดง QR Code โต๊ะเดี่ยว -->
    <div v-if="isQrModalOpen && selectedQrTable" style="position: fixed; inset: 0; background-color: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
      <div style="background-color: white; border-radius: 20px; max-width: 380px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center;">
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div style="text-align: left;">
            <h3 style="font-size: 18px; font-weight: bold; color: #1F2937; margin: 0;">QR สั่งอาหารโต๊ะ {{ selectedQrTable.id }}</h3>
            <span style="font-size: 12px; color: #6B7280;">สแกนเพื่อเปิดเมนูสั่งอาหาร</span>
          </div>
          <button @click="isQrModalOpen = false" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #9CA3AF;">✕</button>
        </div>

        <div style="padding: 16px; background: #FAF9F5; border-radius: 16px; border: 1px solid rgba(227,222,195,0.8); display: flex; flex-direction: column; align-items: center;">
          <img :src="selectedQrDataUrl" alt="QR Code" style="width: 220px; height: 220px; display: block; border-radius: 12px;" />
          <span style="font-size: 12px; color: #48785A; font-weight: 600; margin-top: 10px;">โต๊ะ {{ selectedQrTable.id }}</span>
          <span style="font-size: 11px; color: #9CA3AF; word-break: break-all; max-width: 240px; margin-top: 2px;">{{ selectedQrUrl }}</span>
        </div>

        <div style="display: flex; gap: 8px; width: 100%;">
          <button 
            @click="printSingleQr" 
            style="flex: 1; padding: 10px 0; border-radius: 12px; font-size: 13px; font-weight: 600; background: #48785A; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"
          >
            <span>🖨️</span> พิมพ์ QR
          </button>
          <button 
            @click="copyQrUrl" 
            style="flex: 1; padding: 10px 0; border-radius: 12px; font-size: 13px; font-weight: 600; background: white; color: #374151; border: 1px solid #D1D5DB; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"
          >
            <span>🔗</span> คัดลอกลิงก์
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ชำระเงิน / เรียกเก็บเงิน (Payment Modal) -->
    <div v-if="isPaymentModalOpen && selectedPayTable" style="position: fixed; inset: 0; background-color: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 55;">
      <div style="background-color: white; border-radius: 24px; max-width: 420px; width: 100%; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column; gap: 16px; text-align: center;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px;">
          <div style="text-align: left;">
            <h3 style="font-size: 18px; font-weight: 800; color: #111827; margin: 0;">
              🧾 ชำระเงิน / เช็คบิล (โต๊ะ {{ selectedPayTable.id }})
            </h3>
            <span style="font-size: 12px; color: #6B7280;">ตรวจสอบยอดและสแกนจ่ายผ่าน QR</span>
          </div>
          <button @click="isPaymentModalOpen = false" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #9CA3AF;">✕</button>
        </div>

        <!-- รายการออเดอร์ย่อ -->
        <div style="max-height: 140px; overflow-y: auto; text-align: left; background: #F9FAFB; border-radius: 12px; padding: 10px 14px; border: 1px solid #E5E7EB; font-size: 12px;">
          <div v-if="!selectedPayTable.activeOrders || selectedPayTable.activeOrders.length === 0" style="color: #9CA3AF; text-align: center; padding: 8px 0;">
            ไม่มีรายการออเดอร์ค้าง
          </div>
          <div v-for="ord in selectedPayTable.activeOrders" :key="ord.order_id" style="margin-bottom: 8px; border-bottom: 1px dashed #E5E7EB; padding-bottom: 6px;">
            <div style="font-weight: 700; color: #374151; display: flex; justify-content: space-between;">
              <span>ออเดอร์ #{{ ord.order_id }} ({{ ord.status }})</span>
              <span>฿{{ Number(ord.total_price || 0).toLocaleString() }}</span>
            </div>
            <div v-if="ord.order_items" style="color: #6B7280; font-size: 11px; margin-top: 2px;">
              <span v-for="item in ord.order_items" :key="item.order_item_id" style="display: inline-block; margin-right: 8px;">
                • {{ item.menu?.menu_name || 'อาหาร' }} x{{ item.quantity }}
              </span>
            </div>
          </div>
        </div>

        <!-- ยอดชำระเงินรวม -->
        <div style="background: #FAF9F5; border-radius: 16px; padding: 14px; border: 1px solid rgba(227,222,195,0.8); display: flex; flex-direction: column; align-items: center;">
          <span style="font-size: 12px; font-weight: 600; color: #4B5563;">ยอดชำระสุทธิ (Net Total)</span>
          <span style="font-size: 28px; font-weight: 900; color: #003B70; margin: 4px 0;">฿{{ selectedPayTable.total.toLocaleString() }}</span>
          
          <!-- Badge แสดงระบบชำระเงิน -->
          <div style="display: flex; gap: 6px; margin: 4px 0 8px 0;">
            <span style="background: #003B70; color: white; padding: 2px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700;">พร้อมเพย์</span>
            <span style="background: #635BFF; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700;">Stripe</span>
          </div>

          <!-- รูป QR PromptPay -->
          <img :src="payQrDataUrl" alt="Payment QR" style="width: 170px; height: 170px; display: block; border-radius: 10px; border: 1px solid #E5E7EB;" />
          <span style="font-size: 11px; color: #4B5563; margin-top: 6px;">ร้านตำครกซิ่ง | พร้อมเพย์: 081-234-5678</span>
        </div>

        <!-- ปุ่ม Action ใน Modal -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; gap: 8px;">
            <button 
              @click="printTablePaymentSlip" 
              style="flex: 1; padding: 11px 0; border-radius: 12px; font-size: 13px; font-weight: 600; background: white; color: #374151; border: 1px solid #D1D5DB; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"
            >
              <span>🖨️</span> พิมพ์ใบแจ้งหนี้
            </button>
            <button 
              @click="confirmTablePaymentFromModal" 
              :disabled="isPaying"
              style="flex: 1.2; padding: 11px 0; border-radius: 12px; font-size: 13px; font-weight: 700; background: #003B70; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
            >
              <span>💳</span>
              <span>{{ isPaying ? 'กำลังดำเนินการ...' : 'ยืนยันรับเงินเสร็จสิ้น' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>