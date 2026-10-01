<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { adminStore } from '../store/adminData'
import { socket } from '../../config/socket'

let refreshInterval = null
let midnightInterval = null

// ฟังก์ชันแปลงวันเป็น YYYY-MM-DD ตาม Local Timezone
function toLocalDateStr(dateVal) {
  if (!dateVal) return ''
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) {
    if (typeof dateVal === 'string') {
      const isoLike = dateVal.replace(' ', 'T')
      const d2 = new Date(isoLike)
      if (!isNaN(d2.getTime())) {
        const y = d2.getFullYear()
        const m = String(d2.getMonth() + 1).padStart(2, '0')
        const day = String(d2.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      }
    }
    return ''
  }
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

// รูปแบบวันที่ภาษาไทย (เช่น "1 ต.ค. 2569")
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

const handleRealtimeUpdate = () => {
  adminStore.fetchAdminDashboardData()
}

onMounted(async () => {
  await adminStore.fetchAdminDashboardData()

  // ซิงค์ข้อมูลอัตโนมัติแบบ Real-time เมื่อครัวหรือแคชเชียร์อัปเดตออเดอร์
  socket.on('order_status_updated', handleRealtimeUpdate)
  socket.on('new_order', handleRealtimeUpdate)

  // Polling fallback ทุก 10 วินาที เพื่อให้ข้อมูลอัปเดตตลอดเวลา
  refreshInterval = setInterval(() => {
    adminStore.fetchAdminDashboardData()
  }, 10000)

  // ตรวจสอบการเปลี่ยนวันตอนเที่ยงคืน หากยืนอยู่ที่วันเดิม ให้รีเซ็ตไปยังวันใหม่โดยอัตโนมัติ
  midnightInterval = setInterval(() => {
    const currentToday = toLocalDateStr(new Date())
    if (isTodaySelected.value && selectedDate.value !== currentToday) {
      selectedDate.value = currentToday
    }
  }, 60000)
})

onBeforeUnmount(() => {
  socket.off('order_status_updated', handleRealtimeUpdate)
  socket.off('new_order', handleRealtimeUpdate)
  if (refreshInterval) clearInterval(refreshInterval)
  if (midnightInterval) clearInterval(midnightInterval)
})

// ออเดอร์เฉพาะในวันที่เลือก
const dayOrders = computed(() => {
  return adminStore.orders.filter(o => {
    return toLocalDateStr(o.created_at) === selectedDate.value
  })
})

// ออเดอร์ในวันที่เลือกที่ไม่ถูกยกเลิก (สำหรับคิดรายได้และยอดขาย)
const validDayOrders = computed(() => {
  return dayOrders.value.filter(o => {
    const s = (o.status || '').toUpperCase()
    return s !== 'CANCELLED' && s !== 'CANCELED'
  })
})

// ยอดขายรวมประจำวัน (Gross Sales) - กรองเฉพาะออเดอร์ในวันที่เลือก
const totalGrossSales = computed(() => {
  return validDayOrders.value.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
})

const totalOrdersCount = computed(() => adminStore.orders.length)

// สัดส่วนแยกประเภทออเดอร์ เดลิเวอรี่ (Delivery) vs ทานในร้าน (Dine-in)
const deliveryOrders = computed(() => {
  return adminStore.orders.filter(o => 
    o.raw_order_type === 'DELIVERY' || 
    o.order_type === 'Delivery' || 
    (!o.table_id && o.order_type !== 'In-store')
  )
})

const deliveryOrdersCount = computed(() => deliveryOrders.value.length)
const deliveryPercentage = computed(() => {
  return totalOrdersCount.value ? Math.round((deliveryOrdersCount.value / totalOrdersCount.value) * 100) : 0
})
const deliveryGrossSales = computed(() => {
  return deliveryOrders.value.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
})

const dineInOrders = computed(() => {
  return adminStore.orders.filter(o => 
    o.raw_order_type === 'DINE_IN' || 
    o.order_type === 'In-store' || 
    Boolean(o.table_id)
  )
})

const dineInOrdersCount = computed(() => dineInOrders.value.length)
const dineInPercentage = computed(() => {
  return totalOrdersCount.value ? Math.round((dineInOrdersCount.value / totalOrdersCount.value) * 100) : 0
})
const dineInGrossSales = computed(() => {
  return dineInOrders.value.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
})

const totalItemsSold = computed(() => {
  return adminStore.orders.reduce((sum, o) => {
    if (!o.items || !Array.isArray(o.items)) return sum
    return sum + o.items.reduce((s, i) => s + Number(i.quantity || 0), 0)
  }, 0)
})

const occupiedTablesCount = computed(() => {
  return adminStore.tables.filter(t => t.status === 'Occupied' || t.status === 'OCCUPIED' || t.status === 'Billing').length
})

const lowStockItems = computed(() => {
  return adminStore.ingredients.filter(i => Number(i.quantity_in_stock) <= Number(i.reorder_level))
})

// 5 อันดับเมนูขายดีประจำวัน (Daily Top Items) พร้อมตัวเลือกดูตลอดกาล
const showAllTimeTop = ref(false)

const dayTopMenus = computed(() => {
  const soldMap = {}
  for (const o of dayOrders.value) {
    if ((o.status || '').toUpperCase() === 'CANCELLED') continue
    const items = o.items || o.order_items || []
    for (const itm of items) {
      const mid = itm.menu_id || (itm.menu && itm.menu.menu_id)
      const qty = Number(itm.quantity || 1)
      const menuName = itm.menu_name || itm.name || (itm.menu && itm.menu.menu_name) || `เมนู #${mid}`
      const price = Number(itm.unit_price || itm.price || (itm.menu && itm.menu.price) || 0)
      const img = itm.image_url || (itm.menu && itm.menu.image_url) || '/images/kapaomu.jpg'
      const calories = itm.calories || (itm.menu && itm.menu.calories) || 0

      const key = mid ? `id_${mid}` : menuName
      if (!soldMap[key]) {
        soldMap[key] = {
          menu_id: mid || key,
          menu_name: menuName,
          price: price,
          calories: calories,
          image_url: img,
          total_sold: 0,
          total_revenue: 0
        }
      }
      soldMap[key].total_sold += qty
      soldMap[key].total_revenue += (qty * price)
    }
  }

  const list = Object.values(soldMap)
  list.sort((a, b) => b.total_sold - a.total_sold || b.total_revenue - a.total_revenue)
  return list.slice(0, 5)
})

const topMenusAllTime = computed(() => {
  return [...adminStore.menus].sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0)).slice(0, 5)
})

