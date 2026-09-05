<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// เมนู/ตัวกรองที่เลือกอยู่
const activeFilter = ref('all')

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

// รายการโต๊ะทั้งหมด
const tables = ref([
  { id: 'T-01', status: 'occupied', seats: 4, capacity: 4, total: 2450 },
  { id: 'T-02', status: 'available', seats: 0, capacity: 2, total: 0 },
  { id: 'T-03', status: 'billing', seats: 2, capacity: 2, total: 890 },
  { id: 'T-04', status: 'occupied', seats: 6, capacity: 8, total: 5120 },
  { id: 'T-05', status: 'available', seats: 0, capacity: 4, total: 0 },
  { id: 'T-06', status: 'available', seats: 0, capacity: 4, total: 0 },
  { id: 'T-07', status: 'occupied', seats: 3, capacity: 4, total: 1250 },
  { id: 'T-08', status: 'billing', seats: 4, capacity: 6, total: 3100 },
])

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

// ฟังก์ชั่นเพิ่มโต๊ะใหม่
const handleAddTable = () => {
  if (!newTable.value.id.trim()) return
  
  tables.value.push({
    id: newTable.value.id.trim(),
    status: 'available',
    seats: 0,
    capacity: Number(newTable.value.capacity) || 4,
    total: 0
  })

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
        <div style="width: 40px; height: 40px; border-radius: 9999px; background-color: #B34B32; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          🌶
        </div>
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

          <!-- ปุ่มเพิ่มโต๊ะใหม่ -->
          <button 
            @click="isAddModalOpen = true"
            style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background-color: white; border: 1px solid #D1D5DB; border-radius: 12px; font-size: 12px; font-weight: 600; color: #1F2937; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: background-color 0.2s;"
          >
            <span style="font-size: 14px; font-weight: bold;">+</span> เพิ่มโต๊ะใหม่
          </button>
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

            <!-- Card Bottom Row (Seats & Total Price) -->
            <div style="display: flex; align-items: flex-end; justify-content: space-between; font-size: 13px;">
              <!-- Seats Info -->
              <div style="display: flex; align-items: center; gap: 6px; color: #6B7280; font-weight: 500;">
                <svg xmlns="http://www.w3.org/2000/svg" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>{{ table.seats }}/{{ table.capacity }} ที่นั่ง</span>
              </div>

              <!-- Total Amount -->
              <div style="font-weight: 700; font-size: 15px;" :style="table.total > 0 ? 'color: #2563EB;' : 'color: #9CA3AF;'">
                ฿{{ table.total.toLocaleString() }}
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
            <label style="font-size: 12px; font-weight: 600; color: #4B5563; display: block; margin-bottom: 4px;">หมายเลข / ชื่อโต๊ะ (เช่น T-09)</label>
            <input 
              v-model="newTable.id" 
              type="text" 
              placeholder="T-09"
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
  </div>
</template>