// โหลด Stripe.js จาก js.stripe.com (Stripe กำหนดให้โหลดจากโดเมนของ Stripe เท่านั้น)
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// ถ้ายังไม่ได้ตั้งค่า key จริง ให้ซ่อนตัวเลือกจ่ายด้วยบัตรไว้ก่อน
export const isCardPaymentEnabled = Boolean(publishableKey) && !publishableKey.includes('placeholder');

let stripePromise = null;

export function loadStripe() {
  if (!isCardPaymentEnabled) {
    return Promise.reject(new Error('ยังไม่ได้ตั้งค่า VITE_STRIPE_PUBLISHABLE_KEY'));
  }
  if (stripePromise) return stripePromise;

  stripePromise = new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve(window.Stripe(publishableKey));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      if (window.Stripe) resolve(window.Stripe(publishableKey));
      else reject(new Error('โหลด Stripe.js ไม่สำเร็จ'));
    };
    script.onerror = () => reject(new Error('โหลด Stripe.js ไม่สำเร็จ'));
    document.head.appendChild(script);
  }).catch((err) => {
    // ให้ลองโหลดใหม่ได้ในครั้งถัดไป
    stripePromise = null;
    throw err;
  });

  return stripePromise;
}