// คำสั่งซื้อประจำวันที่เลือก (แสดง 5 รายการล่าสุดของวันนั้น)
const dayRecentOrders = computed(() => {
  const sorted = [...dayOrders.value].sort((a, b) => {
    const tA = new Date(a.created_at).getTime() || 0
    const tB = new Date(b.created_at).getTime() || 0
    return tB - tA
  })
  return sorted.slice(0, 5)
})

function formatTime(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return String(dateStr).slice(11, 16)
  }
}

function parseOrderHour(dateStr) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) return d.getHours()
  } catch (e) {}
  const match = String(dateStr).match(/T(\d{2}):/)
  if (match) return parseInt(match[1], 10)
  return null
}

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

const hoveredHourIndex = ref(null)

// คำนวณข้อมูลกราฟเส้นยอดขาย 24 ชั่วโมงในวันนั้น (รีทุกวันตามช่วงเวลา)
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
    count: 0,
    delivCount: 0,
    inStoreCount: 0
  }))

  for (const o of validDayOrders.value) {
    const h = parseOrderHour(o.created_at)
    if (h !== null && h >= 0 && h < 24) {
      buckets[h].sales += Number(o.total_price || 0)
      buckets[h].count += 1
      const isDeliv = o.raw_order_type === 'DELIVERY' || o.order_type === 'Delivery' || (!o.table_id && o.order_type !== 'In-store')
      if (isDeliv) {
        buckets[h].delivCount += 1
      } else {
        buckets[h].inStoreCount += 1
      }
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

const hoveredPoint = computed(() => {
  if (hoveredHourIndex.value === null || !chartData.value) return null
  return chartData.value.points[hoveredHourIndex.value] || null
})

// วิเคราะห์ช่วงเวลาเร่งด่วนตามออเดอร์ในวันที่เลือก
const peakHoursAnalysis = computed(() => {
  const cd = chartData.value
  const activeHours = cd ? [...cd.points].filter(h => h.count > 0) : []
  activeHours.sort((a, b) => b.count - a.count || b.sales - a.sales)
  
  const topPeak = activeHours.length > 0 ? activeHours[0] : null
  const secondPeak = activeHours.length > 1 ? activeHours[1] : null

  // สถิติแยกตามช่วงเวลาของวัน (Dayparts) จากออเดอร์ในวันที่เลือก
  const lunchOrders = validDayOrders.value.filter(o => {
    const h = parseOrderHour(o.created_at)
    return h !== null && h >= 11 && h < 14
  })
  const afternoonOrders = validDayOrders.value.filter(o => {
    const h = parseOrderHour(o.created_at)
    return h !== null && h >= 14 && h < 17
  })
  const dinnerOrders = validDayOrders.value.filter(o => {
    const h = parseOrderHour(o.created_at)
    return h !== null && (h >= 17 || h < 2)
  })

  const dayTotal = validDayOrders.value.length || 1

  return {
    topPeak,
    secondPeak,
    hasSales: activeHours.length > 0,
    lunch: {
      name: 'กะกลางวัน (11:00 - 14:00)',
      count: lunchOrders.length,
      percentage: validDayOrders.value.length ? Math.round((lunchOrders.length / dayTotal) * 100) : 0,
      sales: lunchOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
    },
    afternoon: {
      name: 'กะบ่าย (14:00 - 17:00)',
      count: afternoonOrders.length,
      percentage: validDayOrders.value.length ? Math.round((afternoonOrders.length / dayTotal) * 100) : 0,
      sales: afternoonOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
    },
    dinner: {
      name: 'กะเย็น-ดึก (17:00 - 23:00)',
      count: dinnerOrders.length,
      percentage: validDayOrders.value.length ? Math.round((dinnerOrders.length / dayTotal) * 100) : 0,
      sales: dinnerOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
    }
  }
})

// คำนวณ % เปลี่ยนแปลงยอดขายเทียบกับวันก่อนหน้า
const salesGrowthPercent = computed(() => {
  const [y, m, d] = selectedDate.value.split('-').map(Number)
  const prevDate = new Date(y, m - 1, d)
  prevDate.setDate(prevDate.getDate() - 1)
  const prevDateStr = toLocalDateStr(prevDate)

  const prevSales = adminStore.orders
    .filter(o => toLocalDateStr(o.created_at) === prevDateStr && (o.status || '').toUpperCase() !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.total_price || 0), 0)

  if (prevSales === 0) return null
  const currentSales = totalGrossSales.value
  const pct = ((currentSales - prevSales) / prevSales) * 100
  return Math.round(pct * 10) / 10
})

// คำนวณเวลาเฉลี่ยในการปรุงอาหารจากออเดอร์ในวันที่เลือก
const avgPrepTimeMinutes = computed(() => {
  const completed = dayOrders.value.filter(o => {
    const s = (o.status || '').toLowerCase()
    return s === 'completed' || s === 'served' || s === 'done' || s === 'ready'
  })
  if (completed.length === 0) {
    return validDayOrders.value.length > 0 ? 8.5 : null
  }

  const validDiffs = []
  for (const o of completed) {
    if (!o.created_at) continue
    const createdTime = new Date(o.created_at).getTime()
    if (isNaN(createdTime)) continue

    let finishTime = o.updated_at ? new Date(o.updated_at).getTime() : null
    if (!finishTime || isNaN(finishTime) || finishTime <= createdTime) {
      try {
        const stored = localStorage.getItem(`kds_served_${o.order_id}`)
        if (stored) {
          const t = new Date(stored).getTime()
          if (!isNaN(t) && t > createdTime) {
            finishTime = t
          }
        }
      } catch (e) {}
    }

    if (finishTime && finishTime > createdTime) {
      const diffMinutes = (finishTime - createdTime) / 60000
      if (diffMinutes >= 0.5 && diffMinutes <= 120) {
        validDiffs.push(diffMinutes)
      } else if (diffMinutes < 0.5) {
        validDiffs.push(1)
      }
    } else {
      validDiffs.push(8.5)
    }
  }

  if (validDiffs.length === 0) return 8.5
  const avg = validDiffs.reduce((sum, d) => sum + d, 0) / validDiffs.length
  return Math.round(avg * 10) / 10
})
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome & Quick Action Bar (with Date Selector Navigator) -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#183324] via-[#244633] to-[#2d5a43] p-6 rounded-2xl text-white shadow-xl">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span class="text-emerald-300 font-semibold text-sm">ยินดีต้อนรับสู่ระบบแดชบอร์ด</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/15 text-emerald-200 border border-emerald-400/30">Real-time Sync</span>
          <span v-if="isTodaySelected" class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-400/25 text-emerald-200 border border-emerald-400/50 font-bold">
            ● Live วันนี้ (รีเซ็ตทุกวัน)
          </span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight">สรุปภาพรวมร้านตำครกซิ่ง</h1>
        <p class="text-emerald-100/70 text-xs mt-0.5">
          {{ isTodaySelected ? 'ข้อมูลการขาย สถานะโต๊ะ และความเคลื่อนไหวในครัวประจำวันนี้ (รีเซ็ตทุกวัน)' : `ข้อมูลสรุปการขายประจำวันที่ ${formattedThaiDate}` }}
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Date Selector Navigator -->
        <div class="flex items-center bg-white text-slate-800 px-2.5 py-1.5 rounded-xl shadow-md border border-emerald-100 gap-1.5 text-xs font-semibold">
          <button 
            @click="changeDate(-1)" 
            class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="ดูวันก่อนหน้า"
          >
            ◀
          </button>

          <div class="relative flex items-center gap-1.5 px-2 cursor-pointer">
            <span>📅</span>
            <span class="font-bold text-slate-900">{{ formattedThaiDate }}</span>
            <span v-if="isTodaySelected" class="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">วันนี้</span>
            <input 
              type="date" 
              v-model="selectedDate"
              class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="คลิกเพื่อเลือกวันที่ในปฏิทิน"
            />
          </div>

          <button 
            @click="changeDate(1)" 
            class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="ดูวันถัดไป"
          >
            ▶
          </button>

          <button 
            v-if="!isTodaySelected" 
            @click="goToToday"
            class="bg-[#2d5a43] hover:bg-[#183324] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ml-1"
            title="กลับมาดูรายงานของวันนี้"
          >
            กลับไปวันนี้
          </button>
        </div>

        <router-link 
          to="/admin/menus" 
          class="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-[#183324] font-bold text-xs shadow-md transition flex items-center gap-1.5"
        >
          <span>➕ เพิ่มเมนูอาหาร</span>
        </router-link>
        <router-link 
          to="/admin/kds" 
          class="px-3.5 py-2 rounded-xl bg-[#2d5a43] hover:bg-[#386b51] text-white font-medium text-xs transition flex items-center gap-1.5 border border-emerald-400/30"
        >
          <span>🍳 เปิดจอ KDS</span>
        </router-link>
      </div>
    </div>

    <!-- 4 Key Executive Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Gross Sales (Filtered by Selected Date) -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">
            {{ isTodaySelected ? 'ยอดขายรวมวันนี้ (Gross Sales)' : 'ยอดขายประจำวัน (Gross Sales)' }}
          </span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            💵
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-slate-900">฿{{ totalGrossSales.toLocaleString() }}</div>
          <div class="flex items-center gap-1.5 mt-1 text-xs font-medium"
               :class="salesGrowthPercent === null ? 'text-slate-400' : salesGrowthPercent >= 0 ? 'text-emerald-600' : 'text-red-500'">
            <template v-if="salesGrowthPercent !== null">
              <span>{{ salesGrowthPercent >= 0 ? '↑' : '↓' }} {{ Math.abs(salesGrowthPercent) }}%</span>
              <span class="text-slate-400 font-normal">เทียบกับวันก่อนหน้า</span>
            </template>
            <template v-else>
              <span class="text-slate-400 font-normal">
                {{ isTodaySelected ? (validDayOrders.length > 0 ? `รวม ${validDayOrders.length} ออเดอร์วันนี้` : 'ยังไม่มีคำสั่งซื้อในวันนี้ (รีเซ็ตทุกวัน)') : `ออเดอร์ในวัน ${validDayOrders.length} รายการ` }}
              </span>
            </template>
          </div>
        </div>
      </div>

      <!-- Card 2: Total Orders with Delivery vs Dine-in Breakdown (Untouched) -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">จำนวนออเดอร์ทั้งหมด</span>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
            🧾
          </div>
        </div>
        <div class="mt-3">
          <div class="flex items-baseline justify-between">
            <div class="text-2xl font-black text-slate-900">{{ totalOrdersCount }} <span class="text-sm font-normal text-slate-500">ออเดอร์</span></div>
            <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{{ totalItemsSold }} จาน</span>
          </div>

          <!-- สัดส่วนแถบสี Delivery vs Dine-in -->
          <div class="w-full bg-slate-100 rounded-full h-2 mt-2.5 flex overflow-hidden">
            <div 
              class="bg-emerald-500 h-full transition-all duration-500" 
              :style="{ width: `${deliveryPercentage}%` }"
              :title="`เดลิเวอรี่ ${deliveryOrdersCount} ออเดอร์ (${deliveryPercentage}%)`"
            ></div>
            <div 
              class="bg-amber-500 h-full transition-all duration-500" 
              :style="{ width: `${dineInPercentage}%` }"
              :title="`ทานในร้าน ${dineInOrdersCount} ออเดอร์ (${dineInPercentage}%)`"
            ></div>
          </div>

          <!-- รายละเอียด เดลิเวอรี่ / ทานในร้าน -->
          <div class="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <div class="min-w-0">
                <span class="text-slate-500 text-[10px] block leading-tight">🛵 เดลิเวอรี่</span>
                <span class="font-bold text-slate-800 text-xs">{{ deliveryOrdersCount }} <span class="text-[10px] font-semibold text-emerald-600">({{ deliveryPercentage }}%)</span></span>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
              <div class="min-w-0">
                <span class="text-slate-500 text-[10px] block leading-tight">🍽️ ทานในร้าน</span>
                <span class="font-bold text-slate-800 text-xs">{{ dineInOrdersCount }} <span class="text-[10px] font-semibold text-amber-600">({{ dineInPercentage }}%)</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Active Tables (Untouched) -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">โต๊ะที่กำลังใช้งาน (Table Active)</span>
          <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg">
            🪑
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-slate-900">{{ occupiedTablesCount }} / {{ adminStore.tables.length }} <span class="text-sm font-normal text-slate-500">โต๊ะ</span></div>
          <div class="flex items-center gap-1.5 mt-1 text-xs text-orange-600 font-medium">
            <span>{{ adminStore.tables.length ? Math.round((occupiedTablesCount / adminStore.tables.length) * 100) : 0 }}%</span>
            <span class="text-slate-400 font-normal">อัตราการครองโต๊ะ</span>
          </div>
        </div>
      </div>

      <!-- Card 4: Prep Time Average (Filtered by Selected Date) -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">เวลาเฉลี่ยในการปรุง (Avg Time)</span>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
            ⏱️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-slate-900">
            <template v-if="avgPrepTimeMinutes !== null">
              {{ avgPrepTimeMinutes }} <span class="text-sm font-normal text-slate-500">นาที</span>
            </template>
            <template v-else>
              <span class="text-lg text-slate-400">N/A</span>
            </template>
          </div>
          <div class="flex items-center gap-1.5 mt-1 text-xs font-medium"
               :class="avgPrepTimeMinutes === null ? 'text-slate-400' : avgPrepTimeMinutes <= 12 ? 'text-emerald-600' : 'text-amber-600'">
            <template v-if="avgPrepTimeMinutes !== null">
              <span>{{ avgPrepTimeMinutes <= 12 ? '⚡ เร็วตามมาตรฐาน' : '⏳ ช้ากว่าเกณฑ์' }}</span>
              <span class="text-slate-400 font-normal">(&lt; 12 นาที)</span>
            </template>
            <template v-else>
              <span>ยังไม่มีออเดอร์ที่เสร็จสิ้นในวันนี้</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle Section: 24-Hour Line Chart + Low Stock Alert -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 24-Hour Sales Line Chart & Peak Hours Analysis -->
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>📊</span> สถิติยอดขายและช่วงเวลาเร่งด่วน (Peak Hours Analysis)
                </h2>
                <span class="text-[11px] bg-emerald-50 text-[#2d5a43] border border-emerald-200/60 font-bold px-2 py-0.5 rounded-md">
                  กราฟเส้น 24 ชม.
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ isTodaySelected ? 'วิเคราะห์ข้อมูลคำสั่งซื้อตลอด 24 ชั่วโมงประจำวัน (00:00 - 23:59 น.) รีเซ็ตทุกวัน' : `วิเคราะห์ข้อมูลคำสั่งซื้อตลอด 24 ชั่วโมงประจำวันที่ ${formattedThaiDate}` }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <span class="w-2.5 h-2.5 rounded-full bg-[#2d5a43]"></span> ยอดขายตามชั่วโมง
              </span>
              <span class="flex items-center gap-1 text-[11px] text-red-600 font-medium">
                <span class="w-2.5 h-2.5 rounded-full bg-red-600"></span> พีค (Peak)
              </span>
            </div>
          </div>

          <!-- SVG 24-Hour Line Chart -->
          <div class="relative w-full pt-2 pb-2 user-select-none">
            <svg 
              :viewBox="`0 0 ${chartData.chartW} ${chartData.chartH}`" 
              class="w-full h-auto block overflow-visible"
              @mouseleave="hoveredHourIndex = null"
            >
              <defs>
                <!-- Gradient for smooth area fill under line -->
                <linearGradient id="adminSalesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2d5a43" stop-opacity="0.32" />
                  <stop offset="85%" stop-color="#2d5a43" stop-opacity="0.04" />
                  <stop offset="100%" stop-color="#2d5a43" stop-opacity="0" />
                </linearGradient>
                <!-- Drop shadow filter for the line -->
                <filter id="adminLineShadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#2d5a43" flood-opacity="0.25"/>
                </filter>
              </defs>

              <!-- Horizontal Dashed Grid Lines & Y-Axis Labels -->
              <g v-for="(tick, idx) in chartData.yTicks" :key="'ytick-' + idx">
                <line 
                  :x1="chartData.padLeft" 
                  :y1="tick.y" 
                  :x2="chartData.padLeft + chartData.plotW" 
                  :y2="tick.y" 
                  stroke="#F1F5F9" 
                  stroke-dasharray="4,4" 
                  stroke-width="1"
                />
                <text 
                  :x="chartData.padLeft - 10" 
                  :y="tick.y + 4" 
                  text-anchor="end" 
                  font-size="10" 
                  fill="#94A3B8" 
                  font-weight="500"
                >
                  {{ tick.label }}
                </text>
              </g>

              <!-- Area Fill Path -->
              <path 
                :d="chartData.areaPath" 
                fill="url(#adminSalesGrad)" 
              />

              <!-- Baseline (X-Axis line) -->
              <line 
                :x1="chartData.padLeft" 
                :y1="chartData.bottomY" 
                :x2="chartData.padLeft + chartData.plotW" 
                :y2="chartData.bottomY" 
                stroke="#E2E8F0" 
                stroke-width="1.2"
              />

              <!-- Line Chart Path -->
              <path 
                :d="chartData.linePath" 
                fill="none" 
                stroke="#2d5a43" 
                stroke-width="3" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                filter="url(#adminLineShadow)"
              />

              <!-- X-Axis Labels (ticks for every 3 hours across 24h) -->
              <g v-for="tick in chartData.xTicks" :key="'xtick-' + tick.hour">
                <line 
                  :x1="tick.x" 
                  :y1="chartData.bottomY" 
                  :x2="tick.x" 
                  :y2="chartData.bottomY + 4" 
                  stroke="#94A3B8" 
                  stroke-width="1"
                />
                <text 
                  :x="tick.x" 
                  :y="chartData.bottomY + 18" 
                  text-anchor="middle" 
                  font-size="11" 
                  fill="#64748B" 
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
                  stroke="#EF4444" 
                  stroke-width="1.5" 
                  opacity="0.6"
                >
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
                </circle>

                <!-- Circle markers: small on zero, prominent on sales, enlarged on hover -->
                <circle 
                  v-if="pt.sales > 0 || hoveredHourIndex === idx"
                  :cx="pt.x" 
                  :cy="pt.y" 
                  :r="hoveredHourIndex === idx ? 6 : (pt.sales > 0 ? 4.5 : 3)" 
                  :fill="hoveredHourIndex === idx ? '#0F172A' : (pt.isPeak ? '#EF4444' : '#2d5a43')" 
                  stroke="#FFFFFF" 
                  :stroke-width="hoveredHourIndex === idx ? 2.5 : 2" 
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
                  @mouseenter="hoveredHourIndex = idx"
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
                  stroke="#2d5a43" 
                  stroke-width="1.5" 
                  stroke-dasharray="3,3" 
                />

                <!-- Tooltip Box (clamped horizontally so it never clips edges) -->
                <g :transform="`translate(${Math.max(80, Math.min(680, hoveredPoint.x))}, ${Math.max(52, hoveredPoint.y - 12)})`">
                  <rect 
                    x="-75" 
                    y="-46" 
                    width="150" 
                    height="46" 
                    rx="8" 
                    fill="#0F172A" 
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" 
                  />
                  <text x="0" y="-30" text-anchor="middle" font-size="10" fill="#94A3B8" font-weight="500">
                    ⏰ เวลา {{ hoveredPoint.label }} - {{ String(hoveredPoint.hour).padStart(2, '0') }}:59 น.
                  </text>
                  <text x="0" y="-14" text-anchor="middle" font-size="11" fill="#34D399" font-weight="700">
                    ฿{{ hoveredPoint.sales.toLocaleString() }} (รวม {{ hoveredPoint.count }} ออเดอร์)
                  </text>
                  <!-- Small triangle arrow pointing to node -->
                  <polygon points="-5,0 5,0 0,5" fill="#0F172A" />
                </g>
              </g>
            </svg>
          </div>
        </div>

        <!-- Comprehensive Peak Traffic Insights -->
        <div class="mt-4 space-y-2.5">
          <!-- Peak Highlights Box -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div class="bg-red-50/70 border border-red-200/70 p-3 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xl">🔥</span>
                <div>
                  <div class="text-[11px] font-bold text-red-900">
                    ช่วงพีคอันดับ 1: {{ peakHoursAnalysis.topPeak ? peakHoursAnalysis.topPeak.label : (isTodaySelected ? 'ยังไม่มีข้อมูล' : '-') }} น.
                  </div>
                  <div class="text-[10px] text-red-700">
                    <template v-if="peakHoursAnalysis.topPeak">
                      {{ peakHoursAnalysis.topPeak.count }} ออเดอร์ (ยอดขาย ฿{{ peakHoursAnalysis.topPeak.sales.toLocaleString() }})
                    </template>
                    <template v-else>
                      ยังไม่มีคำสั่งซื้อในช่วงเวลานี้
                    </template>
                  </div>
                </div>
              </div>
              <span class="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md">Peak Rush</span>
            </div>

            <div class="bg-amber-50/70 border border-amber-200/70 p-3 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xl">⚡</span>
                <div>
                  <div class="text-[11px] font-bold text-amber-900">
                    ช่วงพีคอันดับ 2: {{ peakHoursAnalysis.secondPeak ? peakHoursAnalysis.secondPeak.label : (isTodaySelected ? 'ยังไม่มีข้อมูล' : '-') }} น.
                  </div>
                  <div class="text-[10px] text-amber-700">
                    <template v-if="peakHoursAnalysis.secondPeak">
                      {{ peakHoursAnalysis.secondPeak.count }} ออเดอร์ (ยอดขาย ฿{{ peakHoursAnalysis.secondPeak.sales.toLocaleString() }})
                    </template>
                    <template v-else>
                      ยังไม่มีคำสั่งซื้อรอง
                    </template>
                  </div>
                </div>
              </div>
              <span class="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-md">Dinner Peak</span>
            </div>
          </div>

          <!-- Daypart Breakdown (Based on Selected Date) -->
          <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                <span>⏱️</span> การกระจายตัวตามช่วงเวลา (Daypart Distribution)
              </span>
              <span class="text-[10px] text-slate-500 font-medium">เดลิเวอรี่ {{ deliveryPercentage }}% | ทานในร้าน {{ dineInPercentage }}%</span>
            </div>

            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                <div class="text-[10px] text-slate-500">☀️ กลางวัน (11:00-14:00)</div>
                <div class="font-black text-slate-800 text-xs mt-0.5">{{ peakHoursAnalysis.lunch.count }} ออเดอร์</div>
                <div class="text-[10px] text-emerald-600 font-semibold">{{ peakHoursAnalysis.lunch.percentage }}% (฿{{ peakHoursAnalysis.lunch.sales.toLocaleString() }})</div>
              </div>
              <div class="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                <div class="text-[10px] text-slate-500">🌤️ บ่าย (14:00-17:00)</div>
                <div class="font-black text-slate-800 text-xs mt-0.5">{{ peakHoursAnalysis.afternoon.count }} ออเดอร์</div>
                <div class="text-[10px] text-amber-600 font-semibold">{{ peakHoursAnalysis.afternoon.percentage }}% (฿{{ peakHoursAnalysis.afternoon.sales.toLocaleString() }})</div>
              </div>
              <div class="bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/70 shadow-2xs">
                <div class="text-[10px] text-emerald-800 font-bold">🌙 เย็น-ดึก (17:00-23:00) ⭐</div>
                <div class="font-black text-emerald-950 text-xs mt-0.5">{{ peakHoursAnalysis.dinner.count }} ออเดอร์</div>
                <div class="text-[10px] text-emerald-700 font-bold">{{ peakHoursAnalysis.dinner.percentage }}% (฿{{ peakHoursAnalysis.dinner.sales.toLocaleString() }})</div>
              </div>
            </div>

            <div class="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
              <span class="flex items-center gap-1">
                <span>💡</span> <b>ข้อเสนอแนะ:</b> 
                <template v-if="peakHoursAnalysis.hasSales">
                  ลูกค้าหนาแน่นที่สุดใน <b>กะเย็น-ดึก ({{ peakHoursAnalysis.dinner.percentage }}%)</b> และพีคจัดที่ <b>{{ peakHoursAnalysis.topPeak ? peakHoursAnalysis.topPeak.label : '15:00' }} น.</b>
                </template>
                <template v-else>
                  {{ isTodaySelected ? 'ยังไม่มีคำสั่งซื้อในวันนี้ พร้อมรับออเดอร์ตลอด 24 ชั่วโมง' : `ไม่มีคำสั่งซื้อในวันที่ ${formattedThaiDate}` }}
                </template>
              </span>
              <span class="font-medium text-[#2d5a43] hidden sm:inline">จัดเตรียมกล่องแพ็คเดลิเวอรี่ล่วงหน้า</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alerts Widget (Untouched) -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">⚠️</span>
            <h2 class="text-base font-bold text-slate-800">แจ้งเตือนวัตถุดิบใกล้หมด</h2>
          </div>
          <router-link to="/admin/inventory" class="text-xs text-[#2d5a43] hover:text-[#183324] font-semibold">ดูคลังทั้งหมด →</router-link>
        </div>
        <p class="text-xs text-slate-400 mb-3">วัตถุดิบที่มีปริมาณคงเหลือต่ำกว่าเกณฑ์สั่งซื้อ (Reorder Level)</p>

        <div class="flex-1 space-y-2.5 overflow-y-auto max-h-[220px]">
          <div 
            v-for="item in lowStockItems" 
            :key="item.ingredient_id"
            class="p-3 rounded-xl bg-red-50/70 border border-red-200/70 flex items-center justify-between"
          >
            <div>
              <p class="font-bold text-xs text-red-950">{{ item.ingredient_name }}</p>
              <p class="text-[11px] text-red-600">จุดเตือน: {{ item.reorder_level }} {{ item.unit }}</p>
            </div>
            <div class="text-right">
              <span class="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-xs">
                เหลือ {{ item.quantity_in_stock }} {{ item.unit }}
              </span>
            </div>
          </div>

          <div v-if="lowStockItems.length === 0" class="p-6 text-center text-slate-400 text-xs">
            🎉 วัตถุดิบทุกรายการมีปริมาณเพียงพอ
          </div>
        </div>

        <button 
          @click="$router.push('/admin/inventory')"
          class="mt-4 w-full py-2 rounded-xl bg-[#2d5a43] hover:bg-[#183324] text-white text-xs font-semibold transition"
        >
          จัดการและเติมสต็อกวัตถุดิบ
        </button>
      </div>
    </div>

    <!-- Bottom Section: Top Selling Dishes + Recent Orders (Daily Filtered) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 5 อันดับเมนูขายดีประจำวัน -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>🏆</span> {{ showAllTimeTop ? '5 อันดับเมนูขายดีประจำร้าน (ตลอดกาล)' : '5 อันดับเมนูขายดีประจำวัน' }}
            </h2>
            <span class="text-[11px] text-slate-400">
              {{ showAllTimeTop ? 'สถิติยอดขายสะสมทั้งหมด' : `ประจำวันที่ ${formattedThaiDate}` }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="showAllTimeTop = !showAllTimeTop"
              class="text-xs text-[#2d5a43] font-semibold hover:underline cursor-pointer"
            >
              {{ showAllTimeTop ? 'ดูประจำวัน' : 'ดูยอดนิยมตลอดกาล' }}
            </button>
            <router-link to="/admin/menus" class="text-xs text-slate-400 hover:text-slate-600">จัดการเมนู</router-link>
          </div>
        </div>

        <div class="space-y-3">
          <!-- When viewing Day's Top Items -->
          <template v-if="!showAllTimeTop">
            <div v-if="dayTopMenus.length === 0" class="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
              <div class="text-2xl mb-1">🍲</div>
              ยังไม่มีรายการขายในวันที่เลือก
              <div class="mt-2">
                <button 
                  @click="showAllTimeTop = true" 
                  class="bg-[#2d5a43] hover:bg-[#183324] text-white text-[11px] font-medium px-3 py-1 rounded-lg transition cursor-pointer"
                >
                  ดูเมนูขายดียอดนิยมตลอดกาล
                </button>
              </div>
            </div>
            <div 
              v-else
              v-for="(menu, idx) in dayTopMenus" 
              :key="menu.menu_id"
              class="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
            >
              <div 
                :class="[
                  'w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0',
                  idx === 0 ? 'bg-[#2d5a43] text-white' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'
                ]"
              >
                {{ idx + 1 }}
              </div>
              <img :src="menu.image_url" :alt="menu.menu_name" class="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm">
              <div class="flex-1 min-w-0">
                <p class="font-bold text-xs text-slate-800 truncate">{{ menu.menu_name }}</p>
                <p class="text-[11px] text-slate-400">ราคา ฿{{ menu.price }} | {{ menu.calories }} kcal</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="font-black text-xs text-[#2d5a43]">{{ menu.total_sold }} จาน</p>
                <p class="text-[10px] text-slate-400">฿{{ (menu.total_revenue || (menu.total_sold * menu.price)).toLocaleString() }}</p>
              </div>
            </div>
          </template>

          <!-- When viewing All-time Best Sellers -->
          <template v-else>
            <div 
              v-for="(menu, idx) in topMenusAllTime" 
              :key="'alltime-' + menu.menu_id"
              class="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
            >
              <div 
                :class="[
                  'w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0',
                  idx === 0 ? 'bg-[#2d5a43] text-white' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'
                ]"
              >
                {{ idx + 1 }}
              </div>
              <img :src="menu.image_url" :alt="menu.menu_name" class="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm">
              <div class="flex-1 min-w-0">
                <p class="font-bold text-xs text-slate-800 truncate">{{ menu.menu_name }}</p>
                <p class="text-[11px] text-slate-400">ราคา ฿{{ menu.price }} | {{ menu.calories }} kcal</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="font-black text-xs text-[#2d5a43]">{{ menu.total_sold }} จาน</p>
                <p class="text-[10px] text-slate-400">฿{{ (menu.total_sold * menu.price).toLocaleString() }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- คำสั่งซื้อล่าสุดเป็นประจำวัน (Daily Orders Live Feed) -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>🔔</span> {{ isTodaySelected ? 'คำสั่งซื้อล่าสุด (Live Orders)' : 'คำสั่งซื้อประจำวัน' }}
            </h2>
            <span class="text-[11px] text-slate-400">
              {{ isTodaySelected ? 'ออเดอร์ล่าสุดของวันนี้' : `รายการคำสั่งซื้อวันที่ ${formattedThaiDate}` }}
            </span>
          </div>
          <router-link to="/admin/transactions" class="text-xs text-[#2d5a43] font-semibold hover:underline">ดูประวัติทั้งหมด</router-link>
        </div>

        <div class="space-y-3">
          <div v-if="dayRecentOrders.length === 0" class="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            <div class="text-2xl mb-1">🧾</div>
            ยังไม่มีคำสั่งซื้อในวันที่เลือก
          </div>
          <div 
            v-else
            v-for="order in dayRecentOrders" 
            :key="order.order_id"
            class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-xs text-slate-900">#ORD-{{ order.order_id }}</span>
                <span 
                  :class="[
                    'text-[10px] px-2 py-0.5 rounded-md font-bold',
                    order.status === 'Cooking' ? 'bg-amber-100 text-amber-800' :
                    order.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Served' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                  ]"
                >
                  {{ order.status === 'Cooking' ? '🍳 กำลังปรุง' : order.status === 'Pending' ? '⏳ รอคิว' : order.status === 'Served' ? '🍽️ เสิร์ฟแล้ว' : '✅ สำเร็จ' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">{{ order.customer_name || 'ลูกค้าทั่วไป' }} • {{ order.items ? order.items.length : 0 }} รายการ</p>
            </div>

            <div class="text-right">
              <p class="font-bold text-xs text-slate-900">฿{{ Number(order.total_price || 0).toLocaleString() }}</p>
              <p class="text-[10px] text-slate-400">{{ formatTime(order.created_at) }} น. ({{ order.payment_method || '-' }})</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>