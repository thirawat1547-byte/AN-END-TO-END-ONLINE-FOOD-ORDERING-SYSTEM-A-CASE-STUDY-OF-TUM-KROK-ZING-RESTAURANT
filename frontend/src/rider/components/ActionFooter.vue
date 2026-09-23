<template>
  <div class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl z-20">
    <div class="flex items-center gap-2">
      <!-- Help / Emergency button -->
      <button 
        @click="$emit('open-help')"
        class="p-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95 shrink-0 flex items-center justify-center"
        title="ศูนย์ช่วยเหลือไรเดอร์"
      >
        <HelpCircle class="w-5 h-5 text-slate-500" />
      </button>

      <!-- Dynamic Primary Action Button -->
      <button 
        @click="handleAction" 
        :disabled="isActionDisabled"
        class="flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition duration-200 active:scale-98"
        :class="actionButtonClass"
      >
        <component :is="actionIcon" class="w-5 h-5" />
        <span>{{ actionButtonText }}</span>
        <ChevronRight class="w-4 h-4 ml-1 opacity-80" />
      </button>
    </div>

    <!-- Sub warning when in store verification step -->
    <div v-if="currentStep === 0 && !allChecked" class="text-center mt-1.5">
      <span class="text-[10px] text-amber-600 font-medium">
        ⚠️ แนะนำติ๊กตรวจอาหารให้ครบ {{ totalCount }} รายการก่อนออกเดินทางไปส่ง
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  HelpCircle, 
  ChevronRight, 
  PackageCheck, 
  Navigation, 
  CheckCircle2 
} from 'lucide-vue-next'

const props = defineProps({
  currentStep: {
    type: Number,
    default: 0
  },
  allChecked: {
    type: Boolean,
    default: false
  },
  checkedCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['next-step', 'open-help', 'show-photo-modal'])

const actionButtonText = computed(() => {
  switch (props.currentStep) {
    case 0:
      return props.allChecked 
        ? 'รับอาหารครบแล้ว • เริ่มนำส่งลูกค้า' 
        : `ตรวจอาหาร (${props.checkedCount}/${props.totalCount}) • เริ่มนำส่ง`
    case 1:
      return 'ฉันถึงจุดส่งลูกค้าแล้ว'
    case 2:
      return 'ส่งมอบอาหารสำเร็จ (แนบรูป)'
    default:
      return 'เสร็จสิ้นงาน'
  }
})

const actionIcon = computed(() => {
  switch (props.currentStep) {
    case 0:
      return PackageCheck
    case 1:
      return Navigation
    case 2:
      return CheckCircle2
    default:
      return CheckCircle2
  }
})

const actionButtonClass = computed(() => {
  switch (props.currentStep) {
    case 0:
      return props.allChecked
        ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/25'
        : 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-amber-500/20'
    case 1:
      return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
    case 2:
      return 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/30 ring-2 ring-emerald-300'
    default:
      return 'bg-slate-700'
  }
})

const isActionDisabled = computed(() => false)

const handleAction = () => {
  if (props.currentStep === 2) {
    emit('show-photo-modal')
  } else {
    emit('next-step')
  }
}
</script>
