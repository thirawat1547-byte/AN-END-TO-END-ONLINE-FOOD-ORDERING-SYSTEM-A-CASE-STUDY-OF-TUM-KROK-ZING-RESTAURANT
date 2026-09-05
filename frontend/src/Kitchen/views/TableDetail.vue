<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tableId = computed(() => route.params.id || '05')

const tableData = ref({
  id: tableId.value,
  status: 'กำลังรับประทาน (OCCUPIED)',
  time: '18:45 น.',
  staff: 'สมหญิง รักดี',
  customers: 4,
})

const orders = ref([
  { id: 1, name: 'ต้มยำกุ้งน้ำข้น (Tom Yum Goong)', qty: 1, price: 350, status: 'served', note: 'ไม่เผ็ดมาก' },
  { id: 2, name: 'ข้าวผัดปู (Crab Fried Rice)', qty: 2, price: 300, status: 'served', note: '-' },
  { id: 3, name: 'ปลากะพงทอดน้ำปลา (Deep Fried Sea Bass)', qty: 1, price: 450, status: 'cooking', note: 'แยกน้ำจิ้ม' },
  { id: 4, name: 'น้ำเปล่า (Water)', qty: 4, price: 80, status: 'served', note: '-' },
])

const subtotal = computed(() => {
  return orders.value.reduce((sum, item) => sum + (item.price * item.qty), 0)
})
const discount = computed(() => 0.00)
const netTotal = computed(() => subtotal.value - discount.value)

const changeCustomers = (delta) => {
  tableData.value.customers = Math.max(1, tableData.value.customers + delta)
}

const forceClear = () => {
  if (confirm(`ยืนยันการบังคับปิดโต๊ะ ${tableData.value.id}?`)) {
    router.push('/kitchen/tables')
  }
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
        <div style="width: 40px; height: 40px; border-radius: 9999px; background-color: #B34B32; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          🌶
        </div>
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
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <button style="display: flex; align-items: center; gap: 8px; background-color: white; border: 1px solid #D1D5DB; color: #374151; padding: 10px 16px; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: background-color 0.2s;">
              <span>🛒</span> เพิ่มรายการอาหาร
            </button>
            <button style="display: flex; align-items: center; gap: 8px; background-color: #48785A; color: white; padding: 10px 16px; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background-color 0.2s;">
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
                <div
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

                <!-- QR Code Container -->
                <div style="display: flex; justify-content: center; padding: 12px 0;">
                  <div style="padding: 12px; background-color: white; border-radius: 16px; border: 1px solid #E5E7EB; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <svg viewBox="0 0 100 100" style="width: 140px; height: 140px;">
                      <rect width="100" height="100" fill="white"/>
                      <!-- Top-Left Finder -->
                      <rect x="5" y="5" width="28" height="28" rx="2" fill="black"/>
                      <rect x="9" y="9" width="20" height="20" rx="1" fill="white"/>
                      <rect x="13" y="13" width="12" height="12" fill="black"/>
                      <!-- Top-Right Finder -->
                      <rect x="67" y="5" width="28" height="28" rx="2" fill="black"/>
                      <rect x="71" y="9" width="20" height="20" rx="1" fill="white"/>
                      <rect x="75" y="13" width="12" height="12" fill="black"/>
                      <!-- Bottom-Left Finder -->
                      <rect x="5" y="67" width="28" height="28" rx="2" fill="black"/>
                      <rect x="9" y="71" width="20" height="20" rx="1" fill="white"/>
                      <rect x="13" y="75" width="12" height="12" fill="black"/>
                      <!-- Random SVG QR Data Modules -->
                      <rect x="38" y="8" width="6" height="12" fill="black"/>
                      <rect x="48" y="5" width="12" height="6" fill="black"/>
                      <rect x="38" y="24" width="22" height="6" fill="black"/>
                      <rect x="8" y="38" width="12" height="6" fill="black"/>
                      <rect x="24" y="38" width="6" height="12" fill="black"/>
                      <rect x="35" y="35" width="30" height="30" rx="2" fill="black"/>
                      <rect x="40" y="40" width="20" height="20" rx="1" fill="white"/>
                      <rect x="45" y="45" width="10" height="10" fill="black"/>
                      <rect x="70" y="38" width="22" height="8" fill="black"/>
                      <rect x="78" y="50" width="14" height="12" fill="black"/>
                      <rect x="38" y="70" width="8" height="22" fill="black"/>
                      <rect x="50" y="78" width="18" height="14" fill="black"/>
                      <rect x="72" y="72" width="20" height="20" fill="black"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Print Receipt Button -->
              <button style="width: 100%; padding: 12px; background-color: #5C7A67; color: white; font-weight: 600; font-size: 12px; border-radius: 12px; border: none; cursor: pointer; transition: background-color 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02); margin-top: 16px;">
                พิมพ์ใบเสร็จ
              </button>

            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>