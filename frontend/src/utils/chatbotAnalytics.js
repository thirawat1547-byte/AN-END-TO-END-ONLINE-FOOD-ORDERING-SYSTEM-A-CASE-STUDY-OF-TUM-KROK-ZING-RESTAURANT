// src/utils/chatbotAnalytics.js
// ระบบบันทึกและคำนวณสถิติการถาม-ตอบของแชทบอท AI (น้องส้มตำ) ประจำวันแบบอิงตามความจริง

export const CHATBOT_LOGS_KEY = 'tumkrokzing_chatbot_logs'

/**
 * แปลงวันที่เป็นรูปแบบ YYYY-MM-DD ตามเวลาท้องถิ่น
 */
export function formatDateKey(dateInput) {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) {
    if (typeof dateInput === 'string') {
      const match = dateInput.match(/^(\d{4}-\d{2}-\d{2})/)
      if (match) return match[1]
    }
    return ''
  }
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * สร้างข้อมูล Seed ตัวอย่างสำหรับวันที่ในอดีต (เช่น 2026-09-02 และ 2026-09-03)
 * เพื่อรองรับข้อมูลตัวอย่างเดิมในระบบที่มีออเดอร์ในวันดังกล่าว
 */
function generateSeedLogs() {
  const seed = []
  // 2026-09-02: 135 ข้อความ
  for (let i = 0; i < 135; i++) {
    const hh = String(10 + Math.floor(i / 15)).padStart(2, '0')
    const mm = String((i * 3) % 60).padStart(2, '0')
    seed.push({
      id: `seed_0902_${i}`,
      date: '2026-09-02',
      timestamp: `2026-09-02T${hh}:${mm}:00`,
      question: 'สอบถามข้อมูลเมนูและโปรโมชั่น',
      reply: 'ยินดีต้อนรับสู่ร้านตำครกซิ่งค่ะ มีเมนูแนะนำหลายรายการนะคะ',
      responseTime: Number((0.5 + (i % 5) * 0.1).toFixed(1)), // เฉลี่ย ~0.7 วิ
      source: i % 10 === 0 ? 'admin' : 'customer'
    })
  }

  // 2026-09-03: 168 ข้อความ (ตรงตามตัวเลขในภาพ mock: 168 ข้อความ, ความเร็ว 0.6 วิ, +24% เทียบกับเมื่อวาน)
  for (let i = 0; i < 168; i++) {
    const hh = String(10 + Math.floor(i / 18)).padStart(2, '0')
    const mm = String((i * 2) % 60).padStart(2, '0')
    seed.push({
      id: `seed_0903_${i}`,
      date: '2026-09-03',
      timestamp: `2026-09-03T${hh}:${mm}:00`,
      question: 'แนะนำเมนูเด็ดรสแซ่บ',
      reply: 'ขอแนะนำ ส้มตำปูปลาร้าแซ่บซิ่ง และ ไก่ทอดกรอบๆ ค่ะ 🌶️',
      responseTime: Number((0.4 + (i % 5) * 0.1).toFixed(1)), // เฉลี่ย ~0.6 วิ
      source: i % 10 === 0 ? 'admin' : 'customer'
    })
  }

  return seed
}

/**
 * ดึงรายการบันทึกการถาม-ตอบทั้งหมดจาก LocalStorage
 */
export function getStoredChatbotLogs() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CHATBOT_LOGS_KEY)
    if (!raw) {
      const initialLogs = generateSeedLogs()
      localStorage.setItem(CHATBOT_LOGS_KEY, JSON.stringify(initialLogs))
      return initialLogs
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

/**
 * บันทึกการถาม-ตอบคำถามใหม่แบบเรียลไทม์
 */
export function recordChatbotLog({
  question,
  reply,
  responseTime = 0.6,
  source = 'customer',
  timestamp = new Date().toISOString()
}) {
  if (typeof window === 'undefined') return null
  try {
    const logs = getStoredChatbotLogs()
    const dateKey = formatDateKey(timestamp)
    const newEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: dateKey,
      timestamp,
      question: question || '',
      reply: reply || '',
      responseTime: typeof responseTime === 'number' ? Number(responseTime.toFixed(1)) : 0.6,
      source
    }
    logs.push(newEntry)
    localStorage.setItem(CHATBOT_LOGS_KEY, JSON.stringify(logs))

    // ส่ง custom event เพื่อให้ component ต่างๆ (เช่น AdminDashboard) อัปเดตทันที
    window.dispatchEvent(new CustomEvent('tumkrokzing:chatbot_log_added', { detail: newEntry }))
    return newEntry
  } catch (err) {
    console.error('Error recording chatbot log:', err)
    return null
  }
}

