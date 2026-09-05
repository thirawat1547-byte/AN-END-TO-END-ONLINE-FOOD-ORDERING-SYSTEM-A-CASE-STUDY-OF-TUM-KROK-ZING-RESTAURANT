<script setup>
import { ref } from 'vue'

const summaryCards = [
  {
    title: 'รายได้รวม',
    value: '฿12,450',
    sub: '+8.4% จากเมื่อวาน',
    isPositive: true,
    icon: '💵'
  },
  {
    title: 'ยอดสั่งซื้อทั้งหมด',
    value: '142',
    sub: 'เท่ากับเมื่อวาน',
    isNeutral: true,
    icon: '📄'
  },
  {
    title: 'เวลารอเฉลี่ย',
    value: '12',
    unit: 'นาที',
    sub: '+2 นาทีจากค่าเฉลี่ย',
    isNegative: true,
    icon: '⏱'
  },
]

const hourlyData = [
  { time: '11am', height: '15%' },
  { time: '', height: '30%' },
  { time: '12pm', height: '45%' },
  { time: '', height: '75%' },
  { time: '1pm', height: '100%', isHighlight: true },
  { time: '2pm', height: '55%' },
  { time: '3pm', height: '35%' },
  { time: '4pm', height: '60%' },
  { time: '5pm', height: '50%' },
]

const topItems = [
  {
    name: 'ส้มตำปูปูปลาร้า',
    category: 'อาหารอีสาน',
    orders: 42,
    revenue: '฿1,680',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'คอหมูย่างจิ้มแจ่ว',
    category: 'อาหารอีสาน',
    orders: 38,
    revenue: '฿2,280',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&auto=format&fit=crop&q=80'
  }
]
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh; overflow: hidden; background-color: #FAF9F5; font-family: sans-serif;">
    <!-- Top Bar Header -->
    <header style="background-color: #48785A; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; color: white;">
      <div style="display: flex; align-items: baseline; gap: 12px;">
        <h1 style="font-size: 24px; font-weight: 400; margin: 0; letter-spacing: 0.5px;">Dashboard</h1>
        <span style="font-size: 14px; font-weight: 300; opacity: 0.8;">ระบบรายงานภาพรวมร้านค้า</span>
      </div>
      <div style="display: flex; align-items: center; gap: 24px; color: rgba(255,255,255,0.9); font-size: 18px;">
        <button style="cursor: pointer; background: none; border: none; color: inherit;">🔔</button>
        <button style="cursor: pointer; background: none; border: none; color: inherit;">❓</button>
        <button style="width: 32px; height: 32px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; background: none; color: inherit; cursor: pointer; font-size: 14px;">👤</button>
      </div>
    </header>

    <!-- Scrollable Main Content -->
    <main style="flex: 1; overflow-y: auto; padding: 32px; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 100%; max-width: 1152px; display: flex; flex-direction: column; gap: 24px;">

        <!-- Title & Date Selector Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid rgba(209,213,219,0.6);">
          <div>
            <h2 style="font-size: 26px; font-weight: 700; color: #1F2937; margin: 0 0 4px 0;">รายงานยอดขายประจำวัน</h2>
            <p style="font-size: 13px; color: #6B7280; margin: 0;">วิเคราะห์สถิติและประสิทธิภาพการขายของร้าน</p>
          </div>
          <div style="background-color: white; border: 1px solid #D1D5DB; padding: 10px 16px; border-radius: 14px; font-size: 13px; font-weight: 500; color: #374151; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); cursor: pointer;">
            <span>📅</span> Today, 12 July 2026 <span style="font-size: 10px; color: #9CA3AF;">▼</span>
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
              <div
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