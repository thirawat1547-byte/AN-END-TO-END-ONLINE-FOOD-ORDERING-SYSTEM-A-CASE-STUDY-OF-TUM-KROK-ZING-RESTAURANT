<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div class="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Navigation class="w-4 h-4" />
          </div>
          <div>
            <h3 class="font-bold text-xs text-slate-800">ระบบแผนที่นำทางส่งอาหาร (แผนที่จริง)</h3>
            <span class="text-[10px] text-emerald-600 font-medium">● พิกัดดาวเทียมและโครงข่ายถนนกรุงเทพฯ</span>
          </div>
        </div>
        <button @click="handleClose" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Map Type Tabs -->
      <div class="mt-2.5 flex bg-slate-100 p-1 rounded-xl shrink-0 text-xs font-bold">
        <button 
          @click="switchTab('leaflet')"
          class="flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
          :class="activeTab === 'leaflet' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
        >
          <span>🛵 แผนที่ GPS นำทาง</span>
        </button>
        <button 
          @click="switchTab('google')"
          class="flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
          :class="activeTab === 'google' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
        >
          <span>🗺️ Google Maps</span>
        </button>
      </div>

      <!-- Route Context Card -->
      <div class="mt-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-100 p-2.5 rounded-2xl flex items-center justify-between text-xs shrink-0">
        <div class="space-y-0.5">
          <div class="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
            <img :src="logoImg" alt="โลโก้ร้านตำครกซิ่ง" class="w-4 h-4 object-contain rounded-full border border-orange-300 shrink-0 bg-white" />
            <span>จุดรับ: ร้านตำครกซิ่ง (ซ.รามคำแหง 24)</span>
          </div>
          <div class="flex items-center gap-1.5 text-[11px] font-bold text-blue-700">
            <span class="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
            <span class="truncate max-w-[210px]">จุดส่ง: {{ mapData?.targetName || 'คอนโด The Grand Rama 9' }}</span>
          </div>
        </div>
        <div class="text-right pl-2 border-l border-emerald-200 shrink-0">
          <span class="font-black text-emerald-700 text-sm block">{{ mapData?.distance || '3.2 กม.' }}</span>
          <span class="text-[10px] text-slate-500">~{{ mapData?.eta || '12 นาที' }}</span>
        </div>
      </div>

      <!-- Turn-by-Turn HUD Banner (Leaflet Mode) -->
      <div v-if="activeTab === 'leaflet'" class="mt-2 bg-slate-900 text-white px-3 py-2 rounded-xl flex items-center justify-between shadow-md shrink-0">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
            {{ currentTurnIcon }}
          </div>
          <div>
            <div class="text-[10px] text-emerald-400 font-bold leading-tight">{{ currentTurnDistance }}</div>
            <div class="text-[11px] font-semibold text-slate-100 truncate max-w-[200px]">{{ currentTurnText }}</div>
          </div>
        </div>
        <button 
          @click="toggleSimulation" 
          class="text-[10px] font-bold px-2 py-1 rounded-lg transition active:scale-95 flex items-center gap-1 shrink-0"
          :class="isSimulating ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-emerald-600 text-white hover:bg-emerald-500'"
        >
          <span>{{ isSimulating ? '⏸️ หยุด' : '▶️ จำลองขับ' }}</span>
        </button>
      </div>

      <!-- Map Display Area -->
      <div class="mt-2 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner" style="height: 290px; min-height: 290px;">
        
        <!-- Leaflet Map Container -->
        <div 
          v-show="activeTab === 'leaflet'" 
          ref="mapContainer" 
          style="width: 100%; height: 290px; min-height: 290px; position: relative; z-index: 1;"
        ></div>

        <!-- Google Maps Embed Container -->
        <div v-if="activeTab === 'google'" class="w-full h-full relative" style="height: 290px;">
          <iframe 
            :src="googleEmbedUrl" 
            class="w-full h-full border-0 rounded-2xl" 
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          <div class="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] text-slate-700 px-2 py-1 rounded-lg shadow border border-slate-200">
            📍 แผนที่จริง Google Maps ({{ customerCoord[0].toFixed(4) }}, {{ customerCoord[1].toFixed(4) }})
          </div>
        </div>

        <!-- Floating Quick Control (Leaflet Mode) -->
        <div v-if="activeTab === 'leaflet'" class="absolute bottom-2.5 right-2.5 z-[500] flex flex-col gap-1.5">
          <button 
            @click="fitBounds" 
            class="bg-white/95 backdrop-blur-sm text-slate-700 p-2 rounded-xl shadow-lg border border-slate-200 hover:bg-white active:scale-95 text-xs font-bold flex items-center gap-1"
            title="จัดมุมมองรวมทั้งเส้นทาง"
          >
            <LocateFixed class="w-4 h-4 text-emerald-600" />
            <span class="text-[10px]">รวมเส้นทาง</span>
          </button>
        </div>

        <!-- Simulation Progress HUD (Leaflet Mode) -->
        <div v-if="activeTab === 'leaflet' && isSimulating" class="absolute top-2 left-2 z-[500] bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1.5 border border-white/10">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>ความคืบหน้า: {{ Math.round(progressPercent) }}%</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-3 flex gap-2 shrink-0">
        <a 
          :href="googleMapsExternalUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex-1 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
        >
          <ExternalLink class="w-3.5 h-3.5 text-blue-600" />
          <span>เปิดแอป Google Maps</span>
        </a>
        <button 
          @click="handleClose"
          class="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
        >
          กลับหน้าออเดอร์
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { X, Navigation, LocateFixed, ExternalLink } from 'lucide-vue-next'
import L from 'leaflet'
import logoImg from '../../assets/logo.png'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  mapData: {
    type: Object,
    default: () => ({
      targetName: 'คอนโด The Grand Rama 9 (จุดส่งลูกค้า)',
      customerCoord: [13.7570, 100.5695],
      distance: '3.2 กม.',
      eta: '12 นาที'
    })
  }
})

