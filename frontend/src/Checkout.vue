<template>
  <div class="checkout-container">
    <!-- Header มาตรฐานเดียวกันทุกหน้า -->
    <CustomerNavbar />

    <!-- 🛑 ป้ายแจ้งเตือนเมื่อร้านปิด -->
    <div v-if="!isStoreOpen" class="checkout-closed-banner">
      <div class="closed-banner-content">
        <span class="closed-icon">🛑</span>
        <div class="closed-texts">
          <strong class="closed-title">ขณะนี้ร้านปิดให้บริการชั่วคราว</strong>
          <span class="closed-sub">ระบบงดรับคำสั่งซื้อทุกช่องทางในขณะนี้ (เวลาทำการปกติ 10:30 - 22:00 น.) ขออภัยในความไม่สะดวกครับ</span>
        </div>
        <span class="closed-badge">งดรับออเดอร์</span>
      </div>
    </div>

    <div class="checkout-main">
      <div class="left-section">
        
        <div class="card-section">
          <h3 class="section-title">ที่อยู่จัดส่ง</h3>
          <div class="address-box">
            <div class="map-placeholder map-active">
              <iframe 
                width="100%" 
                height="100%" 
                frameborder="0" 
                style="border:0; border-radius: 12px;"
                :src="mapUrl" 
                allowfullscreen>
              </iframe>
            </div>
            <div class="address-details">
              <h4 class="location-name">
                {{ userProfile.name }} 
                <span class="phone-text">({{ userProfile.phone }})</span>
              </h4>
              
              <!-- โหมดปกติ: แสดงที่อยู่, พิกัด GPS และปุ่มแก้ไข/ปักหมุด -->
              <div v-if="!isEditingAddress">
                <p class="address-text">{{ userProfile.address }}</p>

                <!-- ป้ายแสดงพิกัด GPS จริงที่ปักหมุดไว้ -->
                <div class="gps-pinned-badge" v-if="deliveryLat && deliveryLng">
                  <span class="gps-badge-icon">📍</span>
                  <div class="gps-badge-info">
                    <span class="gps-badge-title">พิกัด GPS ปักหมุด:</span>
                    <span class="gps-badge-coords">{{ Number(deliveryLat).toFixed(5) }}, {{ Number(deliveryLng).toFixed(5) }}</span>
                  </div>
                  <span class="gps-badge-tag">พิกัดจริง</span>
                </div>

                <div v-if="gpsNotice" class="gps-notice-banner">
                  {{ gpsNotice }}
                </div>

                <p class="address-note">หมายเหตุ: ไรเดอร์จะนำทางตามพิกัด GPS นี้เพื่อความแม่นยำสูงสุด</p>

                <div class="address-action-row">
                  <button 
                    type="button"
                    class="gps-pin-btn" 
                    :disabled="isGettingGps"
                    @click="pinCurrentGpsLocation"
                  >
                    <span v-if="isGettingGps">⏳ กำลังระบุพิกัด...</span>
                    <span v-else>📍 ปักหมุดพิกัด GPS ปัจจุบัน</span>
                  </button>
                  <button class="edit-address-btn" @click="startEditAddress">✏️ แก้ไขที่อยู่ / พิกัด</button>
                </div>
              </div>

              <!-- โหมดแก้ไข: แสดงกล่องพิมพ์และปุ่มบันทึก -->
              <div v-else class="edit-address-form">
                <label class="edit-field-label">รายละเอียดสถานที่ / บ้านเลขที่:</label>
                <textarea 
                  v-model="editAddressText" 
                  @input="onAddressInput"
                  class="edit-textarea" 
                  rows="2" 
                  placeholder="กรอกที่อยู่จัดส่งใหม่..."
                ></textarea>

                <!-- ป้ายแสดงสถานะการแปลงที่อยู่เป็นพิกัดแผนที่ -->
                <div v-if="isGeocoding" class="geocoding-status-banner loading">
                  <span class="spin-icon">⏳</span> กำลังค้นหาตำแหน่งบนแผนที่จากที่อยู่ที่กรอก...
                </div>
                <div v-else-if="geocodeFoundAddress" class="geocoding-status-banner success">
                  <span class="check-icon">📍</span> ปักหมุดแผนที่ตรงกับ: <strong>{{ geocodeFoundAddress }}</strong>
                </div>

                <div class="gps-latlng-row">
                  <div class="gps-field-col">
                    <label class="edit-field-label">ละติจูด (Latitude):</label>
                    <input 
                      type="number" 
                      step="any" 
                      v-model="editDeliveryLat" 
                      placeholder="13.7570" 
                      class="gps-coord-input"
                    />
                  </div>
                  <div class="gps-field-col">
                    <label class="edit-field-label">ลองจิจูด (Longitude):</label>
                    <input 
                      type="number" 
                      step="any" 
                      v-model="editDeliveryLng" 
                      placeholder="100.5695" 
                      class="gps-coord-input"
                    />
                  </div>
                </div>

                <button 
                  type="button" 
                  class="gps-detect-btn" 
                  :disabled="isGettingGps"
                  @click="detectLocationForEdit"
                >
                  <span>📍 ดึงพิกัดจากตำแหน่งปัจจุบัน (GPS)</span>
                </button>

                <div class="edit-actions">
                  <button class="cancel-edit-btn" @click="cancelEditAddress">ยกเลิก</button>
                  <button class="save-edit-btn" @click="saveAddress" :disabled="isGeocoding">
                    <span v-if="isGeocoding">กำลังระบุตำแหน่ง...</span>
                    <span v-else>บันทึกที่อยู่และพิกัด</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="card-section">
          <h3 class="section-title">เวลาจัดส่ง</h3>
          <div class="delivery-time-box">
            <div class="time-type">มาตรฐาน</div>
            <div class="time-range">25-35 นาที</div>
          </div>
        </div>

        <div class="card-section">
          <div class="payment-section-header">
            <h3 class="section-title">วิธีชำระเงิน</h3>
            <span class="payment-security-badge">
              <span class="shield-icon">🔒</span> ชำระเงินปลอดภัย 256-bit SSL
            </span>
          </div>

          <!-- ตัวเลือกประเภทการชำระเงินหลัก 3 แบบ -->
          <div class="payment-methods-grid">
            <!-- 1. บัตรเครดิต / เดบิต -->
            <div 
              class="payment-card" 
              :class="{ active: selectedPayment === 'card' }" 
              @click="selectedPayment = 'card'"
            >
              <div class="pay-icon">💳</div>
              <span class="pay-title">บัตรเครดิต/เดบิต</span>
              <span class="pay-sub">Visa, Mastercard, JCB, AMEX</span>
            </div>

            <!-- 2. พร้อมเพย์ -->
            <div 
              class="payment-card" 
              :class="{ active: selectedPayment === 'qr' }" 
              @click="selectedPayment = 'qr'"
            >
              <div class="pay-icon">📱</div>
              <span class="pay-title">พร้อมเพย์</span>
              <span class="pay-sub">สแกน QR Code</span>
            </div>

            <!-- 3. เงินสด -->
            <div 
              class="payment-card" 
              :class="{ active: selectedPayment === 'cash' }" 
              @click="selectedPayment = 'cash'"
            >
              <div class="pay-icon">💵</div>
              <span class="pay-title">เงินสด</span>
              <span class="pay-sub">จ่ายปลายทาง</span>
            </div>
          </div>

          <!-- ฟอร์มกรอกข้อมูลบัตรเครดิต / เดบิต -->
          <div v-if="selectedPayment === 'card'" class="card-checkout-container">
            <div class="card-container-header">
              <div class="card-header-left">
                <span class="card-section-label">ข้อมูลบัตร (Card Information)</span>
                <span class="card-instruction">กรุณาเลือกประเภทบัตรและกรอกข้อมูลให้ถูกต้อง</span>
              </div>
            </div>

            <!-- ส่วนเลือกประเภทบัตรด้วยตนเอง (Manual Card Type Selector) -->
            <div class="card-brand-selection-area">
              <label class="brand-selection-label">เลือกประเภทบัตร (Select Card Type):</label>
              <div class="card-brand-chips">
                <!-- 1. VISA -->
                <button 
                  type="button" 
                  class="brand-chip-btn" 
                  :class="{ active: selectedCardBrand === 'visa' }"
                  @click="selectCardBrand('visa')"
                  title="ชำระด้วยบัตร VISA"
                >
                  <span class="card-logo-container">
                    <svg class="card-brand-svg" viewBox="0 0 36 24" width="28" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="36" height="24" rx="3" fill="#0E4595"/>
                      <path d="M14.6 16.5L16.2 7H18.2L16.6 16.5H14.6ZM24.4 7.2C24 7 23.3 6.8 22.5 6.8C20.3 6.8 18.7 8 18.7 9.7C18.7 10.9 19.8 11.6 20.7 12.1C21.6 12.5 21.9 12.8 21.9 13.3C21.9 14 21.1 14.3 20.3 14.3C19.3 14.3 18.7 14.1 18 13.8L17.6 15.8C18.2 16.1 19.3 16.3 20.4 16.3C22.8 16.3 24.3 15.1 24.3 13.3C24.3 12.2 23.6 11.3 22.3 10.7C21.5 10.3 21 10 21 9.5C21 9 21.5 8.6 22.5 8.6C23.2 8.6 23.8 8.8 24.3 9L24.4 7.2ZM28.7 7H27.1C26.5 7 26.1 7.2 25.8 7.8L22.1 16.5H24.3L24.8 15.2H27.5L27.8 16.5H29.8L28.7 7ZM25.4 13.6L26.5 10.4L27.1 13.6H25.4ZM12.6 7L10.5 13.5L10.2 12.1C9.8 10.8 8.4 9.2 6.9 8.3L8.8 16.5H11.1L14.7 7H12.6Z" fill="white"/>
                      <path d="M8.8 8.3C7.3 8.9 5.9 9.9 4.9 10.8L5.1 11.7C6.1 11.4 8.1 10.8 9.5 10.4L8.8 8.3Z" fill="#F7B600"/>
                    </svg>
                  </span>
                  <span class="chip-brand-title">VISA</span>
                  <span class="chip-check" v-if="selectedCardBrand === 'visa'">✓</span>
                </button>

                <!-- 2. Mastercard -->
                <button 
                  type="button" 
                  class="brand-chip-btn" 
                  :class="{ active: selectedCardBrand === 'mastercard' }"
                  @click="selectCardBrand('mastercard')"
                  title="ชำระด้วยบัตร Mastercard"
                >
                  <span class="card-logo-container">
                    <svg class="card-brand-svg" viewBox="0 0 36 24" width="28" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="36" height="24" rx="3" fill="#222222"/>
                      <circle cx="13.5" cy="12" r="6.5" fill="#EB001B"/>
                      <circle cx="22.5" cy="12" r="6.5" fill="#F79E1B"/>
                      <path d="M18 7.3A6.47 6.47 0 0 0 14.5 12c0 1.8.7 3.5 1.9 4.7A6.47 6.47 0 0 0 21.5 12c0-1.8-.7-3.5-1.9-4.7A6.46 6.46 0 0 0 18 7.3z" fill="#FF5F00"/>
                    </svg>
                  </span>
                  <span class="chip-brand-title">Mastercard</span>
                  <span class="chip-check" v-if="selectedCardBrand === 'mastercard'">✓</span>
                </button>

                <!-- 3. JCB -->
                <button 
                  type="button" 
                  class="brand-chip-btn" 
                  :class="{ active: selectedCardBrand === 'jcb' }"
                  @click="selectCardBrand('jcb')"
                  title="ชำระด้วยบัตร JCB"
                >
                  <span class="card-logo-container">
                    <svg class="card-brand-svg" viewBox="0 0 36 24" width="28" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="36" height="24" rx="3" fill="#FFFFFF"/>
                      <rect x="0.5" y="0.5" width="35" height="23" rx="2.5" stroke="#CBD5E1" stroke-width="1"/>
                      <rect x="4.5" y="4" width="8" height="16" rx="3" fill="#0066B2"/>
                      <path d="M9.5 6v7.2a2.3 2.3 0 0 1-2.3 2.3H6v-1.6h1a.7.7 0 0 0 .7-.7V6h1.8z" fill="#FFFFFF"/>
                      <rect x="14" y="4" width="8" height="16" rx="3" fill="#E60012"/>
                      <path d="M19.8 9.5a2.2 2.2 0 0 0-1.5-.5c-1.1 0-2 .8-2 2.4 0 1.5.9 2.4 2 2.4.6 0 1.1-.2 1.5-.5v1.6c-.5.3-1.1.5-1.8.5-2.1 0-3.6-1.6-3.6-4s1.5-4 3.6-4c.7 0 1.3.2 1.8.5V9.5z" fill="#FFFFFF"/>
                      <rect x="23.5" y="4" width="8" height="16" rx="3" fill="#008837"/>
                      <path d="M25.5 6.5h2c1 0 1.7.4 1.7 1.3 0 .5-.3.9-.8 1.1.6.2 1 .7 1 1.3 0 .9-.7 1.5-1.8 1.5h-2.1V6.5zm1.5 2h.4c.3 0 .5-.2.5-.4s-.2-.4-.5-.4h-.4v.8zm0 2.2h.5c.3 0 .6-.2.6-.5s-.3-.5-.6-.5h-.5v1z" fill="#FFFFFF"/>
                    </svg>
                  </span>
                  <span class="chip-brand-title">JCB</span>
                  <span class="chip-check" v-if="selectedCardBrand === 'jcb'">✓</span>
                </button>

                <!-- 4. AMEX -->
                <button 
                  type="button" 
                  class="brand-chip-btn" 
                  :class="{ active: selectedCardBrand === 'amex' }"
                  @click="selectCardBrand('amex')"
                  title="ชำระด้วยบัตร American Express"
                >
                  <span class="card-logo-container">
                    <svg class="card-brand-svg" viewBox="0 0 36 24" width="28" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="36" height="24" rx="3" fill="#006FCF"/>
                      <path d="M5.5 15.5l3-7h2.2l3 7h-1.9l-.6-1.5H7.9l-.6 1.5H5.5zm3-3h2.1L9.6 10l-1.1 2.5z" fill="#FFFFFF"/>
                      <text x="17.5" y="14.8" fill="#FFFFFF" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="8" letter-spacing="-0.3">AMEX</text>
                    </svg>
                  </span>
                  <span class="chip-brand-title">AMEX</span>
                  <span class="chip-check" v-if="selectedCardBrand === 'amex'">✓</span>
                </button>

                <!-- 5. UnionPay -->
                <button 
                  type="button" 
                  class="brand-chip-btn" 
                  :class="{ active: selectedCardBrand === 'unionpay' }"
                  @click="selectCardBrand('unionpay')"
                  title="ชำระด้วยบัตร UnionPay"
                >
                  <span class="card-logo-container">
                    <svg class="card-brand-svg" viewBox="0 0 36 24" width="28" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="36" height="24" rx="3" fill="#FFFFFF"/>
                      <rect x="0.5" y="0.5" width="35" height="23" rx="2.5" stroke="#CBD5E1" stroke-width="1"/>
                      <g transform="skewX(-10) translate(3.5, 0)">
                        <rect x="5.5" y="4.5" width="7" height="15" rx="2" fill="#E21B23"/>
                        <rect x="13" y="4.5" width="7" height="15" rx="2" fill="#00457C"/>
                        <rect x="20.5" y="4.5" width="7" height="15" rx="2" fill="#007B5F"/>
                      </g>
                      <text x="17.5" y="14.2" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-weight="bold" font-size="6" letter-spacing="-0.2">银联</text>
                    </svg>
                  </span>
                  <span class="chip-brand-title">UnionPay</span>
                  <span class="chip-check" v-if="selectedCardBrand === 'unionpay'">✓</span>
                </button>
              </div>
            </div>

            <div class="card-input-box">
              <!-- หมายเลขบัตร -->
              <div class="card-field-group">
                <label>หมายเลขบัตร (Card number)</label>
                <div class="card-number-wrapper">
                  <input 
                    type="text" 
                    v-model="cardForm.number" 
                    @input="onCardNumberInput"
                    placeholder="•••• •••• •••• ••••" 
                    maxlength="19"
                    class="card-styled-input font-mono"
                  >
                  <span class="detected-badge" v-if="selectedCardBrand">{{ selectedCardBrand.toUpperCase() }}</span>
                </div>
              </div>

              <!-- วันหมดอายุ และ CVC -->
              <div class="card-row-split">
                <div class="card-field-group">
                  <label>วันหมดอายุ (MM / YY)</label>
                  <input 
                    type="text" 
                    v-model="cardForm.expiry" 
                    @input="onCardExpiryInput"
                    placeholder="MM / YY (เช่น 12/28)" 
                    maxlength="5"
                    class="card-styled-input font-mono"
                  >
                </div>
                <div class="card-field-group">
                  <label>รหัสความปลอดภัย CVC / CVV</label>
                  <div class="cvc-wrapper">
                    <input 
                      type="password" 
                      v-model="cardForm.cvc" 
                      placeholder="123" 
                      maxlength="4"
                      class="card-styled-input font-mono"
                    >
                    <span class="cvc-hint" title="รหัส 3-4 หลักด้านหลังบัตร">🔒</span>
                  </div>
                </div>
              </div>

              <!-- ชื่อบนบัตร -->
              <div class="card-field-group">
                <label>ชื่อผู้ถือบัตร (Cardholder name)</label>
                <input 
                  type="text" 
                  v-model="cardForm.name" 
                  placeholder="ระบุชื่อภาษาอังกฤษตามหน้าบัตร" 
                  class="card-styled-input"
                >
              </div>

              <!-- Billing Address (Country / ZIP) -->
              <div class="card-row-split">
                <div class="card-field-group">
                  <label>ประเทศ / ภูมิภาค (Country or region)</label>
                  <select v-model="cardForm.country" class="card-styled-input">
                    <option value="TH">ไทย (Thailand)</option>
                    <option value="US">United States</option>
                    <option value="JP">Japan</option>
                    <option value="SG">Singapore</option>
                    <option value="MY">Malaysia</option>
                    <option value="CN">China</option>
                  </select>
                </div>
                <div class="card-field-group">
                  <label>รหัสไปรษณีย์ (ZIP / Postal code)</label>
                  <input 
                    type="text" 
                    v-model="cardForm.zip" 
                    placeholder="เช่น 10220" 
                    maxlength="10"
                    class="card-styled-input font-mono"
                  >
                </div>
              </div>

              <!-- Checkbox บันทึกบัตร -->
              <label class="save-card-checkbox">
                <input type="checkbox" v-model="cardForm.saveCard">
                <span>บันทึกบัตรนี้สำหรับการสั่งอาหารครั้งต่อไป (Save this card)</span>
              </label>
            </div>
          </div>


        </div>

      </div>

      <aside class="right-section">
        <div class="summary-card">
          <h3 class="summary-title">สรุปคำสั่งซื้อ</h3>

          <div class="order-items-list">
            <div class="order-item" v-for="(item, index) in cartItems" :key="index">
              <div class="item-badge">{{ item.qty }}</div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-sub">
                  <span v-if="item.dishType">🍽️ {{ item.dishType }}</span>
                  <span v-if="item.spiceLevel">🌶️ {{ item.spiceLevel }}</span>
                  <span v-for="addon in item.addons" :key="addon.name"> +{{ addon.name }}</span>
                </div>
                <!-- ⚡ แสดงพลังงานแคลอรี่ต่อรายการ -->
                <div class="item-cal-tag">
                  <span class="fire-icon">🔥</span>
                  <span>{{ getItemCalories(item) }} kcal</span>
                  <span v-if="item.qty > 1" class="item-cal-multiplier"> (รวม {{ getItemCalories(item) * item.qty }} kcal)</span>
                </div>
              </div>
              <div class="item-price">B{{ item.price * item.qty }}</div>
            </div>

            <div v-if="cartItems.length === 0" style="text-align: center; color: #888; font-size: 13px;">
              ไม่มีรายการอาหารในตะกร้า
            </div>
          </div>

          <!-- ส่วนโปรโมชันและคูปองส่วนลด (เฉพาะสั่งออนไลน์) -->
          <div class="promo-section">
            <div class="promo-header">
              <span class="promo-title">🎟️ โค้ดส่วนลด (เฉพาะสั่งออนไลน์)</span>
              <router-link to="/promotions" class="promo-view-all">ดูโปรทั้งหมด ➔</router-link>
            </div>

            <!-- กล่องกรอกโค้ดส่วนลด -->
            <div class="promo-input-group">
              <input 
                type="text" 
                v-model="inputPromoCode" 
                placeholder="กรอกโค้ด เช่น ZING50" 
                class="promo-input"
                :disabled="!!appliedPromo"
                @keyup.enter="applyCustomPromoCode"
              />
              <button 
                v-if="!appliedPromo" 
                class="promo-apply-btn" 
                @click="applyCustomPromoCode"
                :disabled="isValidatingPromo || !inputPromoCode.trim()"
              >
                {{ isValidatingPromo ? 'ตรวจ...' : 'ใช้โค้ด' }}
              </button>
              <button 
                v-else 
                class="promo-remove-btn" 
                @click="removeCoupon"
                title="ยกเลิกการใช้โค้ดนี้"
              >
                ✕ ยกเลิก
              </button>
            </div>

            <!-- ข้อความแจ้งเตือนข้อผิดพลาดหรือสำเร็จ -->
            <div v-if="promoError" class="promo-alert error">
              ⚠️ {{ promoError }}
            </div>
            <div v-if="promoSuccess" class="promo-alert success">
              ✓ {{ promoSuccess }}
            </div>

            <!-- คูปองที่เก็บไว้ในบัญชีของผู้ใช้ -->
            <div v-if="myClaimedCoupons.length > 0" class="my-coupons-box">
              <div class="my-coupons-header-row">
                <div class="my-coupons-title">🎟️ คูปองที่คุณกดเก็บไว้ ({{ myAvailableCoupons.length }} ใบ):</div>
                <button 
                  type="button" 
                  class="open-picker-pill-btn" 
                  @click="showCouponPickerModal = true"
                >
                  เลือกคูปอง ➔
                </button>
              </div>
              <div class="coupon-chips-list">
                <div 
                  v-for="coupon in myAvailableCoupons" 
                  :key="coupon.promo_id" 
                  class="coupon-chip"
                  :class="{ 
                    'chip-selected': appliedPromo && appliedPromo.promo_id === coupon.promo_id,
                    'chip-disabled': subtotal < (coupon.min_order_price || 0)
                  }"
                  @click="selectCoupon(coupon)"
                >
                  <div class="chip-main">
                    <span class="chip-code">{{ coupon.code }}</span>
                    <span class="chip-desc">
                      {{ coupon.discount_type === 'PERCENTAGE' ? `ลด ${coupon.discount_value}%` : `ลด B${coupon.discount_value}` }}
                    </span>
                  </div>
                  <div class="chip-sub">
                    ขั้นต่ำ B{{ coupon.min_order_price || 0 }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="!isLoggedIn" class="promo-login-hint">
              <span>💡 <router-link to="/login">เข้าสู่ระบบ</router-link> เพื่อใช้คูปองที่คุณกดเก็บไว้</span>
            </div>
          </div>

          <!-- 🥗 ส่วนแสดงผลพลังงานรวมทั้งมื้อ (Total Calories) -->
          <div class="calories-summary-box" v-if="cartItems.length > 0">
            <div class="cal-box-header">
              <div class="cal-title-left">
                <div class="cal-badge-pill">
                  <span class="cal-fire-icon">🔥</span>
                  <span>ข้อมูลทางโภชนาการ</span>
                </div>
                <h4 class="cal-box-title">พลังงานรวมทั้งมื้อ (Total Calories)</h4>
              </div>
              <div class="cal-number-right">
                <span class="cal-total-value">{{ totalCalories.toLocaleString() }}</span>
                <span class="cal-total-unit">kcal</span>
              </div>
            </div>

            <div class="cal-progress-section">
              <div class="cal-progress-bar-bg">
                <div 
                  class="cal-progress-bar-fill" 
                  :style="{ width: caloriesPercentage + '%' }"
                  :class="{
                    'cal-fill-healthy': totalCalories <= 700,
                    'cal-fill-balanced': totalCalories > 700 && totalCalories <= 1200,
                    'cal-fill-high': totalCalories > 1200
                  }"
                ></div>
              </div>
              <div class="cal-progress-meta">
                <span class="cal-meta-desc">คิดเป็น <strong>{{ caloriesPercentage }}%</strong> ของพลังงานแนะนำต่อวัน (2,000 kcal)</span>
                <span class="cal-status-tag healthy" v-if="totalCalories <= 700">🥗 มื้อเบาสบาย</span>
                <span class="cal-status-tag balanced" v-else-if="totalCalories <= 1200">🍲 มื้ออิ่มพอดี</span>
                <span class="cal-status-tag high" v-else>🎉 มื้อจัดเต็ม</span>
              </div>
            </div>
          </div>

          <div class="price-breakdown">
            <!-- แถวแสดงพลังงานรวมทั้งมื้อในตารางคำนวณ -->
            <div class="breakdown-row calories-breakdown-row">
              <span class="cal-breakdown-label">
                <span class="cal-fire-icon">🔥</span> พลังงานรวมทั้งมื้อ (Total Calories)
              </span>
              <span class="cal-breakdown-value">{{ totalCalories.toLocaleString() }} kcal</span>
            </div>
            <div class="breakdown-row">
              <span>ยอดรวมค่าอาหาร</span>
              <span>B{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="breakdown-row">
              <span>
                ค่าจัดส่ง 
                <span v-if="isFreeShipping" class="free-shipping-text">(ส่งฟรีเกิน B300)</span>
              </span>
              <span v-if="!isFreeShipping">B20</span>
              <span v-else class="free-shipping-price">ฟรี</span>
            </div>
            <div v-if="appliedPromo && discountAmount > 0" class="breakdown-row discount-row">
              <span>ส่วนลดโปรโมชัน ({{ appliedPromo.code }})</span>
              <span class="discount-price">-B{{ formatCurrency(discountAmount) }}</span>
            </div>
            <!-- ภาษีมูลค่าเพิ่ม (VAT 7%) บังคับเสียตามกฎหมาย พร้อมแสดงสูตรคำนวณชัดเจน -->
            <div class="breakdown-row tax-breakdown-row">
              <div class="tax-info-col">
                <div class="tax-info-header">
                  <span class="tax-main-label">ภาษีมูลค่าเพิ่ม (VAT {{ vatRate }}%)</span>
                  <span class="tax-mandate-badge">คิดอัตโนมัติ</span>
                </div>
                <div class="tax-formula-detail">
                  (คำนวณ {{ vatRate }}% จากยอดอาหาร B{{ formatCurrency(netFoodAmount) }} = B{{ formatCurrency(vatAmount) }})
                </div>
              </div>
              <span class="tax-amount-highlight">+B{{ formatCurrency(vatAmount) }}</span>
            </div>
          </div>

          <div class="net-total-row">
            <div>
              <span>ยอดสุทธิ</span>
              <div class="tax-summary-hint">
                (รวม VAT {{ vatRate }}% จำนวน +B{{ formatCurrency(vatAmount) }} แล้ว)
              </div>
            </div>
            <span class="total-price-highlight">B{{ formatCurrency(total) }}</span>
          </div>

          <button 
            class="confirm-checkout-btn" 
            @click="confirmOrder" 
            :disabled="cartItems.length === 0 || isSubmitting || !isStoreOpen"
            :class="{ 'disabled-btn': !isStoreOpen }"
          >
            <span v-if="!isStoreOpen">🛑 ร้านปิดให้บริการชั่วคราว</span>
            <span v-else-if="isSubmitting">กำลังตรวจสอบและส่งคำสั่งซื้อ...</span>
            <span v-else>ยืนยันและชำระเงิน B{{ formatCurrency(total) }}</span>
          </button>
        </div>
      </aside>
    </div>

    <!-- Popup QR Code สำหรับพร้อมเพย์ -->
    <div v-if="showQrModal" class="qr-modal-backdrop" @click.self="closeQrModal">
      <div class="qr-modal-card">
        <div class="qr-modal-header">
          <div class="qr-header-title-group">
            <span class="qr-header-badge">พร้อมเพย์</span>
            <h3 class="qr-modal-title">สแกนเพื่อชำระเงิน</h3>
          </div>
          <button class="qr-close-btn" @click="closeQrModal" title="ปิด">✕</button>
        </div>

        <div class="thai-qr-header">
          <div class="thai-qr-brand">
            <span class="brand-thai">THAI QR</span>
            <span class="brand-sub">PAYMENT</span>
          </div>
          <div class="promptpay-pill">PromptPay</div>
        </div>

        <div class="qr-display-section">
          <div class="qr-image-wrapper">
            <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="PromptPay QR Code" class="qr-image" />
            <div v-else class="qr-loading">
              <div class="spinner"></div>
              <span>กำลังสร้าง QR Code...</span>
            </div>
          </div>
          <p class="qr-scan-hint">ใช้แอปธนาคารใดก็ได้สแกนเพื่อจ่ายเงิน</p>
        </div>

        <div class="qr-payment-info">
          <div class="qr-info-row">
            <span class="info-label">ชื่อบัญชี</span>
            <span class="info-value font-medium">{{ promptpayName }}</span>
          </div>
          <div class="qr-info-row">
            <span class="info-label">เบอร์พร้อมเพย์</span>
            <span class="info-value font-mono">{{ promptpayNumber }}</span>
          </div>
          <div class="qr-total-row">
            <span>ยอดชำระ</span>
            <span class="qr-total-amount">B{{ total }}</span>
          </div>
        </div>

        <div class="qr-modal-actions">
          <button class="confirm-qr-btn" @click="confirmQrPayment" :disabled="isSubmitting">
            <span>✓</span> ยืนยันการชำระเงิน
          </button>
          <button class="cancel-qr-btn" @click="closeQrModal">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>

    <!-- Modal จำลองการตัดบัตรและ 3D-Secure / Digital Wallet Authorization -->
    <div v-if="isCardProcessingModalOpen" class="card-processing-backdrop">
      <div class="card-processing-card">
        <div class="processing-top-badge">
          <span v-if="cardProcessingBrand === 'apple_pay'"> Apple Pay</span>
          <span v-else-if="cardProcessingBrand === 'link'">🟢 Stripe Link</span>
          <span v-else-if="cardProcessingBrand === 'grabpay'">GrabPay</span>
          <span v-else-if="cardProcessingBrand === 'wechat'">WeChat Pay</span>
          <span v-else-if="cardProcessingBrand === 'klarna'">Klarna</span>
          <span v-else-if="cardProcessingBrand === 'afterpay'">Afterpay</span>
          <span v-else-if="cardProcessingBrand === 'direct_debit'">Direct Debit</span>
          <span v-else-if="cardProcessingBrand === 'ideal'">iDEAL / OXXO</span>
          <span v-else>💳 {{ detectedCardBrand.toUpperCase() }} Card</span>
        </div>

        <div class="processing-icon-area">
          <div v-if="cardProcessingStep === 'authorizing'" class="processing-spinner-box">
            <div class="secure-spinner"></div>
            <span class="secure-shield-icon">🛡️</span>
          </div>
          <div v-else class="processing-success-box">
            <span class="success-check-icon">✓</span>
          </div>
        </div>

        <h3 class="processing-title">
          <span v-if="cardProcessingStep === 'authorizing'">กำลังยืนยันการชำระเงิน...</span>
          <span v-else>ชำระเงินสำเร็จแล้ว!</span>
        </h3>
        <p class="processing-message">{{ cardProcessingMessage }}</p>

        <div class="processing-amount-box">
          <span class="amount-label">ยอดที่ทำรายการ</span>
          <strong class="amount-val">฿{{ total }}</strong>
        </div>

        <div class="processing-footer-badge">
          <span>🔒 3D-Secure 2.0 • PCI-DSS Certified Bank Gateway</span>
        </div>
      </div>
    </div>

    <!-- Popup Modal เลือกคูปองที่เก็บไว้ (Promotion Store) -->
    <div v-if="showCouponPickerModal" class="coupon-modal-backdrop" @click.self="showCouponPickerModal = false">
      <div class="coupon-modal-card">
        <div class="coupon-modal-header">
          <div class="coupon-modal-title-group">
            <span class="coupon-modal-icon">🎁</span>
            <h3 class="coupon-modal-title">เลือกคูปองส่วนลดที่เก็บไว้</h3>
          </div>
          <button class="coupon-modal-close-btn" @click="showCouponPickerModal = false">✕</button>
        </div>

        <div class="coupon-modal-body" v-if="myAvailableCoupons.length > 0">
          <div 
            v-for="coupon in myAvailableCoupons" 
            :key="coupon.promo_id"
            class="modal-coupon-item"
            :class="{
              'is-applied': appliedPromo && appliedPromo.promo_id === coupon.promo_id,
              'is-disabled': subtotal < (coupon.min_order_price || 0)
            }"
            @click="pickAndApplyCouponFromModal(coupon)"
          >
            <div class="item-left">
              <div class="item-code-badge">{{ coupon.code }}</div>
              <div class="item-val">
                {{ coupon.discount_type === 'PERCENTAGE' ? `ลด ${coupon.discount_value}%` : `ลด ฿${coupon.discount_value}` }}
              </div>
              <div class="item-cond">ยอดสั่งซื้อขั้นต่ำ ฿{{ coupon.min_order_price || 0 }}</div>
            </div>
            <div class="item-right">
              <button 
                type="button" 
                class="apply-pill-btn"
                :class="{ 'btn-using': appliedPromo && appliedPromo.promo_id === coupon.promo_id }"
                :disabled="subtotal < (coupon.min_order_price || 0)"
              >
                {{ (appliedPromo && appliedPromo.promo_id === coupon.promo_id) ? '✓ ใช้อยู่' : 'ใช้คูปองนี้' }}
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-coupons-modal">
          <p>ยังไม่มีคูปองที่เก็บไว้ในระบบ</p>
          <router-link to="/promotions" class="goto-promos-link" @click="showCouponPickerModal = false">
            ไปหน้าคูปองโปรโมชั่น ➔
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import QRCode from 'qrcode';
import { adminStore } from './admin/store/adminData.js';
import { API_BASE } from './config/api';
import { socket } from './config/socket';
import CustomerNavbar from './components/CustomerNavbar.vue';
import { authStore } from './store/authStore';
import { usePromotionStore } from './store/promotionStore';

