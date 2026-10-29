<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="font-bold text-sm text-slate-800">ถ่ายรูปหลักฐานการจัดส่ง</h3>
        <button @click="handleClose" class="text-slate-400 hover:text-slate-600 p-1">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- ช่องกล้อง / ตัวอย่างรูปที่ถ่าย -->
      <div class="mt-4 bg-slate-900 rounded-2xl h-56 relative overflow-hidden flex flex-col items-center justify-center text-white border-2 border-slate-800">
        <div v-if="previewUrl" class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url('${previewUrl}')` }">
          <div class="absolute inset-0 bg-black/20 flex items-end p-3 text-white text-xs">
            <div class="bg-black/60 px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
              <div>📍 {{ address || 'จุดส่งลูกค้า' }}</div>
              <div class="text-[10px] text-emerald-300">ถ่ายเมื่อ: {{ takenAt }}</div>
            </div>
          </div>
        </div>

        <div v-else class="text-center p-4">
          <Camera class="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-80" />
          <p class="text-xs text-slate-300 font-medium">วางถุงอาหารร้านตำครกซิ่งไว้ที่จุดส่ง</p>
          <p class="text-[10px] text-slate-500 mt-0.5">ให้เห็นป้ายห้องหรือโต๊ะวางพัสดุชัดเจน</p>
        </div>
      </div>

      <p class="mt-2 text-[10px] text-slate-500 leading-relaxed">
        รูปนี้จะถูกบันทึกในระบบของร้าน และแสดงให้ลูกค้าเห็นในหน้าติดตามออเดอร์และประวัติคำสั่งซื้อ
      </p>

      <p v-if="errorMessage" class="mt-2 text-[11px] text-rose-600 font-medium">{{ errorMessage }}</p>

      <!-- ใช้กล้องหลังของมือถือ (บนคอมพิวเตอร์จะเปิดให้เลือกไฟล์รูป) -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        @change="handleFileChange"
      />

      <div class="mt-4 flex gap-2">
        <button
          v-if="!photoFile"
          @click="openCamera"
          class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
        >
          <Camera class="w-4 h-4" />
          <span>กดถ่ายรูปหลักฐาน</span>
        </button>

        <template v-else>
          <button
            @click="openCamera"
            :disabled="isSubmitting"
            class="py-3 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs disabled:opacity-50"
          >
            ถ่ายใหม่
          </button>
          <button
            @click="confirmDelivery"
            :disabled="isSubmitting"
            class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 disabled:opacity-60"
          >
            <Check class="w-4 h-4" />
            <span>{{ isSubmitting ? 'กำลังอัปโหลดรูป...' : 'ยืนยันส่งมอบสำเร็จ' }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { X, Camera, Check } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    default: ''
  },
  isSubmitting: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'confirm'])

const fileInput = ref(null)
const photoFile = ref(null)
const previewUrl = ref('')
const takenAt = ref('')

const revokePreview = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}

const reset = () => {
  revokePreview()
  photoFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const openCamera = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  revokePreview()
  photoFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  takenAt.value = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

const handleClose = () => {
  reset()
  emit('close')
}

const confirmDelivery = () => {
  if (!photoFile.value) return
  emit('confirm', photoFile.value)
}

// ล้างรูปเมื่อปิดหน้าต่าง (เช่น ส่งมอบสำเร็จแล้ว)
watch(() => props.isOpen, (open) => {
  if (!open) reset()
})

onUnmounted(revokePreview)
</script>