const emit = defineEmits(['close'])

const activeTab = ref('leaflet') // 'leaflet' | 'google'
const mapContainer = ref(null)
let map = null
let riderMarker = null
let routePolyline = null
let animInterval = null

const isSimulating = ref(false)
const simIndex = ref(0)
const progressPercent = ref(0)

// Real Bangkok Coordinates
// Store: ร้านตำครกซิ่ง ซ.รามคำแหง 24 แยก 14
const storeCoord = [13.7508, 100.6190]

// Customer: Reactive coordinate from mapData or default
const customerCoord = computed(() => {
  if (props.mapData?.customerCoord && Array.isArray(props.mapData.customerCoord) && props.mapData.customerCoord.length === 2) {
    const lat = Number(props.mapData.customerCoord[0])
    const lng = Number(props.mapData.customerCoord[1])
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng]
    }
  }
  return [13.7570, 100.5695]
})

// Real coordinates corridor connecting Ramkhamhaeng 24 to Rama 9 (Default route)
const defaultRouteCoordinates = [
  [13.7508, 100.6190], // ร้านตำครกซิ่ง ซอยรามคำแหง 24 แยก 14
  [13.7516, 100.6170], // ปากซอย 24 แยก 14
  [13.7528, 100.6145], // ถนนรามคำแหง 24 มุ่งหน้าแยกรามคำแหง
  [13.7540, 100.6080], // แยกรามคำแหง เลี้ยวเข้าสู่ถนนพระราม 9
  [13.7548, 100.6010], // ถนนพระราม 9 ขาเข้า
  [13.7555, 100.5920], // ถนนพระราม 9 ผ่านแยกประดิษฐ์มนูธรรม
  [13.7562, 100.5830], // หน้าตึก KPN ถนนพระราม 9
  [13.7566, 100.5750], // แยกพระราม 9 - รัชดา
  [13.7570, 100.5695]  // คอนโด The Grand Rama 9 (จุดส่ง)
]

const routeCoordinates = computed(() => {
  const cust = customerCoord.value
  const isDefault = Math.abs(cust[0] - 13.7570) < 0.0005 && Math.abs(cust[1] - 100.5695) < 0.0005
  if (isDefault) {
    return defaultRouteCoordinates
  }
  // Generate smooth 8-point interpolated path from store to custom GPS coordinate
  const start = storeCoord
  const end = cust
  const steps = 7
  const points = []
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps
    points.push([
      Number((start[0] + (end[0] - start[0]) * ratio).toFixed(6)),
      Number((start[1] + (end[1] - start[1]) * ratio).toFixed(6))
    ])
  }
  return points
})

const currentTurnDistance = computed(() => {
  const coords = routeCoordinates.value
  if (simIndex.value >= coords.length - 2) return 'อีก 50 เมตร'
  if (simIndex.value > 3) return 'อีก 400 เมตร'
  return 'อีก 150 เมตร'
})

const currentTurnText = computed(() => {
  const coords = routeCoordinates.value
  const targetLabel = props.mapData?.targetName || 'จุดส่งลูกค้า'
  if (simIndex.value >= coords.length - 1) return `ถึง${targetLabel}แล้ว`
  if (simIndex.value > 4) return 'มุ่งหน้าสู่ปลายทางตามเส้นทาง'
  if (simIndex.value > 2) return 'เลี้ยวขวาเข้าสู่ถนนหลัก'
  return 'ออกจาก ซอยรามคำแหง 24 แยก 14'
})

const currentTurnIcon = computed(() => {
  const coords = routeCoordinates.value
  if (simIndex.value >= coords.length - 1) return '📍'
  if (simIndex.value > 4) return '⬆️'
  if (simIndex.value > 2) return '↗️'
  return '➡️'
})

// Google Maps links
const googleEmbedUrl = computed(() => {
  const [lat, lng] = customerCoord.value
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=th&z=15&output=embed`
})

const googleMapsExternalUrl = computed(() => {
  const [lat, lng] = customerCoord.value
  return `https://www.google.com/maps/dir/?api=1&origin=${storeCoord[0]},${storeCoord[1]}&destination=${lat},${lng}&travelmode=two_wheeler`
})

