<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import QRCode from 'qrcode'
import { API_BASE } from '../../config/api'

const route = useRoute()
const router = useRouter()

const paramValue = computed(() => route.params.tableId || route.params.id || 'T-01')

const tableData = ref({
  id: paramValue.value,
  table_id: null,
  status: 'ว่าง (AVAILABLE)',
  time: '-',
  staff: 'พนักงานหน้าร้าน',
  customers: 0,
})

const orders = ref([])
const activeOrderIds = ref([])
const qrCodeDataUrl = ref('')

// หา tableId ตัวเลขสำหรับหน้าสั่งอาหารของลูกค้า (เช่น T-01 -> 1, T-02 -> 2)
const numericTableId = computed(() => {
  if (tableData.value.table_id) return tableData.value.table_id
  const match = String(tableData.value.id || paramValue.value).replace(/\D/g, '')
  return Number(match) || 1
})

const orderUrl = computed(() => {
  const origin = window.location.origin
  return `${origin}/table/${numericTableId.value}`
})

// ฟังก์ชันสร้าง QR Code สแกนสั่งอาหาร
const generateQr = async () => {
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(orderUrl.value, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1B3828',
        light: '#FFFFFF'
      }
    })
  } catch (err) {
    console.error('สร้าง QR Code ไม่สำเร็จ:', err)
  }
}

