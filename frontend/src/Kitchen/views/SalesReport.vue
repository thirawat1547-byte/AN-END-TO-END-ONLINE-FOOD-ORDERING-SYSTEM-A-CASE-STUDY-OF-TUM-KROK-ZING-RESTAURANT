<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { API_BASE } from '../../config/api'

const todayDateStr = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
})

const summaryCards = ref([
  {
    title: 'รายได้รวม',
    value: '฿0',
    sub: 'กำลังคำนวณ...',
    isPositive: true,
    icon: '💵'
  },
  {
    title: 'ยอดสั่งซื้อทั้งหมด',
    value: '0',
    sub: 'ออเดอร์ในระบบ',
    isNeutral: true,
    icon: '📄'
  },
  {
    title: 'เวลารอเฉลี่ย',
    value: '8',
    unit: 'นาที',
    sub: 'พร้อมให้บริการ',
    isPositive: true,
    icon: '⏱'
  },
])

const hourlyData = ref([
  { time: '11am', height: '10%' },
  { time: '', height: '15%' },
  { time: '12pm', height: '25%' },
  { time: '', height: '30%' },
  { time: '1pm', height: '45%' },
  { time: '2pm', height: '35%' },
  { time: '3pm', height: '50%' },
  { time: '4pm', height: '85%', isHighlight: true },
  { time: '5pm', height: '30%' },
])

const topItems = ref([])
const rawSummaries = ref([])

// ดึงข้อมูลยอดขายและสถิติจาก Database Views ของ Backend
const fetchSalesData = async () => {
  try {
    const [summaryRes, topRes] = await Promise.allSettled([
      axios.get(`${API_BASE}/reports/sales-summary`),
      axios.get(`${API_BASE}/reports/top-selling`),
      axios.get(`${API_BASE}/orders`)
    ])

    let summaries = summaryRes.status === 'fulfilled' && Array.isArray(summaryRes.value.data) && summaryRes.value.data.length > 0
      ? summaryRes.value.data 
      : []

    let topMenus = topRes.status === 'fulfilled' && Array.isArray(topRes.value.data) && topRes.value.data.length > 0
      ? topRes.value.data 
      : []

    let orders = []
    try {
      const ordersRes = await axios.get(`${API_BASE}/orders`)
      orders = ordersRes.data || []
    } catch (e) {}

    // หาก View ใน MySQL มีข้อมูล ให้ใช้งานจาก View โดยตรง
    if (summaries.length > 0) {
      rawSummaries.value = summaries
      const totalRevenue = summaries.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
      summaryCards.value[0].value = `฿${totalRevenue.toLocaleString()}`
      summaryCards.value[0].sub = `รวม ${summaries.length} ออเดอร์ (จาก View)`

      summaryCards.value[1].value = String(summaries.length)
      summaryCards.value[1].sub = 'ดึงจาก ORDER_SUMMARIES_VIEW'
    } else if (orders.length > 0) {
      rawSummaries.value = orders.map(o => ({
        order_id: o.order_id,
        table_number: o.table?.table_number || (o.table_id ? `T-${o.table_id}` : '-'),
        total_price: o.total_price,
        status: o.status,
        order_date: o.created_at
      }))
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
      summaryCards.value[0].value = `฿${totalRevenue.toLocaleString()}`
      summaryCards.value[0].sub = `รวม ${orders.length} ออเดอร์`
      summaryCards.value[1].value = String(orders.length)
      summaryCards.value[1].sub = 'ออเดอร์ทั้งหมดในระบบ'
    }

    if (topMenus.length > 0) {
      topItems.value = topMenus.slice(0, 5).map(m => ({
        name: m.menu_name,
        category: m.category_name || 'อาหารจานหลัก',
        orders: Number(m.total_sold || 0),
        revenue: `฿${Number(m.total_revenue || 0).toLocaleString()}`,
        image: '/images/kapaomu.jpg'
      }))
    } else if (orders.length > 0) {
      const menuCounts = {}
      orders.forEach(o => {
        (o.order_items || o.items || []).forEach(oi => {
          const menuName = oi.menu?.menu_name || oi.menu?.name || oi.menu_name || `เมนู #${oi.menu_id}`
          const qty = Number(oi.quantity || 1)
          const price = Number(oi.unit_price || oi.menu?.price || 0)
          const img = oi.menu?.image_url || '/images/kapaomu.jpg'
          const cat = oi.menu?.category?.category_name || 'อาหารจานหลัก'

          if (!menuCounts[menuName]) {
            menuCounts[menuName] = {
              name: menuName,
              category: cat,
              orders: 0,
              revenueNum: 0,
              image: img
            }
          }
          menuCounts[menuName].orders += qty
          menuCounts[menuName].revenueNum += (qty * price)
        })
      })

      topItems.value = Object.values(menuCounts)
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5)
        .map(item => ({
          ...item,
          revenue: `฿${item.revenueNum.toLocaleString()}`
        }))
    }

    // 4. คำนวณยอดขายรายชั่วโมง
    const hourBuckets = [
      { time: '11am', hour: 11, count: 0 },
      { time: '', hour: 11.5, count: 0 },
      { time: '12pm', hour: 12, count: 0 },
      { time: '', hour: 12.5, count: 0 },
      { time: '1pm', hour: 13, count: 0 },
      { time: '2pm', hour: 14, count: 0 },
      { time: '3pm', hour: 15, count: 0 },
      { time: '4pm', hour: 16, count: 0 },
      { time: '5pm', hour: 17, count: 0 },
    ]

    orders.forEach(o => {
      const d = new Date(o.created_at)
      const hr = d.getHours()
      const match = hourBuckets.find(b => b.hour === hr)
      if (match) {
        match.count++
      } else {
        hourBuckets[7].count++
      }
    })

    const maxCount = Math.max(...hourBuckets.map(b => b.count), 1)
    hourlyData.value = hourBuckets.map(b => {
      const pct = Math.max(15, Math.min(100, Math.round((b.count / maxCount) * 85)))
      return {
        time: b.time,
        height: `${pct}%`,
        isHighlight: b.count === maxCount
      }
    })
  } catch (err) {
    console.error('โหลดรายงานยอดขายไม่สำเร็จ:', err)
  }
}

