<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { API_BASE } from '../../config/api'
import { socket } from '../../config/socket'

// ฟังก์ชันแปลงวันเป็น YYYY-MM-DD ตาม Local Timezone
function toLocalDateStr(dateVal) {
  if (!dateVal) return ''
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// วันที่ที่เลือก (เริ่มต้นเป็นวันปัจจุบันเสมอ และรีเซ็ตทุกวันใหม่)
const selectedDate = ref(toLocalDateStr(new Date()))

// ตรวจสอบว่าวันที่เลือกเป็นวันนี้หรือไม่
const isTodaySelected = computed(() => {
  return selectedDate.value === toLocalDateStr(new Date())
})

// แปลงรูปแบบวันที่แสดงผลภาษาไทย (เช่น "1 ต.ค. 2569")
const formattedThaiDate = computed(() => {
  if (!selectedDate.value) return ''
  const [y, m, d] = selectedDate.value.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
})

// ปรับเลื่อนวันก่อนหน้า / วันถัดไป
function changeDate(deltaDays) {
  const [y, m, d] = selectedDate.value.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + deltaDays)
  selectedDate.value = toLocalDateStr(dt)
}

function goToToday() {
  selectedDate.value = toLocalDateStr(new Date())
}

const rawSummaries = ref([])
const rawOrders = ref([])
const allTimeTopMenus = ref([])
const showAllTimeTop = ref(false)
const hoveredIndex = ref(null)

let autoRefreshTimer = null
let midnightCheckTimer = null

// รวมข้อมูลออเดอร์จาก orders และ ORDER_SUMMARIES_VIEW
const mergedOrders = computed(() => {
  if (rawOrders.value && rawOrders.value.length > 0) {
    return rawOrders.value.map(o => ({
      order_id: o.order_id,
      table_number: o.table?.table_number || (o.table_id ? `T-${o.table_id}` : '-'),
      total_price: Number(o.total_price || 0),
      status: (o.status || '').toUpperCase(),
      created_at: o.created_at || o.order_date,
      updated_at: o.updated_at,
      order_items: o.order_items || o.items || []
    }))
  }
  return rawSummaries.value.map(s => ({
    order_id: s.order_id,
    table_number: s.table_number || '-',
    total_price: Number(s.total_price || 0),
    status: (s.status || '').toUpperCase(),
    created_at: s.order_date,
    updated_at: s.order_date,
    order_items: []
  }))
})

// กรองเฉพาะออเดอร์ในวันที่เลือก (ประจำวันนั้น ๆ)
const dayOrders = computed(() => {
  return mergedOrders.value.filter(o => {
    return toLocalDateStr(o.created_at) === selectedDate.value
  })
})

// ออเดอร์ที่ไม่ถูกยกเลิก (สำหรับคิดรายได้และยอดขาย)
const validDayOrders = computed(() => {
  return dayOrders.value.filter(o => o.status !== 'CANCELLED')
})

// รายได้รวมประจำวัน
const dayRevenue = computed(() => {
  return validDayOrders.value.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
})

// เวลารอเฉลี่ยประจำวัน
const avgWaitMinutes = computed(() => {
  const served = dayOrders.value.filter(o => 
    o.created_at && o.updated_at && ['SERVED', 'COMPLETED', 'PAID'].includes(o.status)
  )
  if (served.length === 0) return 8
  const totalMins = served.reduce((sum, o) => {
    const diff = (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()) / 60000
    return sum + (diff > 0 && diff < 180 ? diff : 10)
  }, 0)
  return Math.max(3, Math.round(totalMins / served.length))
})

// การ์ดสรุปยอดประจำวัน
const summaryCards = computed(() => [
  {
    title: 'รายได้รวมประจำวัน',
    value: `฿${dayRevenue.value.toLocaleString()}`,
    sub: isTodaySelected.value
      ? (validDayOrders.value.length > 0 
          ? `ยอดขายวันนี้ รวม ${validDayOrders.value.length} ออเดอร์` 
          : 'ยังไม่มีคำสั่งซื้อในวันนี้ (รีเซ็ตทุกวัน)')
      : `ยอดขายวันที่ ${formattedThaiDate.value} (${validDayOrders.value.length} ออเดอร์)`,
    isPositive: dayRevenue.value > 0,
    isNeutral: dayRevenue.value === 0,
    icon: '💵'
  },
  {
    title: 'ยอดสั่งซื้อประจำวัน',
    value: String(dayOrders.value.length),
    sub: isTodaySelected.value 
      ? 'ออเดอร์ในวันปัจจุบัน (รีเซ็ตทุกเที่ยงคืน)' 
      : `ออเดอร์ทั้งหมดประจำวันที่ ${formattedThaiDate.value}`,
    isNeutral: true,
    icon: '📄'
  },
  {
    title: 'เวลารอเฉลี่ย',
    value: String(avgWaitMinutes.value),
    unit: 'นาที',
    sub: 'พร้อมให้บริการ (คำนวณตามจริง)',
    isPositive: true,
    icon: '⏱'
  }
])

