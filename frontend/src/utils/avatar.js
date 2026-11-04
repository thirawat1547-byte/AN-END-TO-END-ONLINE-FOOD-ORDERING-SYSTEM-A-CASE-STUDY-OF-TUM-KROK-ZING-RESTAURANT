// ตัวอักษรย่อจากชื่อผู้ใช้ ใช้แทนรูปโปรไฟล์เมื่อผู้ใช้ไม่มีรูปของตัวเอง
export function getInitial(name) {
  const chars = Array.from(String(name || '').trim());
  // ข้ามสระหน้าภาษาไทย (เ แ โ ใ ไ) เพื่อให้ได้พยัญชนะตัวแรก เช่น "เอก" -> "อ"
  const first = chars.find((c) => !/[เ-ไ\s]/.test(c));
  return first ? first.toUpperCase() : '👤';
}

// ชื่อที่ใช้แสดงจากข้อมูลผู้ใช้ที่เก็บไว้ตอนล็อกอิน
export function getStoredUserName() {
  try {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    return profile.name || profile.username || '';
  } catch (e) {
    return '';
  }
}