// ฟังก์ชันดาวน์โหลดรายงานเป็นไฟล์ Excel (CSV)
const exportCSV = () => {
  const headers = ['ลำดับ', 'รหัสออเดอร์', 'โต๊ะ', 'ยอดรวมสุทธิ (บาท)', 'สถานะ', 'วันที่และเวลา']
  const rows = (rawSummaries.value || []).map((s, idx) => [
    idx + 1,
    '#ORD-' + s.order_id,
    '"' + (s.table_number || '-') + '"',
    Number(s.total_price || 0),
    '"' + (s.status || 'PAID') + '"',
    '"' + (s.order_date ? new Date(s.order_date).toLocaleString('th-TH') : '-') + '"'
  ])

  const filename = `TumKrokZing_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`
  const csvText = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

  // ใช้ Data URI พร้อม UTF-8 BOM (%EF%BB%BF) เพื่อให้ Chrome กำหนดชื่อไฟล์ .csv ถูกต้องเสมอ
  const encodedUri = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csvText)
  const link = document.createElement('a')
  link.href = encodedUri
  link.setAttribute('download', filename)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    document.body.removeChild(link)
  }, 200)
}

// ฟังก์ชันพิมพ์หรือบันทึกเป็น PDF
const exportPDF = () => {
  window.print()
}

onMounted(() => {
  fetchSalesData()
})
</script>