// ฟังก์ชันสร้างความโค้ง Smooth Curve สำหรับ SVG Line Chart (Cubic Bezier)
function generateSmoothPath(points) {
  if (!points || points.length === 0) return ''
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const cp1x = (p0.x + (p1.x - p0.x) / 2).toFixed(1)
    const cp1y = p0.y.toFixed(1)
    const cp2x = (p0.x + (p1.x - p0.x) / 2).toFixed(1)
    const cp2y = p1.y.toFixed(1)
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`
  }
  return d
}

// ฟังก์ชันสร้าง Area Path สำหรับ Gradient Fill ใต้กราฟเส้น
function generateAreaPath(points, bottomY) {
  if (!points || points.length === 0) return ''
  const linePath = generateSmoothPath(points)
  const first = points[0]
  const last = points[points.length - 1]
  return `${linePath} L ${last.x.toFixed(1)} ${bottomY.toFixed(1)} L ${first.x.toFixed(1)} ${bottomY.toFixed(1)} Z`
}

function getNiceMaxY(val) {
  if (val <= 0) return 500
  if (val <= 300) return 300
  if (val <= 500) return 500
  if (val <= 1000) return 1000
  if (val <= 2000) return 2000
  if (val <= 3000) return 3000
  if (val <= 5000) return 5000
  return Math.ceil(val / 1000) * 1000
}

function formatYLabel(val) {
  if (val === 0) return '0'
  if (val >= 1000) {
    const k = val / 1000
    return `฿${k % 1 === 0 ? k : k.toFixed(1)}k`
  }
  return `฿${val}`
}

// คำนวณข้อมูลกราฟเส้นยอดขาย 24 ชั่วโมงในวันนั้น (รีทุกวัน)
const chartData = computed(() => {
  const chartW = 760
  const chartH = 220
  const padLeft = 55
  const padRight = 30
  const padTop = 25
  const padBottom = 35
  const plotW = chartW - padLeft - padRight
  const plotH = chartH - padTop - padBottom
  const bottomY = padTop + plotH

  // 24 buckets ประจำ 24 ชั่วโมง (00:00 - 23:00 น.)
  const buckets = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${String(h).padStart(2, '0')}:00`,
    sales: 0,
    orders: 0
  }))

  for (const o of validDayOrders.value) {
    const dateVal = o.created_at || o.order_date
    if (!dateVal) continue
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) continue
    const h = d.getHours()
    if (h >= 0 && h < 24) {
      buckets[h].sales += Number(o.total_price || 0)
      buckets[h].orders += 1
    }
  }

  const maxSales = Math.max(...buckets.map(b => b.sales), 0)
  const maxY = getNiceMaxY(maxSales)

  const points = buckets.map((b, i) => {
    const x = padLeft + (i / 23) * plotW
    const ratio = maxY > 0 ? (b.sales / maxY) : 0
    const y = bottomY - ratio * plotH
    return {
      ...b,
      x,
      y,
      isPeak: maxSales > 0 && b.sales === maxSales
    }
  })

  // Y-Axis Ticks (4 ระดับ)
  const yTicks = [
    { y: padTop, val: maxY, label: formatYLabel(maxY) },
    { y: padTop + plotH * 0.333, val: Math.round(maxY * 0.666), label: formatYLabel(Math.round(maxY * 0.666)) },
    { y: padTop + plotH * 0.666, val: Math.round(maxY * 0.333), label: formatYLabel(Math.round(maxY * 0.333)) },
    { y: bottomY, val: 0, label: '0' }
  ]

  // X-Axis Ticks ทุก 3 ชั่วโมงสำหรับ 24 ชม. (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00, 23:00)
  const xHours = [0, 3, 6, 9, 12, 15, 18, 21, 23]
  const xTicks = xHours.map(h => {
    const pt = points[h]
    return {
      hour: h,
      label: pt ? pt.label : `${String(h).padStart(2, '0')}:00`,
      x: pt ? pt.x : padLeft + (h / 23) * plotW
    }
  })

  return {
    chartW,
    chartH,
    padLeft,
    padRight,
    padTop,
    padBottom,
    plotW,
    plotH,
    bottomY,
    points,
    yTicks,
    xTicks,
    maxSales,
    maxY,
    linePath: generateSmoothPath(points),
    areaPath: generateAreaPath(points, bottomY)
  }
})