const createCustomIcon = (emoji, bgColor) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="width: 32px; height: 32px; border-radius: 12px; background: ${bgColor}; color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 2px solid white;">
        ${emoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  })
}

const destroyMap = () => {
  stopSimulation()
  if (map) {
    try {
      map.off()
      map.remove()
    } catch (e) {
      console.warn('Map cleanup error:', e)
    }
    map = null
    riderMarker = null
    routePolyline = null
  }
}

const initMap = () => {
  if (!mapContainer.value) return

  // Always destroy previous instance before reinitializing
  destroyMap()

  try {
    const coords = routeCoordinates.value
    const centerLat = (storeCoord[0] + customerCoord.value[0]) / 2
    const centerLng = (storeCoord[1] + customerCoord.value[1]) / 2

    map = L.map(mapContainer.value, {
      zoomControl: true,
      attributionControl: false
    }).setView([centerLat, centerLng], 13)

    // Using CartoDB Voyager tiles (high reliability, zero localhost rate-limiting)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map)

    // Background Glow Polyline
    L.polyline(coords, {
      color: '#10B981',
      weight: 9,
      opacity: 0.3,
      lineJoin: 'round'
    }).addTo(map)

    // Main Emerald Route Line
    routePolyline = L.polyline(coords, {
      color: '#059669',
      weight: 5,
      opacity: 0.9,
      lineJoin: 'round'
    }).addTo(map)

    // Store Pin (ร้านตำครกซิ่ง with real logo)
    const storeIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="width: 36px; height: 36px; border-radius: 50%; background: white; border: 2.5px solid #ea580c; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); overflow: hidden; padding: 2px;">
          <img src="${logoImg}" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    })
    L.marker(storeCoord, { icon: storeIcon })
      .bindPopup('<b>ร้านตำครกซิ่ง</b><br><span style="font-size:11px;">จุดรับอาหาร (ซ.รามคำแหง 24)</span>')
      .addTo(map)

    // Customer Pin
    const customerIcon = createCustomIcon('📍', '#2563eb')
    const customerLabel = props.mapData?.targetName || 'จุดส่งลูกค้า'
    L.marker(customerCoord.value, { icon: customerIcon })
      .bindPopup(`<b>${customerLabel}</b><br><span style="font-size:11px;">พิกัด: ${customerCoord.value[0].toFixed(5)}, ${customerCoord.value[1].toFixed(5)}</span>`)
      .addTo(map)

    // Rider Moving Pin
    const riderIcon = createCustomIcon('🛵', '#059669')
    const currentLoc = coords[simIndex.value] || coords[0]
    riderMarker = L.marker(currentLoc, { icon: riderIcon })
      .bindPopup('<b>พนักงานส่งของร้าน</b><br><span style="font-size:11px;">กำลังนำส่งอาหาร</span>')
      .addTo(map)

    // Fit bounds safely
    map.fitBounds(routePolyline.getBounds(), { padding: [30, 30] })
  } catch (err) {
    console.error('Failed to initialize map:', err)
  }
}

const fitBounds = () => {
  if (map && routePolyline) {
    try {
      map.invalidateSize()
      map.fitBounds(routePolyline.getBounds(), { padding: [30, 30] })
    } catch (e) {}
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'leaflet') {
    nextTick(() => {
      setTimeout(() => {
        if (!map) {
          initMap()
        } else {
          map.invalidateSize()
          fitBounds()
        }
      }, 150)
    })
  }
}

const toggleSimulation = () => {
  if (isSimulating.value) {
    stopSimulation()
  } else {
    startSimulation()
  }
}

const startSimulation = () => {
  const coords = routeCoordinates.value
  if (simIndex.value >= coords.length - 1) {
    simIndex.value = 0
  }
  isSimulating.value = true
  animInterval = setInterval(() => {
    const currentCoords = routeCoordinates.value
    if (simIndex.value < currentCoords.length - 1) {
      simIndex.value++
      const coord = currentCoords[simIndex.value]
      if (riderMarker) {
        riderMarker.setLatLng(coord)
      }
      if (map) {
        map.panTo(coord, { animate: true, duration: 0.5 })
      }
      progressPercent.value = (simIndex.value / (currentCoords.length - 1)) * 100
    } else {
      stopSimulation()
    }
  }, 1400)
}

const stopSimulation = () => {
  isSimulating.value = false
  if (animInterval) {
    clearInterval(animInterval)
    animInterval = null
  }
}

const handleClose = () => {
  destroyMap()
  emit('close')
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setTimeout(() => {
        if (activeTab.value === 'leaflet') {
          initMap()
          setTimeout(() => {
            if (map) {
              map.invalidateSize()
              fitBounds()
            }
          }, 200)
        }
      }, 100)
    })
  } else {
    destroyMap()
  }
})

onUnmounted(() => {
  destroyMap()
})
</script>

<style>
.custom-map-pin {
  background: transparent;
  border: none;
}
.leaflet-container {
  font-family: inherit;
  width: 100% !important;
  height: 100% !important;
}
</style>