// คำนวณรหัส CRC16 สำหรับ PromptPay EMVCo
function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// สร้างสตริง Payload PromptPay ตามมาตรฐาน EMVCo / ธนาคารแห่งประเทศไทย
function generatePromptPayPayload(target, amount) {
  const cleanTarget = String(target || '').replace(/[^0-9]/g, '');
  const targetType = cleanTarget.length >= 13 ? '02' : '01';
  let formattedTarget = cleanTarget;
  if (targetType === '01') {
    formattedTarget = '0066' + cleanTarget.replace(/^0/, '');
  }
  const targetTag = targetType + String(formattedTarget.length).padStart(2, '0') + formattedTarget;
  const aid = '0016A000000677010111';
  const merchantInfo = aid + targetTag;
  const merchantTag = '29' + String(merchantInfo.length).padStart(2, '0') + merchantInfo;
  
  let payload = '000201' + '010212' + merchantTag + '5802TH' + '5303764';
  if (amount !== undefined && amount !== null) {
    const formattedAmount = Number(amount).toFixed(2);
    payload += '54' + String(formattedAmount.length).padStart(2, '0') + formattedAmount;
  }
  payload += '6304';
  payload += crc16(payload);
  return payload;
}

export default {
  components: {
    CustomerNavbar
  },
  data() {
    return {
      authStore,
      promotionStore: usePromotionStore(),
      isLoggedIn: false,
      selectedPayment: 'card',
      selectedCardBrand: 'visa',
      cardForm: {
        number: '',
        expiry: '',
        cvc: '',
        name: '',
        country: 'TH',
        zip: '',
        saveCard: false
      },
      isCardProcessingModalOpen: false,
      cardProcessingStep: 'authorizing',
      cardProcessingMessage: '',
      cardProcessingBrand: 'visa',
      userProfile: {
        name: '',
        phone: '',
        address: ''
      },
      cartItems: [],
      // ที่อยู่และพิกัด GPS ของลูกค้า
      deliveryLat: 13.7570,
      deliveryLng: 100.5695,
      editDeliveryLat: 13.7570,
      editDeliveryLng: 100.5695,
      isGettingGps: false,
      gpsNotice: '',
      isEditingAddress: false,
      editAddressText: '',
      isGeocoding: false,
      geocodeFoundAddress: '',
      geocodeDebounceTimer: null,
      showQrModal: false,
      qrCodeUrl: '',
      isGeneratingQr: false,
      isSubmitting: false,
      isStoreOpen: true,
      myClaimedCoupons: [],
      inputPromoCode: '',
      appliedPromo: null,
      promoError: '',
      promoSuccess: '',
      isValidatingPromo: false,
      showCouponPickerModal: false,
      allDbMenus: []
    }
  },
  computed: {
    totalCalories() {
      return this.cartItems.reduce((sum, item) => {
        const cal = this.getItemCalories(item);
        const qty = Number(item.qty) || 1;
        return sum + (cal * qty);
      }, 0);
    },
    caloriesPercentage() {
      return Math.min(100, Math.round((this.totalCalories / 2000) * 100));
    },
    vatRate() {
      return Number(adminStore?.storeSettings?.vatRate ?? 7);
    },
    subtotal() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },
    isFreeShipping() {
      return this.subtotal >= 300;
    },
    shippingFee() {
      return this.isFreeShipping ? 0 : 20;
    },
    myAvailableCoupons() {
      return this.myClaimedCoupons.filter(c => !c.is_used);
    },
    discountAmount() {
      if (!this.appliedPromo) return 0;
      const minOrder = Number(this.appliedPromo.min_order_price || 0);
      if (this.subtotal < minOrder) return 0;

      let discount = 0;
      const val = Number(this.appliedPromo.discount_value || 0);
      if (this.appliedPromo.discount_type === 'PERCENTAGE') {
        discount = (this.subtotal * val) / 100;
        if (this.appliedPromo.max_discount) {
          discount = Math.min(discount, Number(this.appliedPromo.max_discount));
        }
      } else {
        discount = val;
      }
      return Math.min(Math.round(discount), this.subtotal);
    },
    netFoodAmount() {
      return Math.max(0, this.subtotal - this.discountAmount);
    },
    vatAmount() {
      if (this.netFoodAmount <= 0) return 0;
      const vat = this.netFoodAmount * (this.vatRate / 100);
      return Math.round(vat * 100) / 100;
    },
    total() {
      const raw = this.netFoodAmount + this.shippingFee + this.vatAmount;
      return Math.max(0, Math.round(raw * 100) / 100);
    },
    mapUrl() {
      // 1. ถ้ากำลังอยู่ในโหมดแก้ไขที่อยู่ ให้แผนที่เปลี่ยนตามพิกัดหรือที่อยู่ที่กำลังพิมพ์สดๆ
      if (this.isEditingAddress) {
        if (this.editDeliveryLat && this.editDeliveryLng) {
          return `https://maps.google.com/maps?q=${this.editDeliveryLat},${this.editDeliveryLng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
        }
        if (this.editAddressText && this.editAddressText.trim()) {
          const encoded = encodeURIComponent(this.editAddressText.trim());
          return `https://maps.google.com/maps?q=${encoded}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
        }
      }

      // 2. โหมดปกติ: ถ้ามีพิกัดที่ปักหมุดไว้
      if (this.deliveryLat && this.deliveryLng) {
        return `https://maps.google.com/maps?q=${this.deliveryLat},${this.deliveryLng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
      }

      // 3. Fallback ใช้ที่อยู่ตามโปรไฟล์
      const address = this.userProfile.address || 'ตลาดปากเกร็ด นนทบุรี'; 
      const encodedAddress = encodeURIComponent(address);
      return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    },
    promptpayNumber() {
      return adminStore?.storeSettings?.promptpayNumber || '081-234-5678';
    },
    promptpayName() {
      return adminStore?.storeSettings?.promptpayName || 'ร้านตำครกซิ่ง (นายธีรวัฒน์ แสนคำเฮียง)';
    }
  },
  async mounted() {
    this.isLoggedIn = !!localStorage.getItem('access_token') || localStorage.getItem('isLoggedIn') === 'true';
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      const parsed = JSON.parse(profileData);
      this.userProfile = {
        name: parsed.name || parsed.username || 'ลูกค้าทั่วไป',
        phone: parsed.phone || '08x-xxx-xxxx',
        address: parsed.address || 'ตลาดปากเกร็ด นนทบุรี'
      };
    } else {
      this.userProfile = {
        name: 'ลูกค้าทั่วไป',
        phone: '08x-xxx-xxxx',
        address: 'ตลาดปากเกร็ด นนทบุรี'
      };
    }

    // โหลดพิกัด GPS ที่เคยปักหมุดไว้ (ถ้ามี)
    let isSpecificGpsFound = false;
    try {
      const savedGps = localStorage.getItem('latest_delivery_gps');
      if (savedGps) {
        const parsed = JSON.parse(savedGps);
        if (parsed.lat && parsed.lng) {
          const isOldDefaultRama9 = Math.abs(parsed.lat - 13.7570) < 0.0001 && Math.abs(parsed.lng - 100.5695) < 0.0001;
          const matchesCurrentAddress = !parsed.address || parsed.address === this.userProfile.address;

          if (matchesCurrentAddress && (!isOldDefaultRama9 || (this.userProfile.address && this.userProfile.address.includes('พระราม 9')))) {
            this.deliveryLat = Number(parsed.lat);
            this.deliveryLng = Number(parsed.lng);
            this.editDeliveryLat = this.deliveryLat;
            this.editDeliveryLng = this.deliveryLng;
            isSpecificGpsFound = true;
          }
        }
      }
    } catch (e) {}

    // ถ้ายังไม่มีพิกัดที่เจาะจง หรือพิกัดเดิมยังเป็นค่าเริ่มต้นของพระราม 9 ให้แปลงพิกัดจากที่อยู่อัตโนมัติทันที
    if (!isSpecificGpsFound && this.userProfile.address) {
      this.autoGeocodeInitialAddress(this.userProfile.address);
    }

    const savedCart = sessionStorage.getItem('cartData') || localStorage.getItem('cartData');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }

    // ดึงข้อมูลเมนูและค่าพลังงานแคลอรี่ (Calories) ล่าสุดจากฐานข้อมูล Backend
    try {
      const menuRes = await axios.get(`${API_BASE}/menus`);
      if (menuRes.data && Array.isArray(menuRes.data)) {
        this.allDbMenus = menuRes.data;
      }
    } catch (e) {
      console.warn('โหลดข้อมูลเมนูสำหรับคำนวณแคลอรี่ไม่สำเร็จ:', e);
    }

    // เชื่อมต่อ Promotion Store: โหลดคูปองโปรโมชันที่ผู้ใช้กดรับไว้
    await this.promotionStore.loadClaimedCoupons();
    if (this.promotionStore.claimedCoupons.length > 0) {
      this.myClaimedCoupons = this.promotionStore.claimedCoupons;
    } else if (this.isLoggedIn) {
      await this.loadMyCoupons();
    }

    // ตรวจจับและ Auto-fill คูปองที่เลือกมาจากหน้า /promotions อัตโนมัติ
    if (this.promotionStore.selectedCoupon) {
      const promo = this.promotionStore.selectedCoupon;
      this.inputPromoCode = promo.code;
      await this.applyCustomPromoCode();
      this.promoSuccess = `🎉 Auto-fill: นำคูปองส่วนลด "${promo.code}" ที่เก็บไว้มาใช้งานเรียบร้อยแล้ว`;
    }

    // ตรวจสอบสถานะเปิด-ปิดร้านค้าล่าสุดจากเซิร์ฟเวอร์
    try {
      const res = await axios.get(`${API_BASE}/settings`);
      if (res.data && res.data.is_open !== undefined) {
        this.isStoreOpen = Boolean(res.data.is_open);
      }
    } catch (e) {
      console.warn('โหลดสถานะร้านค้าในหน้าชำระเงินไม่สำเร็จ:', e);
    }
  },
  methods: {
    getItemCalories(item) {
      if (!item) return 0;
      // 1. หากมีค่า calories เก็บมาในอ็อบเจกต์รายการแล้ว
      if (item.calories !== undefined && item.calories !== null && Number(item.calories) > 0) {
        return Number(item.calories);
      }

      // 2. ค้นหาจากฐานข้อมูลเมนู (allDbMenus หรือ adminStore.menus)
      const clean = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '');
      const itemName = clean(item.name);
      
      const menuList = (this.allDbMenus && this.allDbMenus.length > 0) 
        ? this.allDbMenus 
        : (adminStore.menus || []);

      let found = menuList.find(m => clean(m.menu_name || m.name) === itemName || m.menu_id === item.id || m.id === item.id);
      let baseCal = found && found.calories ? Number(found.calories) : 0;

      // 3. Fallback อ้างอิงตามฐานข้อมูลเมนูจริงของร้าน
      if (!baseCal) {
        if (itemName.includes('เพรา')) baseCal = 320;
        else if (itemName.includes('ส้มตำ')) baseCal = 150;
        else if (itemName.includes('ลาบ') || itemName.includes('ยำ')) baseCal = 220;
        else if (itemName.includes('ไก่ทอด')) baseCal = 250;
        else if (itemName.includes('ข้าวผัด')) baseCal = 350;
        else if (itemName.includes('ไข่เจียว')) baseCal = 390;
        else if (itemName.includes('หมูกระเทียม')) baseCal = 360;
        else if (itemName.includes('พริกแกง')) baseCal = 310;
        else if (itemName.includes('คะน้า')) baseCal = 320;
        else if (itemName.includes('น้ำตก')) baseCal = 200;
        else if (itemName.includes('น้ำ') || itemName.includes('โค้ก') || itemName.includes('เก๊กฮวย')) baseCal = 120;
        else if (itemName.includes('ข้าวเปล่า') || itemName.includes('ข้าวเหนียว')) baseCal = 150;
        else baseCal = 250;
      }

      // บวกแคลอรี่ของส่วนเสริม (Addons)
      let addonCal = 0;
      if (Array.isArray(item.addons)) {
        addonCal = item.addons.reduce((sum, a) => {
          if (a.calories) return sum + Number(a.calories);
          const aName = clean(a.name);
          if (aName.includes('ไข่ดาว')) return sum + 160;
          if (aName.includes('ไข่เจียว')) return sum + 220;
          if (aName.includes('หมูยอ') || aName.includes('ไก่ยอ')) return sum + 120;
          if (aName.includes('ปู')) return sum + 30;
          if (aName.includes('ขนมจีน')) return sum + 80;
          if (aName.includes('ผัก')) return sum + 20;
          return sum + 50;
        }, 0);
      }

      return baseCal + addonCal;
    },

    logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('cartData');
      sessionStorage.removeItem('currentOrder');
      this.$router.push('/');
    },

    async loadMyCoupons() {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/promotions/my/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.myClaimedCoupons = res.data || [];
      } catch (err) {
        console.warn('โหลดคูปองที่เก็บไว้ไม่สำเร็จ:', err);
      }
    },

    selectCoupon(coupon) {
      if (this.appliedPromo && this.appliedPromo.promo_id === coupon.promo_id) {
        this.removeCoupon();
        return;
      }
      this.promoError = '';
      this.promoSuccess = '';
      const minOrder = Number(coupon.min_order_price || 0);
      if (this.subtotal < minOrder) {
        this.promoError = `คูปอง "${coupon.code}" ต้องมียอดสั่งซื้อขั้นต่ำ ฿${minOrder}`;
        return;
      }
      this.appliedPromo = coupon;
      this.inputPromoCode = coupon.code;
      this.promoSuccess = `ใช้คูปองส่วนลด "${coupon.code}" เรียบร้อยแล้ว!`;
      this.promotionStore.selectCouponForCheckout(coupon);
    },

    pickAndApplyCouponFromModal(coupon) {
      const minOrder = Number(coupon.min_order_price || 0);
      if (this.subtotal < minOrder) {
        alert(`คูปองนี้ต้องมียอดสั่งซื้อขั้นต่ำ ฿${minOrder} ครับ (ยอดปัจจุบัน ฿${this.subtotal})`);
        return;
      }
      this.selectCoupon(coupon);
      this.showCouponPickerModal = false;
    },

    removeCoupon() {
      this.appliedPromo = null;
      this.inputPromoCode = '';
      this.promoError = '';
      this.promoSuccess = '';
      this.promotionStore.clearSelectedCoupon();
    },

    async applyCustomPromoCode() {
      const code = (this.inputPromoCode || '').trim().toUpperCase();
      if (!code) {
        this.promoError = 'กรุณาระบุโค้ดส่วนลด';
        return;
      }
      this.promoError = '';
      this.promoSuccess = '';
      this.isValidatingPromo = true;

      try {
        // ตรวจสอบในคูปองที่ผู้ใช้เคยกดเก็บไว้
        const existingClaim = this.myClaimedCoupons.find(c => (c.code || '').toUpperCase() === code && !c.is_used);
        if (existingClaim) {
          this.selectCoupon(existingClaim);
          this.isValidatingPromo = false;
          return;
        }

        // ดึงรายการโปรโมชันจากเซิร์ฟเวอร์
        const res = await axios.get(`${API_BASE}/promotions`);
        const allPromos = res.data || [];
        const found = allPromos.find(p => (p.code || '').toUpperCase() === code && p.is_active);

        if (!found) {
          this.promoError = 'ไม่พบคูปองนี้ หรือคูปองหมดอายุการใช้งานแล้ว';
          return;
        }

        // บันทึกเก็บคูปองเข้าบัญชีผู้ใช้ทันที
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            await axios.post(`${API_BASE}/promotions/claim/${found.promo_id}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
            await this.loadMyCoupons();
          } catch (claimErr) {
            // ละเว้นหากเก็บไปแล้ว
          }
        }

        this.selectCoupon(found);
      } catch (err) {
        console.warn('เกิดข้อผิดพลาดในการตรวจสอบคูปอง:', err);
        this.promoError = 'ไม่สามารถตรวจสอบโค้ดส่วนลดได้ในขณะนี้';
      } finally {
        this.isValidatingPromo = false;
      }
    },
    
    startEditAddress() {
      this.editAddressText = this.userProfile.address;
      this.editDeliveryLat = this.deliveryLat;
      this.editDeliveryLng = this.deliveryLng;
      this.geocodeFoundAddress = '';
      this.isEditingAddress = true;
    },

    onAddressInput() {
      this.geocodeFoundAddress = '';
      if (this.geocodeDebounceTimer) {
        clearTimeout(this.geocodeDebounceTimer);
      }
      this.geocodeDebounceTimer = setTimeout(() => {
        this.geocodeAddress(this.editAddressText, true);
      }, 500);
    },

    cancelEditAddress() {
      if (this.geocodeDebounceTimer) {
        clearTimeout(this.geocodeDebounceTimer);
      }
      this.isEditingAddress = false;
      this.isGeocoding = false;
      this.geocodeFoundAddress = '';
    },

    // แปลงที่อยู่ภาษาไทย / ข้อความที่อยู่ เป็นพิกัดละติจูด ลองจิจูด
    async geocodeThaiAddress(addrText) {
      if (!addrText || !addrText.trim()) return null;
      const raw = addrText.trim();

      // ตารางพิกัดสำรองสำหรับเขตและพื้นที่สำคัญในกรุงเทพฯ และปริมณฑล / ต่างจังหวัด
      const thaiDistrictFallbacks = {
        'แจ้งวัฒนะ': { lat: 13.8805, lng: 100.5885, name: 'ถนนแจ้งวัฒนะ' },
        'อนุสาวรีย์': { lat: 13.8761, lng: 100.5963, name: 'แขวงอนุสาวรีย์ เขตบางเขน' },
        'บางเขน': { lat: 13.8756, lng: 100.5969, name: 'เขตบางเขน กรุงเทพมหานคร' },
        'หลักสี่': { lat: 13.8876, lng: 100.5790, name: 'เขตหลักสี่ กรุงเทพมหานคร' },
        'ดอนเมือง': { lat: 13.9130, lng: 100.5897, name: 'เขตดอนเมือง กรุงเทพมหานคร' },
        'ปากเกร็ด': { lat: 13.9130, lng: 100.4988, name: 'อำเภอปากเกร็ด นนทบุรี' },
        'เมืองทอง': { lat: 13.9110, lng: 100.5480, name: 'เมืองทองธานี นนทบุรี' },
        'จตุจักร': { lat: 13.8167, lng: 100.5564, name: 'เขตจตุจักร กรุงเทพมหานคร' },
        'ลาดพร้าว': { lat: 13.7972, lng: 100.6045, name: 'เขตลาดพร้าว กรุงเทพมหานคร' },
        'รามคำแหง': { lat: 13.7508, lng: 100.6190, name: 'ถนนรามคำแหง กรุงเทพมหานคร' },
        'พระราม 9': { lat: 13.7570, lng: 100.5695, name: 'ถนนพระราม 9 กรุงเทพมหานคร' },
        'พระราม9': { lat: 13.7570, lng: 100.5695, name: 'ถนนพระราม 9 กรุงเทพมหานคร' },
        'สยาม': { lat: 13.7460, lng: 100.5340, name: 'สยาม ปทุมวัน กรุงเทพมหานคร' },
        'ปทุมวัน': { lat: 13.7460, lng: 100.5340, name: 'เขตปทุมวัน กรุงเทพมหานคร' },
        'สุขุมวิท': { lat: 13.7380, lng: 100.5604, name: 'ถนนสุขุมวิท กรุงเทพมหานคร' },
        'บางนา': { lat: 13.6682, lng: 100.6042, name: 'เขตบางนา กรุงเทพมหานคร' },
        'ธนบุรี': { lat: 13.7250, lng: 100.4850, name: 'เขตธนบุรี กรุงเทพมหานคร' },
        'รังสิต': { lat: 13.9890, lng: 100.6178, name: 'รังสิต ปทุมธานี' },
        'คลองหลวง': { lat: 14.0645, lng: 100.6450, name: 'อำเภอคลองหลวง ปทุมธานี' },
        'พญาไท': { lat: 13.7800, lng: 100.5420, name: 'เขตพญาไท กรุงเทพมหานคร' },
        'ห้วยขวาง': { lat: 13.7780, lng: 100.5750, name: 'เขตห้วยขวาง กรุงเทพมหานคร' },
        'ดินแดง': { lat: 13.7690, lng: 100.5530, name: 'เขตดินแดง กรุงเทพมหานคร' },
        'สายไหม': { lat: 13.9210, lng: 100.6450, name: 'เขตสายไหม กรุงเทพมหานคร' },
        'คันนายาว': { lat: 13.8260, lng: 100.6790, name: 'เขตคันนายาว กรุงเทพมหานคร' },
        'มีนบุรี': { lat: 13.8130, lng: 100.7190, name: 'เขตมีนบุรี กรุงเทพมหานคร' },
        'ประเวศ': { lat: 13.7170, lng: 100.6950, name: 'เขตประเวศ กรุงเทพมหานคร' },
        'บางกะปิ': { lat: 13.7660, lng: 100.6470, name: 'เขตบางกะปิ กรุงเทพมหานคร' },
        'สะพานสูง': { lat: 13.7700, lng: 100.6860, name: 'เขตสะพานสูง กรุงเทพมหานคร' },
        'นนทบุรี': { lat: 13.8621, lng: 100.5144, name: 'จังหวัดนนทบุรี' },
        'ปทุมธานี': { lat: 14.0208, lng: 100.5250, name: 'จังหวัดปทุมธานี' },
        'สมุทรปราการ': { lat: 13.5991, lng: 100.5998, name: 'จังหวัดสมุทรปราการ' },
        'สมุทรสาคร': { lat: 13.5475, lng: 100.2744, name: 'จังหวัดสมุทรสาคร' },
        'นครปฐม': { lat: 13.8196, lng: 100.0601, name: 'จังหวัดนครปฐม' },
        'เชียงใหม่': { lat: 18.7883, lng: 98.9853, name: 'จังหวัดเชียงใหม่' },
        'ขอนแก่น': { lat: 16.4419, lng: 102.8360, name: 'จังหวัดขอนแก่น' },
        'ชลบุรี': { lat: 13.3611, lng: 100.9847, name: 'จังหวัดชลบุรี' },
        'พัทยา': { lat: 12.9276, lng: 100.8771, name: 'เมืองพัทยา ชลบุรี' }
      };

      // 1. เรียก OpenStreetMap Nominatim API ค้นหาพิกัดจริง
      const queries = [
        raw,
        raw.replace(/ห้อง\s*\S+|ชั้น\s*\S+|ตึก\s*\S+|อาคาร\s*\S+|เลขที่\s*\S+/g, ' ').replace(/\s+/g, ' ').trim()
      ];

      for (const q of queries) {
        if (!q) continue;
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=th&limit=1`;
          const res = await fetch(url, { headers: { 'User-Agent': 'TumKrokZing-App' } });
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              const item = data[0];
              const parts = (item.display_name || '').split(',');
              const shortName = parts.slice(0, 3).join(', ').trim() || raw;
              return {
                lat: Number(Number(item.lat).toFixed(6)),
                lng: Number(Number(item.lon).toFixed(6)),
                name: shortName
              };
            }
          }
        } catch (e) {
          // ข้ามไปยังรอบถัดไป
        }
      }

      // 2. ถ้า API ไม่พบ ให้ค้นหาจากตารางเขตและถนนสำคัญ
      for (const [key, val] of Object.entries(thaiDistrictFallbacks)) {
        if (raw.includes(key)) {
          return {
            lat: val.lat,
            lng: val.lng,
            name: val.name
          };
        }
      }

      return null;
    },

    async geocodeAddress(addrText, isPreviewOnly = false) {
      if (!addrText || !addrText.trim()) return;
      this.isGeocoding = true;
      try {
        const result = await this.geocodeThaiAddress(addrText);
        if (result) {
          this.editDeliveryLat = result.lat;
          this.editDeliveryLng = result.lng;
          this.geocodeFoundAddress = result.name;

          if (!isPreviewOnly) {
            this.deliveryLat = result.lat;
            this.deliveryLng = result.lng;
          }
        }
      } finally {
        this.isGeocoding = false;
      }
    },

    async autoGeocodeInitialAddress(addrText) {
      if (!addrText || !addrText.trim()) return;
      const result = await this.geocodeThaiAddress(addrText);
      if (result) {
        this.deliveryLat = result.lat;
        this.deliveryLng = result.lng;
        this.editDeliveryLat = result.lat;
        this.editDeliveryLng = result.lng;
        
        try {
          const gpsData = {
            lat: this.deliveryLat,
            lng: this.deliveryLng,
            address: this.userProfile.address,
            name: this.userProfile.name,
            phone: this.userProfile.phone
          };
          localStorage.setItem('latest_delivery_gps', JSON.stringify(gpsData));
          localStorage.setItem('latest_order_gps', JSON.stringify(gpsData));
        } catch (e) {}
      }
    },

    pinCurrentGpsLocation() {
      if (!navigator.geolocation) {
        alert('เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด GPS อัตโนมัติ กรุณากรอกพิกัดละติจูด/ลองจิจูดด้วยตนเองครับ');
        return;
      }
      this.isGettingGps = true;
      this.gpsNotice = 'กำลังค้นหาตำแหน่งพิกัด GPS ของคุณ...';
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.deliveryLat = Number(position.coords.latitude);
          this.deliveryLng = Number(position.coords.longitude);
          this.editDeliveryLat = this.deliveryLat;
          this.editDeliveryLng = this.deliveryLng;
          this.isGettingGps = false;
          this.gpsNotice = `ปักหมุดพิกัดเรียบร้อย (${this.deliveryLat.toFixed(5)}, ${this.deliveryLng.toFixed(5)})`;

          try {
            const gpsData = {
              lat: this.deliveryLat,
              lng: this.deliveryLng,
              address: this.userProfile.address,
              name: this.userProfile.name,
              phone: this.userProfile.phone
            };
            localStorage.setItem('latest_delivery_gps', JSON.stringify(gpsData));
            localStorage.setItem('latest_order_gps', JSON.stringify(gpsData));
          } catch (e) {}
        },
        (error) => {
          this.isGettingGps = false;
          let msg = 'ไม่สามารถดึงตำแหน่ง GPS ได้';
          if (error.code === 1) msg = 'กรุณาอนุญาตการเข้าถึงตำแหน่ง (Allow Location) ในเบราว์เซอร์ หรือกรอกพิกัดด้วยตนเองครับ';
          else if (error.code === 2) msg = 'ไม่พบสัญญาณพิกัด GPS บนอุปกรณ์';
          else if (error.code === 3) msg = 'หมดเวลาเชื่อมต่อ GPS';
          alert(msg);
          this.gpsNotice = '';
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    },

    detectLocationForEdit() {
      this.pinCurrentGpsLocation();
    },

    async saveAddress() {
      if (!this.editAddressText.trim()) {
        alert('กรุณากรอกที่อยู่สำหรับจัดส่งครับ');
        return;
      }

      // ถ้าที่อยู่มีการเปลี่ยนแปลง ให้ค้นหาพิกัดใหม่เสมอ
      if (this.editAddressText.trim() !== this.userProfile.address && !this.geocodeFoundAddress) {
        await this.geocodeAddress(this.editAddressText, false);
      }

      this.userProfile.address = this.editAddressText;
      if (this.editDeliveryLat && this.editDeliveryLng) {
        this.deliveryLat = Number(this.editDeliveryLat);
        this.deliveryLng = Number(this.editDeliveryLng);
      }
      this.gpsNotice = 'ปักหมุดพิกัดตามที่อยู่เรียบร้อยแล้ว';
      localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
      try {
        const gpsData = {
          lat: this.deliveryLat,
          lng: this.deliveryLng,
          address: this.userProfile.address,
          name: this.userProfile.name,
          phone: this.userProfile.phone
        };
        localStorage.setItem('latest_delivery_gps', JSON.stringify(gpsData));
        localStorage.setItem('latest_order_gps', JSON.stringify(gpsData));
      } catch (e) {}
      this.isEditingAddress = false;

      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await axios.patch(`${API_BASE}/auth/profile`, {
            address: this.editAddressText
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.warn('อัปเดตที่อยู่ไปยัง Backend ไม่สำเร็จ:', err);
        }
      }
    },

    async openQrModal() {
      this.showQrModal = true;
      await this.generateQrCode();
    },

    closeQrModal() {
      this.showQrModal = false;
    },

    async generateQrCode() {
      this.isGeneratingQr = true;
      try {
        const payload = generatePromptPayPayload(this.promptpayNumber, this.total);
        this.qrCodeUrl = await QRCode.toDataURL(payload, {
          width: 240,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' }
        });
      } catch (err) {
        console.error('Error generating QR code:', err);
        const cleanPhone = this.promptpayNumber.replace(/[^0-9]/g, '');
        this.qrCodeUrl = `https://promptpay.io/${cleanPhone}/${this.total}.png`;
      } finally {
        this.isGeneratingQr = false;
      }
    },

    confirmQrPayment() {
      this.showQrModal = false;
      this.processOrderCompletion();
    },

    // 🛑 เพิ่มฟังก์ชันตรวจสอบสถานะสินค้าล่าสุดจาก Backend ก่อนยืนยันสั่งซื้อ