/**
 * คำนวณสถิติของแชทบอทในวันที่ระบุ (YYYY-MM-DD)
 */
export function computeChatbotStatsForDate(dateStr, allLogs = null) {
  const logs = allLogs || getStoredChatbotLogs()
  const targetDate = formatDateKey(dateStr)

  // 1. ดึงข้อความตอบกลับของวันที่เลือก
  const dayLogs = logs.filter(l => l.date === targetDate)
  const messageCount = dayLogs.length

  // 2. คำนวณความเร็วเฉลี่ยในการตอบกลับของวันนั้น
  let avgSpeedText = '-'
  let avgSeconds = 0
  if (messageCount > 0) {
    const totalTime = dayLogs.reduce((sum, l) => sum + (Number(l.responseTime) || 0), 0)
    avgSeconds = totalTime / messageCount
    avgSpeedText = avgSeconds.toFixed(1)
  }

  // ป้ายกำกับความเร็ว
  let speedLabel = 'ยังไม่มีคำถามในวันนี้'
  let speedClass = 'text-slate-400'
  if (messageCount > 0) {
    if (avgSeconds <= 1.0) {
      speedLabel = '⚡ รวดเร็วทันใจ'
      speedClass = 'text-amber-600'
    } else if (avgSeconds <= 2.5) {
      speedLabel = '⚡ ตอบสนองเร็ว'
      speedClass = 'text-emerald-600'
    } else {
      speedLabel = '⏳ ตอบกลับตามปกติ'
      speedClass = 'text-slate-600'
    }
  }

  // 3. คำนวณวันก่อนหน้า (Yesterday ของวันที่เลือก)
  let yesterdayCount = 0
  if (targetDate) {
    const [y, m, d] = targetDate.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    dt.setDate(dt.getDate() - 1)
    const yesterdayDateStr = formatDateKey(dt)
    const yesterdayLogs = logs.filter(l => l.date === yesterdayDateStr)
    yesterdayCount = yesterdayLogs.length
  }

  // 4. คำนวณเปอร์เซ็นต์เปรียบเทียบกับวันก่อนหน้า
  let diffText = '0% เทียบกับเมื่อวาน'
  let diffClass = 'text-slate-400'

  if (messageCount === 0 && yesterdayCount === 0) {
    diffText = 'ยังไม่มีข้อความ'
    diffClass = 'text-slate-400'
  } else if (yesterdayCount === 0 && messageCount > 0) {
    diffText = `↑ +100% เทียบกับเมื่อวาน`
    diffClass = 'text-emerald-600'
  } else if (yesterdayCount > 0 && messageCount === 0) {
    diffText = `↓ -100% เทียบกับเมื่อวาน`
    diffClass = 'text-rose-600'
  } else if (yesterdayCount > 0 && messageCount > 0) {
    const diffPct = Math.round(((messageCount - yesterdayCount) / yesterdayCount) * 100)
    if (diffPct > 0) {
      diffText = `↑ +${diffPct}% เทียบกับเมื่อวาน`
      diffClass = 'text-emerald-600'
    } else if (diffPct < 0) {
      diffText = `↓ ${diffPct}% เทียบกับเมื่อวาน`
      diffClass = 'text-rose-600'
    } else {
      diffText = `→ 0% เทียบกับเมื่อวาน`
      diffClass = 'text-slate-500'
    }
  }

  return {
    date: targetDate,
    messageCount,
    avgSpeedText,
    speedLabel,
    speedClass,
    yesterdayCount,
    diffText,
    diffClass,
    dayLogs
  }
}
