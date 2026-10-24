import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

// กำหนด Custom Swal เพื่อให้ดีไซน์กลมกลืนกับฟอนต์ Prompt และธีมร้านตำครกซิ่ง
export const CustomSwal = Swal.mixin({
  customClass: {
    popup: 'tkz-swal-popup',
    title: 'tkz-swal-title',
    htmlContainer: 'tkz-swal-html',
    confirmButton: 'tkz-swal-confirm',
    cancelButton: 'tkz-swal-cancel',
    timerProgressBar: 'tkz-swal-progress'
  },
  buttonsStyling: true,
  confirmButtonColor: '#557c61',
  cancelButtonColor: '#ef4444',
  color: '#334155'
})

export const showSuccess = (title, textOrHtml = '', options = {}) => {
  const isHtml = options.isHtml || (typeof textOrHtml === 'string' && textOrHtml.includes('<'))
  return CustomSwal.fire({
    icon: 'success',
    title,
    [isHtml ? 'html' : 'text']: textOrHtml,
    timer: options.timer !== undefined ? options.timer : 2000,
    timerProgressBar: options.timerProgressBar ?? true,
    showConfirmButton: options.showConfirmButton ?? (options.timer ? false : true),
    confirmButtonText: options.confirmButtonText || 'ตกลง',
    ...options
  })
}

export const showError = (title, textOrHtml = '', options = {}) => {
  const isHtml = options.isHtml || (typeof textOrHtml === 'string' && textOrHtml.includes('<'))
  return CustomSwal.fire({
    icon: 'error',
    title,
    [isHtml ? 'html' : 'text']: textOrHtml,
    showConfirmButton: true,
    confirmButtonText: options.confirmButtonText || 'ตกลง',
    ...options
  })
}

export const showWarning = (title, textOrHtml = '', options = {}) => {
  const isHtml = options.isHtml || (typeof textOrHtml === 'string' && textOrHtml.includes('<'))
  return CustomSwal.fire({
    icon: 'warning',
    title,
    [isHtml ? 'html' : 'text']: textOrHtml,
    showConfirmButton: true,
    confirmButtonText: options.confirmButtonText || 'ตกลง',
    ...options
  })
}

export const showInfo = (title, textOrHtml = '', options = {}) => {
  const isHtml = options.isHtml || (typeof textOrHtml === 'string' && textOrHtml.includes('<'))
  return CustomSwal.fire({
    icon: 'info',
    title,
    [isHtml ? 'html' : 'text']: textOrHtml,
    showConfirmButton: true,
    confirmButtonText: options.confirmButtonText || 'ตกลง',
    ...options
  })
}

export const showConfirm = (title, textOrHtml = '', options = {}) => {
  const isHtml = options.isHtml || (typeof textOrHtml === 'string' && textOrHtml.includes('<'))
  return CustomSwal.fire({
    icon: options.icon || 'question',
    title,
    [isHtml ? 'html' : 'text']: textOrHtml,
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'ยืนยัน',
    cancelButtonText: options.cancelButtonText || 'ยกเลิก',
    reverseButtons: true,
    ...options
  })
}

/**
 * ดักจับ window.alert เดิมของเบราว์เซอร์ เพื่อเปลี่ยนเป็น SweetAlert2 Popup สวยๆ อัตโนมัติทุกจุด
 */
export const initGlobalAlertInterceptor = () => {
  if (typeof window === 'undefined') return

  window.alert = (message) => {
    const raw = String(message ?? '').trim()
    let icon = 'info'
    let title = 'แจ้งเตือน'

    // ทำความสะอาดข้อความจากสัญลักษณ์เตือนเดิม (เช่น 🔒, ⚠️, 🛑, 🎉)
    let cleanMessage = raw
      .replace(/^[\s🛑⚠️🔒🎉✨]+/, '')
      .trim()

    if (
      raw.includes('สำเร็จ') ||
      raw.includes('เรียบร้อย') ||
      raw.includes('ขอบคุณ') ||
      raw.includes('🎉')
    ) {
      icon = 'success'
      title = 'ทำรายการสำเร็จ'
    } else if (
      raw.includes('ไม่สำเร็จ') ||
      raw.includes('เกิดข้อผิดพลาด') ||
      raw.includes('ไม่สามารถ') ||
      raw.includes('ล้มเหลว') ||
      raw.includes('ผิดพลาด')
    ) {
      icon = 'error'
      title = 'เกิดข้อผิดพลาด'
    } else if (
      raw.includes('กรุณา') ||
      raw.includes('ขออภัย') ||
      raw.includes('สิทธิ์') ||
      raw.includes('ปิด') ||
      raw.includes('หมด') ||
      raw.includes('⚠️') ||
      raw.includes('🔒') ||
      raw.includes('🛑')
    ) {
      icon = 'warning'
      title = 'แจ้งเตือน'
    }

    const htmlFormatted = cleanMessage.replace(/\n/g, '<br>')

    return CustomSwal.fire({
      icon,
      title,
      html: htmlFormatted || raw,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#557c61'
    })
  }
}

export default CustomSwal