<template>
  <div class="sales-report-container" style="display: flex; flex-direction: column; height: 100vh; overflow: hidden; background-color: #FAF9F5; font-family: sans-serif;">
    <!-- Top Bar Header -->
    <header class="no-print" style="background-color: #48785A; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; color: white;">
      <div style="display: flex; align-items: baseline; gap: 12px;">
        <h1 style="font-size: 24px; font-weight: 400; margin: 0; letter-spacing: 0.5px;">Dashboard</h1>
        <span style="font-size: 14px; font-weight: 300; opacity: 0.8;">ระบบรายงานภาพรวมร้านค้า (Database Views)</span>
      </div>
      <div style="display: flex; align-items: center; gap: 24px; color: rgba(255,255,255,0.9); font-size: 18px;">
        <button style="cursor: pointer; background: none; border: none; color: inherit;">🔔</button>
        <button style="width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.4); background: none; cursor: pointer; padding: 0;">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        </button>
      </div>
    </header>

    <!-- Scrollable Main Content -->
    <main style="flex: 1; overflow-y: auto; padding: 32px; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 100%; max-width: 1152px; display: flex; flex-direction: column; gap: 24px;">

        <!-- Title & Date Selector Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid rgba(209,213,219,0.6);">
          <div>
            <h2 style="font-size: 26px; font-weight: 700; color: #1F2937; margin: 0 0 4px 0;">รายงานยอดขายประจำวัน</h2>
            <p style="font-size: 13px; color: #6B7280; margin: 0;">ดึงข้อมูลประมวลผลจาก ORDER_SUMMARIES_VIEW และ TOP_SELLING_MENUS_VIEW</p>
          </div>
          <div class="no-print" style="display: flex; align-items: center; gap: 10px;">
            <div style="background-color: white; border: 1px solid #D1D5DB; padding: 9px 14px; border-radius: 12px; font-size: 13px; font-weight: 500; color: #374151; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <span>📅</span> {{ todayDateStr }}
            </div>
            <button 
              @click="exportCSV"
              style="cursor: pointer; background: #48785A; color: white; border: none; padding: 9px 15px; border-radius: 12px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 5px rgba(72,120,90,0.3); transition: 0.2s;"
              title="ดาวน์โหลดรายงานยอดขายเป็นไฟล์ Excel (CSV)"
            >
              <span>📊</span> Export Excel (CSV)
            </button>
            <button 
              @click="exportPDF"
              style="cursor: pointer; background: #1F2937; color: white; border: none; padding: 9px 15px; border-radius: 12px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: 0.2s;"
              title="พิมพ์หรือบันทึกเป็น PDF"
            >
              <span>📄</span> บันทึกเป็น PDF
            </button>
          </div>
        </div>

        <!-- Summary Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <div
            v-for="card in summaryCards"
            :key="card.title"
            style="background-color: #EFECE3; border-radius: 24px; padding: 24px; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; height: 150px;"
          >
            <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: #4B5563;">
              <span style="width: 32px; height: 32px; border-radius: 12px; background-color: #FAF9F5; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">{{ card.icon }}</span>
              <span>{{ card.title }}</span>
            </div>
            <div style="margin: 4px 0;">
              <span style="font-size: 32px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">{{ card.value }}</span>
              <span v-if="card.unit" style="font-size: 15px; font-weight: 500; margin-left: 4px; color: #4B5563;">{{ card.unit }}</span>
            </div>
            <div style="font-size: 12px;">
              <span v-if="card.isPositive" style="color: #059669; font-weight: 600;">📈 {{ card.sub }}</span>
              <span v-else-if="card.isNegative" style="color: #DC2626; font-weight: 600;">⚠️ {{ card.sub }}</span>
              <span v-else style="color: #6B7280; font-weight: 500;">➖ {{ card.sub }}</span>
            </div>
          </div>
        </div>

        <!-- Sales by Hour & Top Items Grid Layout -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          
          <!-- Sales by Hour Chart Card -->
          <div style="background-color: #EFECE3; border-radius: 24px; padding: 24px; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; justify-content: mb-4; margin-bottom: 20px;">
              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: #1F2937; margin: 0 0 2px 0;">ยอดขายตามช่วงเวลา (Sales by Hour)</h3>
                <p style="font-size: 12px; color: #6B7280; margin: 0;">ช่วงเวลาที่ลูกค้าหนาแน่นที่สุดคือ 13:00 น.</p>
              </div>
              <button style="background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 16px;">•••</button>
            </div>

            <!-- Chart Layout -->
            <div style="position: relative; padding-left: 32px; padding-top: 10px;">
              <!-- Y-Axis Labels -->
              <div style="position: absolute; left: 0; top: 10px; bottom: 24px; display: flex; flex-direction: column; justify-content: space-between; font-size: 10px; color: #9CA3AF; font-weight: 500;">
                <span>฿3k</span>
                <span>฿2k</span>
                <span>฿1k</span>
                <span>0</span>
              </div>

              <!-- Bars Container -->
              <div style="height: 160px; border-bottom: 1px solid #D1D5DB; display: flex; align-items: flex-end; gap: 8px; padding: 0 8px;">
                <div
                  v-for="(bar, index) in hourlyData"
                  :key="index"
                  style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;"
                >
                  <div
                    style="width: 100%; border-radius: 6px 6px 0 0; transition: all 0.3s;"
                    :style="bar.isHighlight ? 'background-color: #48785A;' : 'background-color: rgba(72, 120, 90, 0.35);'"
                    :style.height="bar.height"
                  ></div>
                </div>
              </div>

              <!-- X-Axis Labels -->
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B7280; margin-top: 8px; padding: 0 4px; font-weight: 500;">
                <span>11am</span>
                <span>12pm</span>
                <span>1pm</span>
                <span>2pm</span>
                <span>3pm</span>
                <span>4pm</span>
                <span>5pm</span>
              </div>
            </div>
          </div>

          <!-- Top Selling Items Card -->
          <div style="background-color: #EFECE3; border-radius: 24px; padding: 24px; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.02); display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h3 style="font-size: 16px; font-weight: 700; color: #1F2937; margin: 0;">เมนูขายดี (Top Items)</h3>
              <a href="#" style="font-size: 12px; color: #48785A; font-weight: 600; text-decoration: none;">ดูทั้งหมด</a>
            </div>

            <!-- List of Top Items -->
            <div style="display: flex; flex-direction: column; gap: 12px; flex: 1;">
              <div v-if="topItems.length === 0" style="text-align: center; padding: 40px 0; color: #9CA3AF; font-size: 13px;">
                ยังไม่มีข้อมูลยอดขายในขณะนี้
              </div>
              <div
                v-else
                v-for="(item, idx) in topItems"
                :key="idx"
                style="background-color: #FAF9F5; border-radius: 16px; padding: 12px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(227,222,195,0.6);"
              >
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img :src="item.image" alt="Food" style="width: 48px; height: 48px; border-radius: 12px; object-fit: cover; box-shadow: 0 1px 3px rgba(0,0,0,0.05);" />
                  <div>
                    <h4 style="font-weight: 700; font-size: 14px; color: #1F2937; margin: 0 0 2px 0;">{{ item.name }}</h4>
                    <p style="font-size: 11px; color: #6B7280; margin: 0;">{{ item.category }}</p>
                  </div>
                </div>
                <div style="text-align: right;">
                  <p style="font-weight: 700; font-size: 13px; color: #1F2937; margin: 0 0 2px 0;">{{ item.orders }} ออเดอร์</p>
                  <p style="font-size: 12px; color: #48785A; font-weight: 600; margin: 0;">{{ item.revenue }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
@media print {
  header.no-print,
  .no-print {
    display: none !important;
  }
  .sales-report-container {
    height: auto !important;
    overflow: visible !important;
    background: white !important;
  }
  main {
    overflow: visible !important;
    padding: 0 !important;
  }
}
</style>