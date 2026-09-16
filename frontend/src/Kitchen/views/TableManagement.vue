<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { API_BASE } from '../../config/api'

const router = useRouter()
const route = useRoute()

// เมนู/ตัวกรองที่เลือกอยู่
const activeFilter = ref('all')
let pollingTimer = null

// ป๊อปอัพสำหรับเพิ่มโต๊ะใหม่
const isAddModalOpen = ref(false)
const newTable = ref({
  id: '',
  capacity: 4
})

// ข้อมูลสถานะและสีประจำสถานะ (ปรับโทนสีให้ละมุนและเข้ากันมากขึ้น)
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
      // ค้นหาออเดอร์ของโต๊ะนี้ที่ยังทานอยู่ (PENDING, COOKING, READY, PAID)
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

      return {
        table_id: t.table_id,
        id: t.table_number || `T-0${t.table_id}`,
        status: currentStatus,
        seats: activeOrders.length > 0 ? (t.capacity || 4) : 0,
        capacity: t.capacity || 4,
        total: totalAmount,
        activeOrders
      }
    })
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลโต๊ะจาก API ได้:', err)
  }
}

onMounted(() => {
  fetchTablesData()
  pollingTimer = setInterval(fetchTablesData, 5000)
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

import QRCode from 'qrcode'

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
          setTimeout(function() { window.print(); }, 300);
        };
      <\/script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

const copySingleLink = async () => {
  try {
    await navigator.clipboard.writeText(selectedQrUrl.value)
    alert(`คัดลอกลิงก์สำเร็จ:\n${selectedQrUrl.value}`)
  } catch (e) {
    prompt('ลิงก์สั่งอาหารโต๊ะนี้:', selectedQrUrl.value)
  }
}

// ฟังก์ชั่นเพิ่มโต๊ะใหม่
const handleAddTable = async () => {
  if (!newTable.value.id.trim()) return
  
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
  <div style="display: flex; flex-direction: column; height: 100vh; overflow: hidden; background-color: #FAF9F5; font-family: sans-serif;">
    <!-- Top Bar Header -->
    <header style="background-color: #48785A; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; color: white;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <h1 style="font-size: 20px; font-weight: 500; margin: 0; letter-spacing: 0.5px;">จัดการโต๊ะและคิวอาร์โค้ด</h1>
      </div>
      
      <div style="display: flex; align-items: center; gap: 24px; color: rgba(255,255,255,0.9); font-size: 18px;">
        <button style="cursor: pointer; background: none; border: none; color: inherit;">🔔</button>
        <button style="width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.4); background: none; cursor: pointer; padding: 0;">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        </button>
      </div>
    </header>

    <!-- Main Body Area -->
    <main style="flex: 1; overflow-y: auto; padding: 32px; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 100%; max-width: 1152px; display: flex; flex-direction: column; gap: 24px;">

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
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px;">
          <div
            v-for="table in filteredTables"
            :key="table.id"
            @click="goToTableDetail(table.id)"
            style="background-color: #EFECE3; border-radius: 20px; padding: 20px; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.02); cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; height: 140px; position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;"
            :style="table.status === 'occupied' ? 'border-left: 4px solid #3D664C;' : table.status === 'billing' ? 'border-left: 4px solid #4F46E5;' : 'border-left: 4px solid #D1D5DB;'"
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

            <!-- Card Bottom Row (Seats, QR Button & Total Price) -->
            <div style="display: flex; align-items: flex-end; justify-content: space-between; font-size: 13px;">
              <!-- Seats Info -->
              <div style="display: flex; align-items: center; gap: 6px; color: #6B7280; font-weight: 500;">
                <svg xmlns="http://www.w3.org/2000/svg" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>{{ table.seats }}/{{ table.capacity }} ที่นั่ง</span>
              </div>

              <!-- QR Code Quick Button, Payment Button & Total Amount -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <button
                  v-if="table.total > 0"
                  @click.stop="openPaymentModal(table)"
                  style="padding: 3px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; background: #003B70; color: white; border: none; cursor: pointer; display: flex; align-items: center; gap: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;"
                  title="พิมพ์ใบเรียกเก็บเงินและ QR ชำระเงิน"
                >
                  <span>🧾</span> จ่ายเงิน
                </button>
                <button
                  @click.stop="openQrModal(table)"
                  style="padding: 3px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; background: white; border: 1px solid #D1D5DB; color: #374151; cursor: pointer; display: flex; align-items: center; gap: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); transition: background-color 0.2s;"
                  title="ดู QR Code สำหรับสแกนสั่งอาหารของโต๊ะนี้"
                >
                  <span>📱</span> QR
                </button>
                <div style="font-weight: 700; font-size: 15px;" :style="table.total > 0 ? 'color: #2563EB;' : 'color: #9CA3AF;'">
                  ฿{{ table.total.toLocaleString() }}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Modal เพิ่มโต๊ะใหม่ -->
    <div v-if="isAddModalOpen" style="position: fixed; inset: 0; background-color: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
      <div style="background-color: white; border-radius: 20px; max-width: 360px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 16px;">
        <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0;">เพิ่มโต๊ะอาหารใหม่</h3>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #4B5563; display: block; margin-bottom: 4px;">หมายเลข / ชื่อโต๊ะ (เช่น T-05)</label>
            <input 
              v-model="newTable.id" 
              type="text" 
              placeholder="T-05"
              style="width: 100%; border: 1px solid #D1D5DB; border-radius: 12px; padding: 10px 14px; font-size: 14px; outline: none; box-sizing: border-box;"
            />
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #4B5563; display: block; margin-bottom: 4px;">จำนวนที่นั่งสูงสุด (Capacity)</label>
            <input 
              v-model="newTable.capacity" 
              type="number" 
              min="1"
              style="width: 100%; border: 1px solid #D1D5DB; border-radius: 12px; padding: 10px 14px; font-size: 14px; outline: none; box-sizing: border-box;"
            />
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 4px;">
          <button 
            @click="isAddModalOpen = false"
            style="padding: 8px 16px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #4B5563; background: transparent; border: none; cursor: pointer;"
          >
            ยกเลิก
          </button>
          <button 
            @click="handleAddTable"
            style="padding: 8px 16px; background-color: #48785A; color: white; border-radius: 12px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>

    <!-- Modal แสดง QR Code สั่งอาหารประจำโต๊ะ -->
    <div v-if="isQrModalOpen && selectedQrTable" style="position: fixed; inset: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 60;">
      <div style="background-color: white; border-radius: 24px; max-width: 380px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px;">
        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0;">QR Code สั่งอาหาร</h3>
          <button @click="isQrModalOpen = false" style="background: none; border: none; font-size: 20px; color: #9CA3AF; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <div style="background: #FAF9F5; border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 6px 18px; font-size: 20px; font-weight: 800; color: #1F2937;">
          โต๊ะ {{ selectedQrTable.id }}
        </div>

        <p style="font-size: 12px; color: #6B7280; margin: 0; line-height: 1.4;">
          ลูกค้าใช้โทรศัพท์สแกน QR Code นี้เพื่อเลือกเมนูและสั่งอาหารเข้าสู่ระบบร้านได้ทันที
        </p>

        <div style="padding: 10px; background: white; border-radius: 16px; border: 2px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <img :src="selectedQrDataUrl" :alt="`QR Code โต๊ะ ${selectedQrTable.id}`" style="width: 200px; height: 200px; display: block;" />
        </div>

        <div style="font-size: 11px; color: #6B7280; font-family: monospace; background: #F3F4F6; padding: 6px 12px; border-radius: 8px; border: 1px solid #E5E7EB; width: 100%; box-sizing: border-box; word-break: break-all;">
          {{ selectedQrUrl }}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; margin-top: 4px;">
          <button 
            @click="printSingleQr"
            style="padding: 10px; background-color: #48785A; color: white; border: none; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"
          >
            <span>🖨️</span> พิมพ์ใบ QR
          </button>
          <button 
            @click="copySingleLink"
            style="padding: 10px; background-color: white; border: 1px solid #D1D5DB; color: #374151; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"
          >
            <span>📋</span> คัดลอกลิงก์
          </button>
        </div>

        <a 
          :href="selectedQrUrl" 
          target="_blank" 
          style="font-size: 12px; color: #336846; text-decoration: underline; font-weight: 600; margin-top: 2px;"
        >
          🌐 ทดลองเปิดสั่งอาหารในแท็บใหม่
        </a>
      </div>
    </div>

    <!-- Modal ชำระเงิน / เช็คบิล (PromptPay & Stripe Payment) -->
    <div v-if="isPaymentModalOpen && selectedPayTable" style="position: fixed; inset: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 65;">
      <div style="background-color: white; border-radius: 24px; max-width: 400px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px;">
        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="background: #003B70; color: white; padding: 2px 10px; border-radius: 9999px; font-weight: 800; font-size: 11px;">PromptPay</span>
            <span style="background: #635bff; color: white; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 10px;">Stripe</span>
          </div>
          <button @click="isPaymentModalOpen = false" style="background: none; border: none; font-size: 20px; color: #9CA3AF; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <div style="background: #FAF9F5; border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 6px 18px; font-size: 18px; font-weight: 800; color: #1F2937;">
          เช็คบิล โต๊ะ {{ selectedPayTable.id }}
        </div>

        <div style="font-size: 13px; color: #374151; font-weight: 600;">
          ยอดสุทธิที่ต้องชำระ: <span style="font-size: 22px; font-weight: 900; color: #003B70;">฿{{ selectedPayTable.total.toLocaleString() }}</span>
        </div>

        <div style="padding: 10px; background: white; border-radius: 16px; border: 2px solid #003B70; box-shadow: 0 4px 12px rgba(0,59,112,0.1);">
          <img :src="payQrDataUrl" :alt="`QR ชำระเงิน โต๊ะ ${selectedPayTable.id}`" style="width: 200px; height: 200px; display: block;" />
        </div>

        <div style="font-size: 11px; color: #4B5563; line-height: 1.3;">
          ร้านตำครกซิ่ง (นายธีรวัฒน์ แสนคำเฮียง)<br/>
          <span style="font-family: monospace; color: #003B70; font-weight: 700;">พร้อมเพย์: 081-234-5678</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; margin-top: 6px;">
          <button 
            @click="printTablePaymentSlip"
            style="padding: 10px; background-color: #003B70; color: white; border: none; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"
          >
            <span>🖨️</span> พิมพ์ใบแจ้งหนี้
          </button>
          <button 
            @click="confirmTablePaymentFromModal"
            :disabled="isPaying"
            style="padding: 10px; background-color: #48785A; color: white; border: none; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"
          >
            <span>💳</span> {{ isPaying ? 'กำลังบันทึก...' : 'รับเงินสำเร็จ (ปิดบิล)' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>