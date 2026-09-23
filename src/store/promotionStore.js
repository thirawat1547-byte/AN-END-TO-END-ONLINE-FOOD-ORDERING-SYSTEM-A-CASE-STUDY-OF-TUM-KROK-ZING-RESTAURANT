import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { API_BASE } from '../config/api'

export const usePromotionStore = defineStore('promotion', () => {
  const claimedCoupons = ref([])
  const selectedCoupon = ref(null)
  const isLoaded = ref(false)

  // ดึงคูปองที่เลือกค้างไว้จาก sessionStorage
  try {
    const savedSelected = sessionStorage.getItem('selected_checkout_coupon')
    if (savedSelected) {
      selectedCoupon.value = JSON.parse(savedSelected)
    }
  } catch (e) {}

  // โหลดรายการคูปองที่ผู้ใช้เคยกดเก็บไว้
  async function loadClaimedCoupons() {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const res = await axios.get(`${API_BASE}/promotions/my/list`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (Array.isArray(res.data)) {
          claimedCoupons.value = res.data
          isLoaded.value = true
          try {
            localStorage.setItem('my_claimed_coupons', JSON.stringify(res.data))
          } catch (e) {}
          return
        }
      } catch (err) {
        console.warn('โหลดคูปองจากเซิร์ฟเวอร์ไม่สำเร็จ พยายามโหลดจากแคช:', err)
      }
    }

    // แคชสำรองในเครื่อง
    try {
      const cached = localStorage.getItem('my_claimed_coupons')
      if (cached) {
        claimedCoupons.value = JSON.parse(cached)
      }
    } catch (e) {}
    isLoaded.value = true
  }

  // ผู้ใช้กดเก็บคูปอง
  async function claimCoupon(promo) {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        await axios.post(
          `${API_BASE}/promotions/claim/${promo.promo_id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } catch (err) {
        console.warn('บันทึกการเก็บคูปองไปยังเซิร์ฟเวอร์ไม่สำเร็จ:', err)
      }
    }

    // เพิ่มใน Local state และแคช
    const exists = claimedCoupons.value.some(c => c.promo_id === promo.promo_id)
    if (!exists) {
      claimedCoupons.value.push({ ...promo, is_used: false })
      try {
        localStorage.setItem('my_claimed_coupons', JSON.stringify(claimedCoupons.value))
      } catch (e) {}
    }
  }

  // ผู้ใช้เลือกคูปองเพื่อนำไป Auto-fill ในหน้า Checkout
  function selectCouponForCheckout(promo) {
    selectedCoupon.value = promo
    try {
      if (promo) {
        sessionStorage.setItem('selected_checkout_coupon', JSON.stringify(promo))
      } else {
        sessionStorage.removeItem('selected_checkout_coupon')
      }
    } catch (e) {}
  }

  // ยกเลิกคูปองที่เลือก
  function clearSelectedCoupon() {
    selectedCoupon.value = null
    try {
      sessionStorage.removeItem('selected_checkout_coupon')
    } catch (e) {}
  }

  return {
    claimedCoupons,
    selectedCoupon,
    isLoaded,
    loadClaimedCoupons,
    claimCoupon,
    selectCouponForCheckout,
    clearSelectedCoupon
  }
})