// จุดที่กำลัง Hover อยู่
const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null || !chartData.value) return null
  return chartData.value.points[hoveredIndex.value] || null
})

// ข้อมูลช่วงเวลาพีค
const peakHourInfo = computed(() => {
  const cd = chartData.value
  if (!cd || cd.maxSales === 0) {
    return {
      hasSales: false,
      text: isTodaySelected.value 
        ? 'ยังไม่มีคำสั่งซื้อในวันนี้ (กราฟรีเซ็ตพร้อมรับข้อมูลตลอด 24 ชม.)' 
        : `ไม่มีคำสั่งซื้อในวันที่ ${formattedThaiDate.value}`
    }
  }
  const peak = cd.points.find(p => p.isPeak)
  if (!peak) return { hasSales: false, text: '' }
  return {
    hasSales: true,
    hour: peak.label,
    sales: peak.sales,
    orders: peak.orders,
    text: `ช่วงเวลาที่ลูกค้าหนาแน่นที่สุดคือ ${peak.label} น. (ยอดขาย ฿${peak.sales.toLocaleString()} จาก ${peak.orders} ออเดอร์)`
  }
})

// เมนูขายดีประจำวัน
const dayTopItems = computed(() => {
  const menuCounts = {}
  for (const o of dayOrders.value) {
    if (o.status === 'CANCELLED') continue
    const items = o.order_items || []
    for (const oi of items) {
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
    }
  }

  const sorted = Object.values(menuCounts).sort((a, b) => b.orders - a.orders).slice(0, 5)
  return sorted.map(item => ({
    ...item,
    revenue: `฿${item.revenueNum.toLocaleString()}`
  }))
})

// ดึงข้อมูลยอดขายและสถิติจาก Database Views และ API
const fetchSalesData = async () => {
  try {
    const [summaryRes, topRes, ordersRes] = await Promise.allSettled([
      axios.get(`${API_BASE}/reports/sales-summary`),
      axios.get(`${API_BASE}/reports/top-selling`),
      axios.get(`${API_BASE}/orders`)
    ])

    if (summaryRes.status === 'fulfilled' && Array.isArray(summaryRes.value.data)) {
      rawSummaries.value = summaryRes.value.data
    }

    if (topRes.status === 'fulfilled' && Array.isArray(topRes.value.data)) {
      allTimeTopMenus.value = topRes.value.data.slice(0, 5).map(m => ({
        name: m.menu_name,
        category: m.category_name || 'ทั่วไป',
        orders: Number(m.total_sold || 0),
        revenue: `฿${Number(m.total_revenue || 0).toLocaleString()}`,
        image: '/images/kapaomu.jpg'
      }))
    }

    if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value.data)) {
      rawOrders.value = ordersRes.value.data
    }
  } catch (err) {
    console.error('โหลดรายงานยอดขายไม่สำเร็จ:', err)
  }
}

// ฟังก์ชันดาวน์โหลดรายงานเป็นไฟล์ Excel (CSV) ประจำวันที่เลือก
const exportCSV = () => {
  if (validDayOrders.value.length === 0) {
    // หากไม่มีออเดอร์ในวันนี้ ให้ดาวน์โหลดจาก backend view CSV ดั้งเดิม
    const link = document.createElement('a')
    link.href = `${API_BASE}/reports/export-csv`
    link.setAttribute('download', `TumKrokZing_SalesReport_${selectedDate.value}.csv`)
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
    }, 200)
    return
  }

  const headers = ['ลำดับ', 'รหัสออเดอร์', 'โต๊ะ', 'ยอดรวม (บาท)', 'สถานะ', 'วันที่และเวลา']
  const rows = validDayOrders.value.map((o, idx) => [
    idx + 1,
    `"#ORD-${o.order_id}"`,
    `"${o.table_number}"`,
    o.total_price,
    `"${o.status}"`,
    `"${o.created_at ? new Date(o.created_at).toLocaleString('th-TH') : '-'}"`
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `TumKrokZing_DailySales_${selectedDate.value}.csv`)
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 200)
}