// ฟังก์ชันดึงรายละเอียดโต๊ะและออเดอร์ของโต๊ะนี้
const fetchTableDetail = async () => {
  try {
    const [tablesRes, ordersRes] = await Promise.all([
      axios.get(`${API_BASE}/tables`),
      axios.get(`${API_BASE}/orders`)
    ])

    const dbTables = tablesRes.data || []
    const allOrders = ordersRes.data || []

    const currentParam = String(paramValue.value).trim()
    const targetTable = dbTables.find(t => 
      String(t.table_number).toUpperCase() === currentParam.toUpperCase() ||
      String(t.table_id) === currentParam ||
      `T-0${t.table_id}`.toUpperCase() === currentParam.toUpperCase() ||
      `T-${t.table_id}`.toUpperCase() === currentParam.toUpperCase()
    ) || dbTables[0]

    if (targetTable) {
      tableData.value.id = targetTable.table_number || `T-0${targetTable.table_id}`
      tableData.value.table_id = targetTable.table_id

      // สร้าง QR Code ตามโต๊ะ
      await generateQr()

      // ค้นหาออเดอร์ที่ยังดำเนินอยู่ของโต๊ะนี้ (PENDING, COOKING, READY, PAID)
      const tableOrders = allOrders.filter(o => 
        (o.table_id === targetTable.table_id || o.table?.table_number === targetTable.table_number) &&
        ['PENDING', 'COOKING', 'READY', 'PAID'].includes((o.status || '').toUpperCase())
      )

      activeOrderIds.value = tableOrders.map(o => o.order_id)

      if (tableOrders.length > 0) {
        tableData.value.status = 'กำลังทาน (OCCUPIED)'
        const firstOrder = tableOrders[tableOrders.length - 1]
        tableData.value.time = new Date(firstOrder.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
        tableData.value.customers = targetTable.capacity || 4

        // รวมรายการอาหารจากออเดอร์ที่ค้างอยู่ของโต๊ะนี้
        const itemsList = []
        tableOrders.forEach(ord => {
          (ord.order_items || []).forEach((oi, idx) => {
            let noteStr = oi.notes || ''
            if (!noteStr && oi.customization) {
              if (typeof oi.customization === 'string') noteStr = oi.customization
              else if (typeof oi.customization === 'object') {
                const parts = []
                if (oi.customization.spicy && oi.customization.spicy !== '-') parts.push(`เผ็ด: ${oi.customization.spicy}`)
                if (oi.customization.no_msg) parts.push('ไม่ใส่ชูรส')
                if (oi.customization.note) parts.push(oi.customization.note)
                noteStr = parts.join(' | ')
              }
            }

            itemsList.push({
              id: `${ord.order_id}-${oi.order_item_id || idx}`,
              name: oi.menu?.menu_name || oi.menu?.name || oi.menu_name || `เมนู #${oi.menu_id}`,
              qty: Number(oi.quantity),
              price: Number(oi.unit_price || oi.menu?.price || 0),
              note: noteStr || '-',
              status: ['READY', 'SERVED'].includes((ord.status || '').toUpperCase()) ? 'served' : 'cooking'
            })
          })
        })
        orders.value = itemsList
      } else {
        tableData.value.status = 'ว่าง (AVAILABLE)'
        tableData.value.time = '-'
        tableData.value.customers = 0
        orders.value = []
      }
    }
  } catch (err) {
    console.error('โหลดรายละเอียดโต๊ะไม่สำเร็จ:', err)
  }
}

onMounted(() => {
  fetchTableDetail()
})

const subtotal = computed(() => {
  return orders.value.reduce((sum, item) => sum + (item.price * item.qty), 0)
})
const discount = computed(() => 0.00)
const netTotal = computed(() => subtotal.value - discount.value)

const changeCustomers = (delta) => {
  tableData.value.customers = Math.max(0, tableData.value.customers + delta)
}

const confirmPayment = async () => {
  if (orders.value.length === 0) {
    alert('โต๊ะนี้ยังไม่มีรายการอาหารค้างชำระครับ')
    return
  }

  if (confirm(`ยืนยันการชำระเงินโต๊ะ ${tableData.value.id} ยอดรวม ฿${netTotal.value.toLocaleString()}?`)) {
    try {
      for (const orderId of activeOrderIds.value) {
        await axios.patch(`${API_BASE}/orders/${orderId}/status`, { status: 'COMPLETED' })
      }
      if (tableData.value.table_id) {
        await axios.patch(`${API_BASE}/tables/${tableData.value.table_id}/status`, { status: 'AVAILABLE' }).catch(() => {})
      }
      alert(`ชำระเงินโต๊ะ ${tableData.value.id} เรียบร้อยแล้ว`)
      router.push('/kitchen/tables')
    } catch (err) {
      console.error('ชำระเงินไม่สำเร็จ:', err)
      alert('เกิดข้อผิดพลาดในการชำระเงิน')
    }
  }
}

const forceClear = async () => {
  if (confirm(`ยืนยันการบังคับปิดโต๊ะ ${tableData.value.id}? ออเดอร์ของโต๊ะนี้จะถูกเสร็จสิ้น`)) {
    try {
      for (const orderId of activeOrderIds.value) {
        await axios.patch(`${API_BASE}/orders/${orderId}/status`, { status: 'COMPLETED' })
      }
      if (tableData.value.table_id) {
        await axios.patch(`${API_BASE}/tables/${tableData.value.table_id}/status`, { status: 'AVAILABLE' }).catch(() => {})
      }
      router.push('/kitchen/tables')
    } catch (e) {
      router.push('/kitchen/tables')
    }
  }
}

const printQrSlip = () => {
  const printWindow = window.open('', '_blank', 'width=450,height=640')
  if (!printWindow) return
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>QR สั่งอาหาร - โต๊ะ ${tableData.value.id}</title>
      <style>
        @page { size: 80mm auto; margin: 4mm; }
        body {
          font-family: 'Sarabun', 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
          text-align: center;
          padding: 16px 12px;
          margin: 0;
          color: #111827;
          background: #fff;
        }
        .brand { font-size: 22px; font-weight: 800; color: #336846; letter-spacing: -0.5px; }
        .sub { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-top: 2px; }
        .table-box {
          border: 2px solid #111827;
          background: #f9fafb;
          border-radius: 12px;
          padding: 8px 18px;
          display: inline-block;
          font-size: 26px;
          font-weight: 900;
          margin: 12px 0 6px 0;
        }
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
      <div class="table-box">โต๊ะ ${tableData.value.id}</div>
      <div class="instruction">📱 สแกน QR Code เพื่อสั่งอาหาร</div>
      <img class="qr-img" src="${qrCodeDataUrl.value}" alt="QR Code" />
      <div class="url-text">${orderUrl.value}</div>
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

const copyOrderLink = async () => {
  try {
    await navigator.clipboard.writeText(orderUrl.value)
    alert(`คัดลอกลิงก์สั่งอาหารโต๊ะ ${tableData.value.id} สำเร็จ:\n${orderUrl.value}`)
  } catch (e) {
    prompt('ลิงก์สั่งอาหารโต๊ะนี้:', orderUrl.value)
  }
}

const openOrderPage = () => {
  window.open(orderUrl.value, '_blank')
}

const goBack = () => {
  router.push('/kitchen/tables')
}
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh; overflow: hidden; background-color: #FAF9F5; font-family: sans-serif;">
    <!-- Top Bar Header -->
    <header style="background-color: #48785A; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; color: white;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button 
          @click="goBack"
          style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 8px; transition: background-color 0.2s;"
          title="กลับหน้าจัดการโต๊ะ"
        >
          ←
        </button>
        <h1 style="font-size: 20px; font-weight: 500; margin: 0; letter-spacing: 0.5px;">รายละเอียดโต๊ะอาหาร</h1>
      </div>
      
      <div style="display: flex; align-items: center; gap: 24px; color: rgba(255,255,255,0.9); font-size: 18px;">
        <button style="cursor: pointer; background: none; border: none; color: inherit;">🔔</button>
        <button style="width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.4); background: none; cursor: pointer; padding: 0;">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        </button>
      </div>
    </header>

    <!-- Main Body Content -->
    <main style="flex: 1; overflow-y: auto; padding: 32px;">
      <div style="max-width: 1152px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Table Header Banner -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <h1 style="font-size: 32px; font-weight: 700; color: #111827; margin: 0; font-family: serif;">โต๊ะ {{ tableData.id }}</h1>
              <span style="background-color: #DCE7DF; color: #48785A; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 6px;">
                <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #48785A; display: inline-block;"></span>
                {{ tableData.status }}
              </span>
            </div>
            <p style="font-size: 12px; color: #6B7280; margin: 6px 0 0 0;">
              เปิดโต๊ะ: {{ tableData.time }} | พนักงานรับออเดอร์: {{ tableData.staff }}
            </p>
          </div>

          <!-- Action Header Buttons -->
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <button @click="printQrSlip" style="display: flex; align-items: center; gap: 6px; background-color: white; border: 1.5px solid #48785A; color: #48785A; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s;">
              <span>📱</span> พิมพ์ QR สั่งอาหาร
            </button>
            <button @click="confirmPayment" style="display: flex; align-items: center; gap: 8px; background-color: #48785A; color: white; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background-color 0.2s;">
              <span>💳</span> ยืนยันการชำระเงิน
            </button>
          </div>
        </div>

        <!-- Main Details Grid (2 Columns Layout) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Left Column (Diners & Ordered Items) -->
          <div class="lg:col-span-2 flex flex-col gap-6">

            <!-- Diners Control Card -->
            <div style="background-color: #EFECE3; border-radius: 20px; padding: 20px; border: 1px solid rgba(227,222,195,0.8); display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <div>
                <p style="font-size: 11px; font-weight: 700; color: #4B5563; letter-spacing: 0.5px; margin: 0;">จำนวนลูกค้า (DINERS)</p>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 12px;">
                  <button
                    @click="changeCustomers(-1)"
                    style="width: 32px; height: 32px; border-radius: 10px; background-color: white; border: 1px solid #D1D5DB; font-weight: bold; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                  >-</button>
                  <span style="font-size: 18px; font-weight: 700; color: #111827; width: 24px; text-align: center;">{{ tableData.customers }}</span>
                  <button
                    @click="changeCustomers(1)"
                    style="width: 32px; height: 32px; border-radius: 10px; background-color: white; border: 1px solid #D1D5DB; font-weight: bold; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                  >+</button>
                </div>
              </div>

              <!-- Force Clear Button -->
              <button
                @click="forceClear"
                style="display: flex; align-items: center; gap: 8px; border: 1px solid #FCA5A5; color: #DC2626; background-color: rgba(254,226,226,0.5); padding: 10px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; transition: background-color 0.2s;"
              >
                <span>🗑</span> บังคับปิดโต๊ะ (Force Clear)
              </button>
            </div>

            <!-- Ordered Items Card -->
            <div style="background-color: #EFECE3; border-radius: 20px; padding: 20px; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid rgba(209,213,219,0.4);">
                <p style="font-size: 11px; font-weight: 700; color: #4B5563; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">รายการอาหารที่สั่ง (ORDERED ITEMS)</p>
                <span style="font-size: 12px; color: #4B5563; background-color: rgba(255,255,255,0.7); padding: 4px 10px; border-radius: 8px; font-weight: 500; border: 1px solid rgba(209,213,219,0.5);">
                  ทั้งหมด {{ orders.length }} รายการ
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                <div v-if="orders.length === 0" style="text-align: center; padding: 40px 0; color: #9CA3AF; font-size: 13px;">
                  ยังไม่มีรายการสั่งอาหารสำหรับโต๊ะนี้
                </div>
                <div
                  v-else
                  v-for="item in orders"
                  :key="item.id"
                  style="background-color: #FAF9F5; border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                >
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <span style="font-family: serif; font-weight: 700; font-size: 18px; color: #111827; width: 24px; text-align: center;">{{ item.qty }}x</span>
                    <div>
                      <h4 style="font-weight: 700; font-size: 14px; color: #1F2937; margin: 0;">{{ item.name }}</h4>
                      <p style="font-size: 12px; color: #9CA3AF; margin: 2px 0 0 0;">หมายเหตุ: {{ item.note }}</p>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 16px;">
                    <!-- Status Badges -->
                    <span
                      v-if="item.status === 'served'"
                      style="background-color: #C2E3C8; color: #226830; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; display: flex; align-items: center; gap: 4px;"
                    >
                      ✓ เสิร์ฟแล้ว
                    </span>
                    <span
                      v-else-if="item.status === 'cooking'"
                      style="background-color: #C5D8F6; color: #1D51A3; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; display: flex; align-items: center; gap: 4px;"
                    >
                      ♨ กำลังทำ
                    </span>

                    <!-- Item Price -->
                    <span style="font-weight: 700; font-size: 14px; color: #1F2937; width: 64px; text-align: right;">฿{{ (item.price * item.qty).toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column (Bill Summary & QR Code) -->
          <div>
            <div style="background-color: #EFECE3; border-radius: 20px; padding: 24px; border: 1px solid rgba(227,222,195,0.8); display: flex; flex-direction: column; justify-content: space-between; min-height: 480px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              
              <div>
                <!-- Card Header -->
                <div style="display: flex; align-items: center; gap: 8px; padding-bottom: 16px; border-bottom: 1px solid rgba(209,213,219,0.6);">
                  <span style="font-size: 16px;">📋</span>
                  <h3 style="font-size: 11px; font-weight: 700; color: #4B5563; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">สรุปค่าอาหาร (BILL SUMMARY)</h3>
                </div>

                <!-- Price Breakdown -->
                <div style="display: flex; flex-direction: column; gap: 8px; padding: 16px 0; font-size: 12px; font-weight: 500; color: #4B5563; border-bottom: 1px solid rgba(209,213,219,0.6);">
                  <div style="display: flex; justify-content: space-between;">
                    <span>ยอดรวม (Subtotal)</span>
                    <span style="font-weight: 700; color: #111827;">฿{{ subtotal.toLocaleString() }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>ส่วนลด (Discount) 0%</span>
                    <span style="font-weight: 700; color: #111827;">฿{{ discount.toLocaleString() }}</span>
                  </div>
                </div>

                <!-- Total Amount -->
                <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 16px 0;">
                  <span style="font-family: serif; font-weight: 700; font-size: 16px; color: #111827;">ยอดสุทธิ<br/><span style="font-size: 11px; font-family: sans-serif; font-weight: 400; color: #6B7280;">(Total)</span></span>
                  <span style="font-family: serif; font-weight: 700; font-size: 24px; color: #336846;">฿{{ netTotal.toLocaleString() }}</span>
                </div>

                <!-- Real Scannable QR Code Section -->
                <div style="display: flex; flex-direction: column; align-items: center; padding-top: 16px; border-top: 1px dashed rgba(209,213,219,0.8);">
                  <div style="font-size: 13px; font-weight: 700; color: #1F2937; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>📱</span> QR สแกนสั่งอาหาร (โต๊ะ {{ tableData.id }})
                  </div>

                  <div style="padding: 10px; background-color: white; border-radius: 16px; border: 1.5px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; justify-content: center; align-items: center;">
                    <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" :alt="`QR Code โต๊ะ ${tableData.id}`" style="width: 160px; height: 160px; display: block;" />
                    <div v-else style="width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 12px;">
                      กำลังสร้าง QR...
                    </div>
                  </div>

                  <div style="font-size: 11px; color: #6B7280; margin-top: 8px; font-family: monospace; background: rgba(255,255,255,0.7); padding: 4px 8px; border-radius: 6px; border: 1px solid #E5E7EB; max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" :title="orderUrl">
                    {{ orderUrl }}
                  </div>

                  <!-- Quick Action Buttons for QR -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; margin-top: 12px;">
                    <button 
                      @click="printQrSlip"
                      type="button"
                      style="padding: 9px 8px; background-color: white; border: 1px solid #D1D5DB; border-radius: 10px; font-size: 12px; font-weight: 600; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background-color 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                      title="พิมพ์ใบ QR เปิดโต๊ะยื่นให้ลูกค้า"
                    >
                      <span>🖨️</span> พิมพ์ใบ QR
                    </button>
                    <button 
                      @click="copyOrderLink"
                      type="button"
                      style="padding: 9px 8px; background-color: white; border: 1px solid #D1D5DB; border-radius: 10px; font-size: 12px; font-weight: 600; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background-color 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                      title="คัดลอกลิงก์หน้าสั่งอาหาร"
                    >
                      <span>📋</span> คัดลอกลิงก์
                    </button>
                  </div>
                  <button 
                    @click="openOrderPage"
                    type="button"
                    style="width: 100%; padding: 8px; background-color: rgba(72,120,90,0.1); border: 1px solid rgba(72,120,90,0.3); border-radius: 8px; font-size: 12px; font-weight: 600; color: #336846; cursor: pointer; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;"
                  >
                    <span>🌐</span> เปิดหน้าสั่งอาหาร (ทดลองสั่ง)
                  </button>
                </div>
              </div>

              <!-- Print QR Slip Main Button -->
              <button 
                @click="printQrSlip"
                style="width: 100%; padding: 12px; background-color: #48785A; color: white; font-weight: 600; font-size: 13px; border-radius: 12px; border: none; cursor: pointer; transition: background-color 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;"
              >
                <span>🖨️</span> พิมพ์ใบเปิดโต๊ะ / QR สั่งอาหาร
              </button>

            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>