async validateAndCheckout() {
      try {
        // 🛑 1. ตรวจสอบสถานะเปิด-ปิดร้านค้าจากเซิร์ฟเวอร์ทันที
        const storeRes = await axios.get(`${API_BASE}/settings`);
        if (storeRes.data && storeRes.data.is_open === false) {
          this.isStoreOpen = false;
          alert('🛑 ขออภัยครับ ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถสั่งอาหารหรือดำเนินการชำระเงินได้ครับ');
          return false;
        }

        const res = await axios.get(`${API_BASE}/menus`);
        const dbMenus = res.data || [];

        for (const cartItem of this.cartItems) {
          const itemName = (cartItem.name || '').trim().toLowerCase();

          const found = dbMenus.find(m => {
            const dbName = (m.name || m.menu_name || '').trim().toLowerCase();
            return dbName === itemName || itemName.includes(dbName) || dbName.includes(itemName);
          });

          if (found && (found.is_available === false || found.is_available === 0)) {
            alert(`❌ ขออภัย เมนู "${cartItem.name}" ปิดการขายชั่วคราว กรุณาลบออกจากตะกร้าก่อนสั่งซื้อครับ`);
            return false;
          }
        }
        return true;
      } catch (err) {
        console.warn('ไม่สามารถตรวจสอบสถานะเมนูได้:', err);
        return true; 
      }
    },

    formatCurrency(val) {
      const num = Number(val || 0);
      return (num % 1 === 0) ? num.toLocaleString() : num.toFixed(2);
    },

    selectCardBrand(brand) {
      this.selectedCardBrand = brand;
    },

    detectCardBrand(number) {
      const clean = (number || '').replace(/\D/g, '');
      if (/^4/.test(clean)) return 'visa';
      if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
      if (/^35/.test(clean)) return 'jcb';
      if (/^3[47]/.test(clean)) return 'amex';
      if (/^62/.test(clean)) return 'unionpay';
      return null;
    },

    onCardNumberInput(e) {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val.replace(/(.{4})/g, '$1 ').trim();
      this.cardForm.number = val;
      const detected = this.detectCardBrand(val);
      if (detected) {
        this.selectedCardBrand = detected;
      }
    },

    onCardExpiryInput(e) {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 3) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
      this.cardForm.expiry = val;
    },

    async processCardPayment() {
      const cleanNum = (this.cardForm.number || '').replace(/\D/g, '');
      if (!cleanNum || cleanNum.length < 14) {
        alert('กรุณากรอกหมายเลขบัตรเครดิต / เดบิตให้ครบถ้วน (14-16 หลัก) ครับ');
        return;
      }
      if (!this.cardForm.expiry || this.cardForm.expiry.length < 4) {
        alert('กรุณากรอกวันหมดอายุของบัตร (MM/YY) ครับ');
        return;
      }
      if (!this.cardForm.cvc || this.cardForm.cvc.length < 3) {
        alert('กรุณากรอกรหัส CVC / CVV หลังบัตรครับ');
        return;
      }
      if (!this.cardForm.name || !this.cardForm.name.trim()) {
        alert('กรุณากรอกชื่อผู้ถือบัตรภาษาอังกฤษครับ');
        return;
      }

      const brand = (this.selectedCardBrand || 'Card').toUpperCase();
      this.cardProcessingBrand = this.selectedCardBrand || 'visa';
      this.isCardProcessingModalOpen = true;
      this.cardProcessingStep = 'authorizing';
      this.cardProcessingMessage = `กำลังเชื่อมต่อระบบความปลอดภัย ${brand} (3D-Secure 2.0)...`;

      setTimeout(() => {
        this.cardProcessingStep = 'success';
        this.cardProcessingMessage = `ตัดบัตร ${brand} (•••• ${cleanNum.slice(-4)}) เรียบร้อยแล้ว`;
        setTimeout(() => {
          this.isCardProcessingModalOpen = false;
          const label = `Credit Card (${brand} •••• ${cleanNum.slice(-4)})`;
          this.processOrderCompletion(label);
        }, 1000);
      }, 1500);
    },

    async confirmOrder() {
      if (this.cartItems.length === 0) {
        alert('กรุณาเลือกอาหารก่อนชำระเงินครับ!');
        this.$router.push('/');
        return;
      }

      // ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง ถ้ายังไม่ล็อกอินให้แจ้งเตือนและพาไปล็อกอิน
      this.authStore.syncAuth();
      const token = localStorage.getItem('access_token');
      if (!this.authStore.isLoggedIn || !token) {
        alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้ออาหารครับ');
        this.$router.push('/login?redirect=/checkout');
        return;
      }

      // 🛑 บังคับให้รอผลลัพธ์การเช็กจาก Backend ให้เสร็จก่อนทุกครั้ง
      const isValid = await this.validateAndCheckout();
      
      // ถ้าตรวจสอบแล้วพบว่ามีสินค้าหมด (isValid เป็น false) ให้หยุดการทำงานทันที ไม่ให้ไปหน้าจ่ายเงินหรือสร้างออเดอร์
      if (isValid === false) {
        return; 
      }

      if (this.selectedPayment === 'qr') {
        this.openQrModal();
      } else if (this.selectedPayment === 'card') {
        this.processCardPayment();
      } else {
        this.processOrderCompletion('Cash');
      }
    },

    async processOrderCompletion(customPaymentMethod = null) {
      if (this.isSubmitting) return;

      const token = localStorage.getItem('access_token');
      this.isSubmitting = true;

      try {
        let dbMenus = [];
        try {
          const menuRes = await axios.get(`${API_BASE}/menus`);
          dbMenus = menuRes.data || [];
        } catch (e) {
          console.warn('ไม่สามารถดึงข้อมูลเมนูเพื่อเทียบรหัสได้:', e);
        }

        const orderPayload = {
          order_type: 'DELIVERY',
          user_id: (this.authStore?.userProfile?.user_id && !isNaN(Number(this.authStore.userProfile.user_id)))
            ? Number(this.authStore.userProfile.user_id)
            : undefined,
          promo_id: this.appliedPromo?.promo_id ? Number(this.appliedPromo.promo_id) : undefined,
          promo_code: this.appliedPromo?.code || undefined,
          items: this.cartItems.map(item => {
            const cleanItemName = (item.name || '').trim().toLowerCase();
            const matched = dbMenus.find(m => {
              const dbName = (m.name || m.menu_name || '').trim().toLowerCase();
              return dbName === cleanItemName || dbName.includes(cleanItemName) || cleanItemName.includes(dbName);
            });

            const realMenuId = matched?.menu_id ?? matched?.id ?? item.id ?? item.menu_id ?? (dbMenus[0]?.menu_id || dbMenus[0]?.id || 10);

            const options = [];
            if (item.dishType) options.push(item.dishType);
            if (item.spiceLevel) options.push(item.spiceLevel);
            if (item.seafoodChoice) options.push(item.seafoodChoice);
            if (item.addons && item.addons.length > 0) {
              options.push('ส่วนเสริม: ' + item.addons.map(a => a.name).join(', '));
            }
            if (item.note) options.push('โน้ต: ' + item.note);

            return {
              menu_id: Number(realMenuId),
              quantity: Number(item.qty || item.quantity || 1),
              notes: options.join(' | '),
              dish_type: item.dishType || undefined
            };
          })
        };

        if (this.vatAmount > 0) {
          const taxInfo = `[รวม VAT 7%: B${this.formatCurrency(this.vatAmount)}]`;
          if (orderPayload.items.length > 0) {
            orderPayload.items[0].notes = orderPayload.items[0].notes ? `${orderPayload.items[0].notes} | ${taxInfo}` : taxInfo;
          }
        }

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.post(`${API_BASE}/orders`, orderPayload, { headers });

        const createdOrder = response.data;
        const orderId = createdOrder?.order_id || createdOrder?.id || ('TRX-' + Math.floor(1000 + Math.random() * 9000));

        // ส่งสัญญาณ WebSocket แจ้งเตือนห้องครัวแบบ Real-time ทันที
        try {
          socket.emit('place_order', createdOrder);
        } catch (socketErr) {
          console.warn('ไม่สามารถส่งสัญญาณ socket place_order:', socketErr);
        }

        // บันทึกข้อมูล Transaction ลงในฐานข้อมูลจริง
        if (createdOrder?.order_id) {
          try {
            const paymentLabel = customPaymentMethod || (this.selectedPayment === 'qr' ? 'PromptPay' : (this.selectedPayment === 'card' ? 'Credit Card' : 'Cash'));
            const paymentStatus = (this.selectedPayment === 'cash') ? 'PENDING' : 'COMPLETED';

            await axios.post(`${API_BASE}/transactions`, {
              order_id: createdOrder.order_id,
              amount: Number(this.total),
              payment_method: paymentLabel,
              payment_status: paymentStatus
            });
          } catch (txnErr) {
            console.warn('บันทึก transaction ไม่สำเร็จ:', txnErr);
          }
        }

        try {
          const gpsPayload = {
            lat: this.deliveryLat,
            lng: this.deliveryLng,
            address: this.userProfile.address,
            name: this.userProfile.name,
            phone: this.userProfile.phone,
            order_id: createdOrder?.order_id
          };
          localStorage.setItem('latest_order_gps', JSON.stringify(gpsPayload));
          localStorage.setItem('latest_delivery_gps', JSON.stringify(gpsPayload));
          this.promotionStore.clearSelectedCoupon();
        } catch (e) {}

        alert(`สั่งซื้อสำเร็จ!\nเลขออเดอร์: #${orderId}\nทางร้านได้รับคำสั่งซื้อเรียบร้อยแล้วครับ`);

        sessionStorage.removeItem('cartData');
        localStorage.removeItem('cartData');
        sessionStorage.removeItem('currentOrder');
        localStorage.removeItem('orderHistoryList');
        if (createdOrder?.order_id) {
          sessionStorage.setItem('active_tracking_order_id', String(createdOrder.order_id));
        }
        this.cartItems = [];

        if (createdOrder?.order_id) {
          this.$router.push({ path: '/tracking', query: { orderId: String(createdOrder.order_id) } });
        } else {
          this.$router.push('/tracking');
        }
      } catch (error) {
        console.error('บันทึกคำสั่งซื้อไม่สำเร็จ:', error);
        const errMsg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ';
        alert(`ไม่สามารถสั่งซื้อได้: ${Array.isArray(errMsg) ? errMsg.join(', ') : errMsg}`);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', sans-serif; }
.checkout-container { background-color: #f7f6f0; min-height: 100vh; display: flex; flex-direction: column; }

.checkout-main {
  display: flex;
  max-width: 1200px;
  margin: 30px auto;
  gap: 30px;
  padding: 0 20px;
}

/* 🛑 Checkout Closed Banner */
.checkout-closed-banner {
  background: #fee2e2;
  border-bottom: 2px solid #ef4444;
  padding: 12px 24px;
}
.closed-banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.checkout-closed-banner .closed-icon { font-size: 22px; }
.checkout-closed-banner .closed-texts { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.checkout-closed-banner .closed-title { font-size: 14px; font-weight: 700; color: #991b1b; }
.checkout-closed-banner .closed-sub { font-size: 12px; color: #7f1d1d; }
.checkout-closed-banner .closed-badge {
  background: #dc2626;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  white-space: nowrap;
}
.confirm-checkout-btn.disabled-btn {
  background: #94a3b8 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}

.left-section { flex: 1; display: flex; flex-direction: column; gap: 20px; max-width: 680px; }
.card-section { background: white; border-radius: 16px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); border: 1px solid #e5e2d5;}
.section-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px; }

.address-box { display: flex; gap: 20px; align-items: flex-start; }
.map-placeholder { width: 100px; height: 90px; background: #f1ede1; border-radius: 12px; flex-shrink: 0; display: flex; justify-content: center; align-items: center; overflow: hidden;}
.map-placeholder.map-active { width: 140px; height: 130px; border: 1px solid #e0dfd5; }

.address-details { display: flex; flex-direction: column; gap: 6px; flex-grow: 1; }
.location-name { font-size: 16px; font-weight: 600; color: #333; }
.phone-text { font-size: 13px; color: #666; font-weight: 400; }
.address-text { font-size: 14px; color: #555; line-height: 1.5; background: #faf9f5; padding: 10px 12px; border-radius: 8px; border: 1px solid #eee; margin-top: 5px;}
.address-note { font-size: 12px; color: #888; margin-bottom: 4px; }
.edit-address-btn { background: white; border: 1px solid #557c61; color: #557c61; padding: 4px 14px; border-radius: 15px; font-size: 12px; font-weight: 500; cursor: pointer; align-self: flex-start; transition: 0.2s; font-family: inherit;}
.edit-address-btn:hover { background: #f4faeb; }

.edit-address-form { display: flex; flex-direction: column; gap: 10px; margin-top: 5px; }
.edit-textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical; outline: none; transition: 0.2s; }
.edit-textarea:focus { border-color: #557c61; box-shadow: 0 0 0 3px rgba(85, 124, 97, 0.1); }
.geocoding-status-banner {
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeIn 0.2s ease;
}
.geocoding-status-banner.loading {
  background-color: #f0f7ff;
  color: #0366d6;
  border: 1px solid #c8e1ff;
}
.geocoding-status-banner.success {
  background-color: #f0fff4;
  color: #22863a;
  border: 1px solid #dcffe4;
}
.spin-icon {
  display: inline-block;
  animation: spin 1s infinite linear;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-3px); }
  to { opacity: 1; transform: translateY(0); }
}
.edit-actions { display: flex; gap: 10px; justify-content: flex-end; }
.cancel-edit-btn { background: white; border: 1px solid #ddd; color: #666; padding: 6px 14px; border-radius: 15px; font-size: 12px; cursor: pointer; font-family: inherit; }
.save-edit-btn { background: #557c61; border: none; color: white; padding: 6px 14px; border-radius: 15px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
.save-edit-btn:hover { background: #405e49; }
.save-edit-btn:disabled { background: #a0b5a7; cursor: not-allowed; }

.delivery-time-box { display: flex; justify-content: space-between; align-items: center; border: 1px solid #e0dfd5; border-radius: 12px; padding: 15px 20px; }
.time-type { font-weight: 600; font-size: 14px; color: #333; }
.time-range { font-size: 13px; color: #666; }

.payment-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 8px;
}
.payment-security-badge {
  font-size: 11px;
  color: #2e7d32;
  background: #edf7ed;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Primary Payment Grid */
.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
@media (max-width: 640px) {
  .payment-methods-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 480px) {
  .payment-methods-grid {
    grid-template-columns: 1fr;
  }
}
.payment-card {
  border: 1.5px solid #e0dfd5;
  border-radius: 14px;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}
.payment-card:hover {
  border-color: #557c61;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.04);
}
.payment-card.active {
  border-color: #557c61;
  background: #fcfbf8;
  box-shadow: 0 0 0 2px #557c61;
}
.payment-card .pay-icon { font-size: 24px; }
.payment-card .pay-title { font-size: 13px; font-weight: 600; color: #333; line-height: 1.2; }
.payment-card .pay-sub { font-size: 11px; color: #888; }

/* Card Checkout Container */
.card-checkout-container {
  background: #fafaf8;
  border: 1px solid #e5e4dc;
  border-radius: 16px;
  padding: 20px;
  margin-top: 15px;
  animation: fadeIn 0.2s ease;
}
.card-container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}
.card-header-left {
  display: flex;
  flex-direction: column;
}
.card-section-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.card-instruction {
  font-size: 11px;
  color: #777;
}
/* Manual Card Brand Selector */
.card-brand-selection-area {
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #ebe9df;
}
.brand-selection-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}
.card-brand-chips {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
@media (max-width: 600px) {
  .card-brand-chips {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 400px) {
  .card-brand-chips {
    grid-template-columns: repeat(2, 1fr);
  }
}
.brand-chip-btn {
  background: white;
  border: 1.5px solid #dcd8cd;
  border-radius: 12px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.brand-chip-btn:hover {
  border-color: #557c61;
  background: #fdfcf9;
  transform: translateY(-1px);
}
.card-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 1px;
  border-radius: 4px;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.card-brand-svg {
  display: block;
  border-radius: 2.5px;
}
.chip-brand-title {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}
.chip-check {
  font-size: 11px;
  font-weight: 800;
  margin-left: 2px;
}
.brand-chip-btn.active {
  border-width: 2px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.12);
}
.brand-chip-btn:nth-child(1).active {
  background: #1a1f71;
  border-color: #1a1f71;
}
.brand-chip-btn:nth-child(1).active .chip-brand-title,
.brand-chip-btn:nth-child(1).active .chip-check {
  color: white;
}
.brand-chip-btn:nth-child(2).active {
  background: #eb001b;
  border-color: #eb001b;
}
.brand-chip-btn:nth-child(2).active .chip-brand-title,
.brand-chip-btn:nth-child(2).active .chip-check {
  color: white;
}
.brand-chip-btn:nth-child(3).active {
  background: #005697;
  border-color: #005697;
}
.brand-chip-btn:nth-child(3).active .chip-brand-title,
.brand-chip-btn:nth-child(3).active .chip-check {
  color: white;
}
.brand-chip-btn:nth-child(4).active {
  background: #016fd0;
  border-color: #016fd0;
}
.brand-chip-btn:nth-child(4).active .chip-brand-title,
.brand-chip-btn:nth-child(4).active .chip-check {
  color: white;
}
.brand-chip-btn:nth-child(5).active {
  background: #c51d24;
  border-color: #c51d24;
}
.brand-chip-btn:nth-child(5).active .chip-brand-title,
.brand-chip-btn:nth-child(5).active .chip-check {
  color: white;
}

.card-input-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.card-field-group label {
  font-size: 12px;
  font-weight: 500;
  color: #555;
}
.card-styled-input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #d9d8d0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  font-family: inherit;
  outline: none;
  transition: 0.2s;
}
.card-styled-input:focus {
  border-color: #557c61;
  box-shadow: 0 0 0 3px rgba(85, 124, 97, 0.12);
}
.card-number-wrapper, .cvc-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.detected-badge {
  position: absolute;
  right: 12px;
  background: #557c61;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  pointer-events: none;
}
.cvc-hint {
  position: absolute;
  right: 12px;
  font-size: 14px;
  opacity: 0.6;
}
.card-row-split {
  display: flex;
  gap: 12px;
}
.save-card-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}
.save-card-checkbox input {
  accent-color: #557c61;
  width: 16px;
  height: 16px;
}



/* 3D-Secure / Card Processing Modal */
.card-processing-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}
.card-processing-card {
  background: white;
  border-radius: 20px;
  width: 380px;
  max-width: 100%;
  padding: 30px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.18);
  animation: popIn 0.25s ease;
}
.processing-top-badge {
  background: #f0f4f1;
  color: #2f533a;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 20px;
  margin-bottom: 20px;
}
.processing-icon-area {
  margin-bottom: 16px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.processing-spinner-box {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.secure-spinner {
  width: 60px;
  height: 60px;
  border: 3px solid #e0e0e0;
  border-top-color: #557c61;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}
.secure-shield-icon {
  position: absolute;
  font-size: 24px;
}
.processing-success-box {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e8f5e9;
  color: #2e7d32;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  animation: popIn 0.3s ease;
}
.processing-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}
.processing-message {
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.4;
}
.processing-amount-box {
  background: #f9f9f7;
  border: 1px solid #ebe9df;
  border-radius: 12px;
  padding: 12px 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.amount-label { font-size: 13px; color: #777; }
.amount-val { font-size: 18px; color: #557c61; }
.processing-footer-badge {
  font-size: 11px;
  color: #999;
}

.right-section { width: 360px; }
.summary-card { background: white; border-radius: 16px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); display: flex; flex-direction: column; border: 1px solid #e5e2d5; }
.summary-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 20px; }

.order-items-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; max-height: 350px; overflow-y: auto; }
.order-item { display: flex; align-items: flex-start; gap: 12px; }
.item-badge { background: #f1ede1; color: #444; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; margin-top: 2px; }
.item-info { flex-grow: 1; display: flex; flex-direction: column; gap: 3px; }
.item-name { font-size: 14px; font-weight: 600; color: #333; }
.item-sub { font-size: 12px; color: #777; display: flex; flex-wrap: wrap; gap: 5px; }
.item-price { font-size: 14px; font-weight: 600; color: #333; }

.price-breakdown { display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px; }
.breakdown-row { display: flex; justify-content: space-between; font-size: 14px; color: #555; }
.free-shipping-text { color: #557c61; font-size: 11px; font-weight: 600; background: #eef2ed; padding: 2px 6px; border-radius: 6px; margin-left: 5px; }
.free-shipping-price { color: #557c61; font-weight: 600; }

.net-total-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 15px; margin-bottom: 20px; font-size: 16px; font-weight: 600; color: #333; }
.total-price-highlight { color: #557c61; font-size: 22px; font-weight: 700; }

.confirm-checkout-btn { background: #557c61; color: white; border: none; width: 100%; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s; text-align: center; font-family: inherit; }
.confirm-checkout-btn:hover { background: #405e49; }
.confirm-checkout-btn:disabled { background: #ccc; cursor: not-allowed; }

/* ================= PromptPay Modal Styles ================= */
.qr-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  animation: modalFadeIn 0.2s ease-out;
}

.qr-modal-card {
  background: white;
  width: 100%;
  max-width: 380px;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.qr-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f0eee6;
  background: #ffffff;
}

.qr-header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qr-header-badge {
  background: #eef5f0;
  color: #3e7654;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.qr-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.qr-close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #888;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: 0.2s;
}

.qr-close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.thai-qr-header {
  background: #003764;
  color: white;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.thai-qr-brand {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.brand-thai {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.brand-sub {
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 1px;
  opacity: 0.85;
}

.promptpay-pill {
  background: white;
  color: #003764;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.qr-display-section {
  padding: 18px 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fafaf8;
}

.qr-image-wrapper {
  background: white;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid #e8e6dc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #888;
  font-size: 12px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e0dfd5;
  border-top-color: #557c61;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.qr-scan-hint {
  font-size: 12px;
  color: #666;
  margin-top: 10px;
  font-weight: 400;
}

.qr-payment-info {
  padding: 14px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #f0eee6;
  background: white;
}

.qr-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: #777;
}

.info-value {
  color: #222;
}

.font-medium {
  font-weight: 500;
}

.font-mono {
  font-family: monospace;
  font-weight: 600;
  color: #003764;
}

.qr-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  margin-top: 4px;
  border-top: 1px dashed #e5e2d5;
  font-size: 15px;
  font-weight: 600;
  color: #222;
}

.qr-total-amount {
  color: #557c61;
  font-size: 22px;
  font-weight: 700;
}

.qr-modal-actions {
  padding: 14px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
}

.confirm-qr-btn {
  background: #557c61;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.confirm-qr-btn:hover {
  background: #405e49;
}

.cancel-qr-btn {
  background: #f7f6f0;
  color: #666;
  border: 1px solid #e0dfd5;
  padding: 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: 0.2s;
  text-align: center;
}

.cancel-qr-btn:hover {
  background: #eae8df;
  color: #333;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ===================================================
   PROMOTION & COUPON STYLES (ONLINE DELIVERY ONLY)
   =================================================== */
.promo-section {
  margin: 16px 0;
  padding: 14px;
  background: #fdfbf7;
  border: 1px dashed #d9d4c7;
  border-radius: 12px;
}

.promo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.promo-title {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 4px;
}

.promo-view-all {
  font-size: 12px;
  color: #ff6b35;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.promo-view-all:hover {
  text-decoration: underline;
  opacity: 0.85;
}

.promo-input-group {
  display: flex;
  gap: 8px;
}

.promo-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dcd8cd;
  border-radius: 8px;
  font-size: 13px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: white;
  transition: border-color 0.2s;
}

.promo-input:focus {
  outline: none;
  border-color: #557c61;
}

.promo-input:disabled {
  background: #f0eee6;
  color: #777;
}

.promo-apply-btn {
  background: #557c61;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.promo-apply-btn:hover:not(:disabled) {
  background: #405e49;
}

.promo-apply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.promo-remove-btn {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.promo-remove-btn:hover {
  background: #fecaca;
}

.promo-alert {
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
}

.promo-alert.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

.promo-alert.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  font-weight: 500;
}

.my-coupons-box {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #ece7dc;
}

.my-coupons-title {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.coupon-chips-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 150px;
  overflow-y: auto;
}

.coupon-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 10px;
  background: white;
  border: 1px solid #e2ddd3;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.coupon-chip:hover:not(.chip-disabled) {
  border-color: #557c61;
  background: #fbfdfc;
  transform: translateX(2px);
}

.coupon-chip.chip-selected {
  border-color: #557c61;
  background: #eef7f1;
  box-shadow: 0 0 0 1px #557c61;
}

.coupon-chip.chip-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f4f0;
}

.chip-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chip-code {
  font-size: 12px;
  font-weight: 700;
  color: #ff6b35;
  background: #fff3ed;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.chip-desc {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.chip-sub {
  font-size: 11px;
  color: #888;
}

.promo-login-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}

.promo-login-hint a {
  color: #ff6b35;
  font-weight: 600;
  text-decoration: underline;
}

.breakdown-row.discount-row {
  color: #16a34a;
  font-weight: 600;
}

.discount-price {
  color: #16a34a;
  font-weight: 700;
}

/* ===================================================
   MANDATORY VAT 7% SYSTEM STYLES
   =================================================== */
.tax-breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 10px;
  background: #f0f9ff;
  border: 1px dashed #bae6fd;
  border-radius: 8px;
  margin: 4px 0;
}

.tax-info-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.tax-info-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tax-main-label {
  font-size: 13px;
  font-weight: 600;
  color: #0369a1;
}

.tax-mandate-badge {
  font-size: 10px;
  font-weight: 700;
  color: #0284c7;
  background: #e0f2fe;
  padding: 1px 6px;
  border-radius: 4px;
}

.tax-formula-detail {
  font-size: 11px;
  color: #0284c7;
  font-weight: 500;
}

.tax-amount-highlight {
  color: #0284c7;
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
}

.tax-summary-hint {
  font-size: 11px;
  font-weight: 400;
  color: #64748b;
  margin-top: 2px;
}

/* 📍 สไตล์สำหรับพิกัด GPS ของลูกค้า */
.gps-pinned-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 8px 12px;
  border-radius: 10px;
  margin: 8px 0;
}

.gps-badge-icon {
  font-size: 16px;
}

.gps-badge-info {
  flex: 1;
  font-size: 12px;
  color: #166534;
}

.gps-badge-title {
  font-weight: 700;
  margin-right: 4px;
}

.gps-badge-coords {
  font-family: monospace;
  font-weight: 600;
}

.gps-badge-tag {
  background: #22c55e;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  letter-spacing: 0.3px;
}

.gps-notice-banner {
  font-size: 11px;
  color: #15803d;
  background: #dcfce7;
  padding: 6px 10px;
  border-radius: 8px;
  margin-bottom: 6px;
}

.address-action-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.gps-pin-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
}

.gps-pin-btn:hover:not(:disabled) {
  background: #047857;
}

.gps-pin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gps-latlng-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 8px;
}

.gps-field-col {
  display: flex;
  flex-direction: column;
}

.edit-field-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 4px;
}

.gps-coord-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
}

.gps-coord-input:focus {
  outline: none;
  border-color: #059669;
}

.gps-detect-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.gps-detect-btn:hover {
  background: #e2e8f0;
}

/* 🎟️ สไตล์เลือกคูปองโปรโมชั่น */
.my-coupons-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.open-picker-pill-btn {
  background: #ff6b35;
  color: white;
  border: none;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
}

.open-picker-pill-btn:hover {
  background: #e85924;
}

/* Modal สำหรับเลือกคูปอง */
.coupon-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.coupon-modal-card {
  background: white;
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 80vh;
  overflow: hidden;
}

.coupon-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.coupon-modal-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coupon-modal-icon {
  font-size: 20px;
}

.coupon-modal-title {
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.coupon-modal-close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.coupon-modal-close-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.coupon-modal-body {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}

.modal-coupon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-coupon-item:hover:not(.not-eligible) {
  border-color: #ff6b35;
  background: #fffbf9;
}

.modal-coupon-item.is-applied {
  border-color: #16a34a;
  background: #f0fdf4;
}

.modal-coupon-item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.item-code-badge {
  font-size: 13px;
  font-weight: 800;
  color: #ea580c;
  letter-spacing: 0.5px;
}

.item-val {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.item-cond {
  font-size: 11px;
  color: #64748b;
}

.apply-pill-btn {
  padding: 6px 14px;
  border-radius: 9999px;
  border: none;
  background: #ff6b35;
  color: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.apply-pill-btn.btn-using {
  background: #16a34a;
}

.empty-coupons-modal {
  text-align: center;
  padding: 24px;
  color: #64748b;
  font-size: 13px;
}

.goto-promos-link {
  display: inline-block;
  margin-top: 8px;
  color: #ff6b35;
  font-weight: 700;
  text-decoration: underline;
}

/* ===================================================
   TOTAL CALORIES (พลังงานรวมทั้งมื้อ) NUTRITION STYLES
   =================================================== */
.item-cal-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #d97706;
  background: #fef3c7;
  padding: 1px 6px;
  border-radius: 6px;
  margin-top: 4px;
  font-weight: 600;
  width: fit-content;
}

.item-cal-tag .fire-icon {
  font-size: 11px;
}

.item-cal-multiplier {
  color: #b45309;
  font-weight: 700;
}

.calories-summary-box {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1.5px solid #fde68a;
  border-radius: 14px;
  padding: 14px 16px;
  margin-top: 14px;
  margin-bottom: 6px;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
}

.cal-box-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.cal-title-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  color: #b45309;
  background: rgba(254, 243, 199, 0.9);
  border: 1px solid #fcd34d;
  padding: 1px 8px;
  border-radius: 9999px;
  width: fit-content;
}

.cal-box-title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
  margin: 0;
}

.cal-number-right {
  display: flex;
  align-items: baseline;
  gap: 3px;
  background: white;
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid #fde68a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.cal-total-value {
  font-size: 18px;
  font-weight: 800;
  color: #d97706;
  font-family: monospace, sans-serif;
}

.cal-total-unit {
  font-size: 11px;
  font-weight: 700;
  color: #b45309;
}

.cal-progress-section {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cal-progress-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(253, 230, 138, 0.5);
  border-radius: 9999px;
  overflow: hidden;
}

.cal-progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.cal-fill-healthy {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.cal-fill-balanced {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.cal-fill-high {
  background: linear-gradient(90deg, #ea580c, #f97316);
}

.cal-progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #78350f;
  flex-wrap: wrap;
  gap: 4px;
}

.cal-meta-desc {
  font-size: 10.5px;
  color: #92400e;
}

.cal-status-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
}

.cal-status-tag.healthy {
  background: #dcfce7;
  color: #15803d;
}

.cal-status-tag.balanced {
  background: #fef3c7;
  color: #b45309;
}

.cal-status-tag.high {
  background: #ffedd5;
  color: #c2410c;
}

/* Rows in Breakdown */
.calories-breakdown-row {
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  padding: 6px 10px;
  border-radius: 6px;
  margin: 4px 0 8px 0;
}

.cal-breakdown-label {
  font-size: 12px;
  font-weight: 700;
  color: #b45309;
  display: flex;
  align-items: center;
  gap: 5px;
}

.cal-breakdown-value {
  font-size: 13px;
  font-weight: 800;
  color: #d97706;
}
</style>