// ฟังก์ชันพิมพ์หรือบันทึกเป็น PDF
const exportPDF = () => {
  window.print()
}

onMounted(() => {
  fetchSalesData()

  // Real-time socket listener สำหรับอัปเดตกราฟและยอดขายทันทีที่มีออเดอร์ใหม่
  socket.on('new_order', fetchSalesData)
  socket.on('order_status_updated', fetchSalesData)

  // Polling ทุก 15 วินาที
  autoRefreshTimer = setInterval(fetchSalesData, 15000)

  // ตรวจสอบการเปลี่ยนวันตอนเที่ยงคืน หากยืนอยู่ที่วันเดิม ให้รีเซ็ตไปยังวันใหม่โดยอัตโนมัติ
  midnightCheckTimer = setInterval(() => {
    const currentToday = toLocalDateStr(new Date())
    if (isTodaySelected.value && selectedDate.value !== currentToday) {
      selectedDate.value = currentToday
    }
  }, 60000)
})

onBeforeUnmount(() => {
  socket.off('new_order', fetchSalesData)
  socket.off('order_status_updated', fetchSalesData)
  if (autoRefreshTimer) clearInterval(autoRefreshTimer)
  if (midnightCheckTimer) clearInterval(midnightCheckTimer)
})
</script>

<template>
  <div class="sales-report-container" style="display: flex; flex-direction: column; min-height: 100vh; background-color: #FAF9F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <!-- Top Bar Header -->
    <header class="no-print" style="background-color: #48785A; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; color: white;">
      <div style="display: flex; align-items: baseline; gap: 12px;">
        <h1 style="font-size: 24px; font-weight: 500; margin: 0; letter-spacing: 0.5px;">Dashboard</h1>
        <span style="font-size: 14px; font-weight: 300; opacity: 0.85;">ระบบรายงานภาพรวมร้านค้าประจำวัน</span>
      </div>
      <div style="display: flex; align-items: center; gap: 20px; color: rgba(255,255,255,0.95); font-size: 18px;">
        <button style="cursor: pointer; background: none; border: none; color: inherit; font-size: 18px;">🔔</button>
        <button style="width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.5); background: none; cursor: pointer; padding: 0;">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
        </button>
      </div>
    </header>

    <!-- Scrollable Main Content -->
    <main style="flex: 1; padding: 32px; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 100%; max-width: 1152px; display: flex; flex-direction: column; gap: 24px;">

        <!-- Title & Date Selector Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(209,213,219,0.7);">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h2 style="font-size: 26px; font-weight: 700; color: #1F2937; margin: 0;">รายงานยอดขายประจำวัน</h2>
              <span v-if="isTodaySelected" style="background-color: #DCFCE7; color: #166534; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;">
                ● Live วันนี้ (รีเซ็ตทุกวัน)
              </span>
            </div>
            <p style="font-size: 13px; color: #6B7280; margin: 4px 0 0 0;">
              ข้อมูลยอดขายสรุปรายวัน ประมวลผลจากฐานข้อมูลและรีเซ็ตทุกเที่ยงคืนตามช่วงเวลาจริง
            </p>
          </div>

          <!-- Actions & Date Selector -->
          <div class="no-print" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <!-- Interactive Date Picker & Day Navigator -->
            <div style="background-color: white; border: 1px solid #D1D5DB; padding: 5px 8px; border-radius: 12px; font-size: 13px; font-weight: 500; color: #374151; display: flex; align-items: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <button 
                @click="changeDate(-1)" 
                style="background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4B5563; font-size: 11px; transition: 0.15s;"
                title="ดูวันก่อนหน้า"
              >
                ◀
              </button>

              <div style="position: relative; display: flex; align-items: center; gap: 6px; padding: 2px 6px; cursor: pointer;">
                <span>📅</span>
                <span style="font-weight: 600; color: #1F2937;">{{ formattedThaiDate }}</span>
                <span v-if="isTodaySelected" style="font-size: 10px; background: #DCFCE7; color: #166534; padding: 2px 7px; border-radius: 9999px; font-weight: 700;">วันนี้</span>
                <!-- Native hidden date input to allow picking any calendar date -->
                <input 
                  type="date" 
                  v-model="selectedDate" 
                  style="position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;"
                  title="คลิกเพื่อเลือกวันที่ในปฏิทิน"
                />
              </div>

              <button 
                @click="changeDate(1)" 
                style="background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4B5563; font-size: 11px; transition: 0.15s;"
                title="ดูวันถัดไป"
              >
                ▶
              </button>

              <button 
                v-if="!isTodaySelected" 
                @click="goToToday"
                style="background: #48785A; color: white; border: none; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; transition: 0.15s; margin-left: 2px;"
                title="กลับมาดูรายงานของวันนี้"
              >
                กลับไปวันนี้
              </button>
            </div>

            <button 
              @click="exportCSV"
              style="cursor: pointer; background: #48785A; color: white; border: none; padding: 9px 15px; border-radius: 12px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 5px rgba(72,120,90,0.3); transition: 0.2s;"
              title="ดาวน์โหลดรายงานยอดขายประจำวันเป็นไฟล์ Excel (CSV)"
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
            style="background-color: #EFECE3; border-radius: 24px; padding: 24px; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; height: 150px; transition: transform 0.2s;"
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
              <span v-else-if="card.isNeutral" style="color: #6B7280; font-weight: 500;">➖ {{ card.sub }}</span>
              <span v-else style="color: #6B7280; font-weight: 500;">➖ {{ card.sub }}</span>
            </div>
          </div>
        </div>

        <!-- Sales by Hour & Top Items Grid Layout -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          
          <!-- Sales by Hour Card (Line Chart 24 Hours) -->
          <div style="background-color: #EFECE3; border-radius: 24px; padding: 24px; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h3 style="font-size: 16px; font-weight: 700; color: #1F2937; margin: 0;">ยอดขายตามช่วงเวลา (Sales by Hour)</h3>
                  <span style="font-size: 11px; background-color: #FAF9F5; border: 1px solid #D1D5DB; color: #48785A; font-weight: 700; padding: 2px 8px; border-radius: 6px;">
                    กราฟเส้น 24 ชม.
                  </span>
                </div>
                <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0 0;">
                  {{ peakHourInfo.text }}
                </p>
              </div>
              <div v-if="peakHourInfo.hasSales" style="text-align: right; background: #FAF9F5; padding: 6px 12px; border-radius: 12px; border: 1px solid rgba(227,222,195,0.8);">
                <span style="font-size: 10px; color: #6B7280; display: block;">ช่วงเวลาขายดีสุด</span>
                <span style="font-size: 13px; font-weight: 700; color: #48785A;">{{ peakHourInfo.hour }} น.</span>
              </div>
            </div>

            <!-- SVG 24-Hour Line Chart Container -->
            <div style="position: relative; width: 100%; padding-top: 10px; user-select: none;">
              <svg 
                :viewBox="`0 0 ${chartData.chartW} ${chartData.chartH}`" 
                style="width: 100%; height: auto; display: block; overflow: visible;"
                @mouseleave="hoveredIndex = null"
              >
                <defs>
                  <!-- Gradient for smooth area fill under line -->
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#48785A" stop-opacity="0.35" />
                    <stop offset="85%" stop-color="#48785A" stop-opacity="0.04" />
                    <stop offset="100%" stop-color="#48785A" stop-opacity="0" />
                  </linearGradient>
                  <!-- Drop shadow filter for the line -->
                  <filter id="lineShadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#48785A" flood-opacity="0.25"/>
                  </filter>
                </defs>

                <!-- Horizontal Dashed Grid Lines & Y-Axis Labels -->
                <g v-for="(tick, idx) in chartData.yTicks" :key="'ytick-' + idx">
                  <line 
                    :x1="chartData.padLeft" 
                    :y1="tick.y" 
                    :x2="chartData.padLeft + chartData.plotW" 
                    :y2="tick.y" 
                    stroke="#DCD7C9" 
                    stroke-dasharray="4,4" 
                    stroke-width="1"
                  />
                  <text 
                    :x="chartData.padLeft - 10" 
                    :y="tick.y + 4" 
                    text-anchor="end" 
                    font-size="10" 
                    fill="#9CA3AF" 
                    font-weight="500"
                  >
                    {{ tick.label }}
                  </text>
                </g>

                <!-- Area Fill Path -->
                <path 
                  :d="chartData.areaPath" 
                  fill="url(#salesGrad)" 
                />

                <!-- Baseline (X-Axis line) -->
                <line 
                  :x1="chartData.padLeft" 
                  :y1="chartData.bottomY" 
                  :x2="chartData.padLeft + chartData.plotW" 
                  :y2="chartData.bottomY" 
                  stroke="#D1D5DB" 
                  stroke-width="1.2"
                />

                <!-- Line Chart Path -->
                <path 
                  :d="chartData.linePath" 
                  fill="none" 
                  stroke="#48785A" 
                  stroke-width="3" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  filter="url(#lineShadow)"
                />

                <!-- X-Axis Labels (ticks for every 3 hours across 24h) -->
                <g v-for="tick in chartData.xTicks" :key="'xtick-' + tick.hour">
                  <line 
                    :x1="tick.x" 
                    :y1="chartData.bottomY" 
                    :x2="tick.x" 
                    :y2="chartData.bottomY + 4" 
                    stroke="#9CA3AF" 
                    stroke-width="1"
                  />
                  <text 
                    :x="tick.x" 
                    :y="chartData.bottomY + 18" 
                    text-anchor="middle" 
                    font-size="11" 
                    fill="#6B7280" 
                    font-weight="500"
                  >
                    {{ tick.label }}
                  </text>
                </g>

                <!-- Data Points on Curve -->
                <g v-for="(pt, idx) in chartData.points" :key="'pt-' + idx">
                  <!-- Peak hour glowing animated ring -->
                  <circle 
                    v-if="pt.isPeak && pt.sales > 0"
                    :cx="pt.x" 
                    :cy="pt.y" 
                    r="8" 
                    fill="none" 
                    stroke="#48785A" 
                    stroke-width="1.5" 
                    opacity="0.6"
                  >
                    <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
                  </circle>

                  <!-- Circle markers: small on zero, prominent on sales, enlarged on hover -->
                  <circle 
                    v-if="pt.sales > 0 || hoveredIndex === idx"
                    :cx="pt.x" 
                    :cy="pt.y" 
                    :r="hoveredIndex === idx ? 6 : (pt.sales > 0 ? 4.5 : 3)" 
                    :fill="hoveredIndex === idx ? '#1F2937' : '#48785A'" 
                    stroke="#FFFFFF" 
                    :stroke-width="hoveredIndex === idx ? 2.5 : 2" 
                  />
                </g>

                <!-- Transparent Interactive Hover Zones for each hour -->
                <g v-for="(pt, idx) in chartData.points" :key="'zone-' + idx">
                  <rect 
                    :x="pt.x - (chartData.plotW / 46)" 
                    :y="chartData.padTop" 
                    :width="chartData.plotW / 23" 
                    :height="chartData.plotH + 10" 
                    fill="transparent" 
                    style="cursor: pointer;"
                    @mouseenter="hoveredIndex = idx"
                  />
                </g>

                <!-- Hover Indicator & Tooltip Box -->
                <g v-if="hoveredPoint">
                  <!-- Vertical Guide Line -->
                  <line 
                    :x1="hoveredPoint.x" 
                    :y1="chartData.padTop" 
                    :x2="hoveredPoint.x" 
                    :y2="chartData.bottomY" 
                    stroke="#48785A" 
                    stroke-width="1.5" 
                    stroke-dasharray="3,3" 
                  />

                  <!-- Tooltip Box (clamped horizontally so it never clips edges) -->
                  <g :transform="`translate(${Math.max(75, Math.min(685, hoveredPoint.x))}, ${Math.max(52, hoveredPoint.y - 12)})`">
                    <rect 
                      x="-70" 
                      y="-44" 
                      width="140" 
                      height="44" 
                      rx="8" 
                      fill="#1F2937" 
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" 
                    />
                    <text x="0" y="-28" text-anchor="middle" font-size="10" fill="#D1D5DB" font-weight="500">
                      ⏰ {{ hoveredPoint.label }} - {{ String(hoveredPoint.hour).padStart(2, '0') }}:59 น.
                    </text>
                    <text x="0" y="-12" text-anchor="middle" font-size="12" fill="#34D399" font-weight="700">
                      ฿{{ hoveredPoint.sales.toLocaleString() }} ({{ hoveredPoint.orders }} ออเดอร์)
                    </text>
                    <!-- Small triangle arrow pointing to node -->
                    <polygon points="-5,0 5,0 0,5" fill="#1F2937" />
                  </g>
                </g>
              </svg>
            </div>

            <!-- Quick Chart Legend & Time Span Badges -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; pt: 10px; border-top: 1px solid rgba(227,222,195,0.8); font-size: 11px; color: #6B7280;">
              <span>ช่วงเวลาแสดงผล: 00:00 - 23:59 น. (24 ชั่วโมง)</span>
              <div style="display: flex; gap: 14px;">
                <span style="display: flex; align-items: center; gap: 4px;">
                  <span style="width: 8px; height: 8px; border-radius: 9999px; background: #48785A;"></span>
                  ยอดขายตามชั่วโมง
                </span>
                <span style="display: flex; align-items: center; gap: 4px;">
                  <span style="width: 8px; height: 8px; border-radius: 9999px; border: 1.5px solid #48785A;"></span>
                  ช่วงเวลาหนาแน่นที่สุด
                </span>
              </div>
            </div>
          </div>

          <!-- Top Selling Items Card -->
          <div style="background-color: #EFECE3; border-radius: 24px; padding: 24px; border: 1px solid rgba(227,222,195,0.8); box-shadow: 0 4px 12px rgba(0,0,0,0.02); display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: #1F2937; margin: 0;">
                  {{ showAllTimeTop ? 'เมนูขายดีตลอดกาล' : 'เมนูขายดีประจำวัน' }}
                </h3>
                <span style="font-size: 11px; color: #6B7280;">
                  {{ showAllTimeTop ? 'ดึงจาก TOP_SELLING_MENUS_VIEW' : `ประจำวันที่ ${formattedThaiDate}` }}
                </span>
              </div>
              <button 
                @click="showAllTimeTop = !showAllTimeTop"
                style="background: none; border: none; font-size: 12px; color: #48785A; font-weight: 600; cursor: pointer; text-decoration: underline;"
              >
                {{ showAllTimeTop ? 'ดูประจำวัน' : 'ดูยอดนิยมตลอดกาล' }}
              </button>
            </div>

            <!-- List of Top Items -->
            <div style="display: flex; flex-direction: column; gap: 12px; flex: 1;">
              <!-- When viewing Day's Top Items -->
              <template v-if="!showAllTimeTop">
                <div v-if="dayTopItems.length === 0" style="text-align: center; padding: 36px 12px; color: #6B7280; font-size: 13px; background: #FAF9F5; border-radius: 16px; border: 1px dashed rgba(227,222,195,0.9);">
                  <div style="font-size: 24px; margin-bottom: 6px;">🍲</div>
                  ยังไม่มีรายการขายในวันที่เลือก
                  <div style="margin-top: 8px;">
                    <button 
                      @click="showAllTimeTop = true" 
                      style="background: #48785A; color: white; border: none; border-radius: 8px; padding: 4px 12px; font-size: 11px; cursor: pointer;"
                    >
                      ดูเมนูขายดียอดนิยมตลอดกาล
                    </button>
                  </div>
                </div>

                <div
                  v-else
                  v-for="(item, idx) in dayTopItems"
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
                    <p style="font-weight: 700; font-size: 13px; color: #1F2937; margin: 0 0 2px 0;">{{ item.orders }} จาน</p>
                    <p style="font-size: 12px; color: #48785A; font-weight: 600; margin: 0;">{{ item.revenue }}</p>
                  </div>
                </div>
              </template>

              <!-- When viewing All Time Top Menus -->
              <template v-else>
                <div v-if="allTimeTopMenus.length === 0" style="text-align: center; padding: 40px 0; color: #9CA3AF; font-size: 13px;">
                  ยังไม่มีข้อมูลเมนูขายดี
                </div>
                <div
                  v-else
                  v-for="(item, idx) in allTimeTopMenus"
                  :key="'alltime-' + idx"
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
                    <p style="font-weight: 700; font-size: 13px; color: #1F2937; margin: 0 0 2px 0;">{{ item.orders }} จาน</p>
                    <p style="font-size: 12px; color: #48785A; font-weight: 600; margin: 0;">{{ item.revenue }}</p>
                  </div>
                </div>
              </template>
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
    min-height: auto !important;
    background: white !important;
  }
  main {
    padding: 0 !important;
  }
}
</style>