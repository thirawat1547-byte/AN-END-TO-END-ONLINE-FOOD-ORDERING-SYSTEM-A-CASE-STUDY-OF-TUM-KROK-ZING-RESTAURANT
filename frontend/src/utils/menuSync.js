// src/utils/menuSync.js
import { socket } from '../config/socket';

/**
 * รายการสารก่อภูมิแพ้มาตรฐานพร้อมไอคอนสำหรับระบบร้านอาหาร
 */
export const DEFAULT_ALLERGENS = [
  { allergen_id: 1, allergen_name: 'กุ้ง / อาหารทะเล', icon: '🦐' },
  { allergen_id: 2, allergen_name: 'ถั่วลิสง', icon: '🥜' },
  { allergen_id: 3, allergen_name: 'นม / ผลิตภัณฑ์นม', icon: '🥛' },
  { allergen_id: 4, allergen_name: 'กลูเตน / แป้งสาลี', icon: '🌾' },
  { allergen_id: 5, allergen_name: 'ไข่', icon: '🥚' },
  { allergen_id: 6, allergen_name: 'ปลาหมึก', icon: '🦑' },
  { allergen_id: 7, allergen_name: 'ปู', icon: '🦀' },
  { allergen_id: 8, allergen_name: 'ถั่วเหลือง / ซอสถั่วเหลือง', icon: '🫘' },
  { allergen_id: 9, allergen_name: 'ปลา / น้ำปลา / ปลาร้า', icon: '🐟' }
];

// BroadcastChannel สำหรับซิงก์ข้อมูลข้ามแท็บภายในเบราว์เซอร์เดียวกันแบบทันที (Zero-latency)
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('tumkrokzing_menu_realtime_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported:', e);
}

/**
 * ฟังก์ชันกระจายสัญญาณ Real-time เมื่อมีการแก้ไขข้อมูลเมนูหรือสารก่อภูมิแพ้
 * รองรับ 4 ช่องทางพร้อมกันเพื่อความเสถียรสูงสุด:
 * 1. Socket.io (ข้ามอุปกรณ์ / เครื่องเครือข่าย)
 * 2. BroadcastChannel (ข้ามแท็บเบราว์เซอร์)
 * 3. LocalStorage Event (ข้ามแท็บเบราว์เซอร์สำรอง)
 * 4. Window CustomEvent (ภายในหน้าต่างเดียวกัน)
 */
export function broadcastMenuUpdated(menu) {
  if (!menu) return;

  // 1. Socket.io
  try {
    if (socket && socket.connected) {
      socket.emit('menu_updated', menu);
    }
  } catch (err) {
    console.warn('Socket broadcast error:', err);
  }

  // 2. BroadcastChannel
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'menu_updated', menu });
    }
  } catch (err) {
    console.warn('BroadcastChannel post error:', err);
  }

  // 3. LocalStorage StorageEvent
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const payload = {
        type: 'menu_updated',
        menu,
        timestamp: Date.now()
      };
      localStorage.setItem('tumkrok_realtime_menu_event', JSON.stringify(payload));
    }
  } catch (err) {
    console.warn('LocalStorage broadcast error:', err);
  }

  // 4. Window CustomEvent
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tumkrok_local_menu_updated', { detail: menu }));
    }
  } catch (err) {
    console.warn('Window CustomEvent broadcast error:', err);
  }
}

/**
 * ฟังก์ชันลงทะเบียนรับฟังสัญญาณการอัปเดตเมนูแบบ Real-time
 * @param {Function} callback ฟังก์ชันที่จะถูกเรียกเมื่อมีการอัปเดตเมนู (รับพารามิเตอร์ updatedMenu)
 * @returns {Function} ฟังก์ชัน unsubscribe สำหรับล้าง listener เมื่อคอมโพเนนต์ถูกทำลาย (unmount)
 */
export function onMenuUpdated(callback) {
  if (typeof callback !== 'function') return () => {};

  // 1. Socket.io listener
  const socketHandler = (data) => {
    try {
      callback(data);
    } catch (e) {
      console.error('Socket on menu_updated handler error:', e);
    }
  };
  if (socket) {
    socket.on('menu_updated', socketHandler);
  }

  // 2. BroadcastChannel listener
  const bcHandler = (event) => {
    if (event?.data?.type === 'menu_updated' && event?.data?.menu) {
      try {
        callback(event.data.menu);
      } catch (e) {
        console.error('BroadcastChannel handler error:', e);
      }
    }
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', bcHandler);
  }

  // 3. StorageEvent listener
  const storageHandler = (event) => {
    if (event.key === 'tumkrok_realtime_menu_event' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed?.menu) {
          callback(parsed.menu);
        }
      } catch (e) {
        console.error('StorageEvent handler error:', e);
      }
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageHandler);
  }

  // 4. Window CustomEvent listener
  const customEventHandler = (event) => {
    if (event?.detail) {
      try {
        callback(event.detail);
      } catch (e) {
        console.error('CustomEvent handler error:', e);
      }
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('tumkrok_local_menu_updated', customEventHandler);
  }

  // คืนค่า cleanup function
  return () => {
    if (socket) {
      socket.off('menu_updated', socketHandler);
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', bcHandler);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('tumkrok_local_menu_updated', customEventHandler);
    }
  };
}

/**
 * แมปรายการ allergen_ids เป็น Object รายชื่อสารก่อภูมิแพ้พร้อมไอคอน
 */
export function resolveAllergenBadges(allergenIds, customAllergens = DEFAULT_ALLERGENS) {
  if (!allergenIds || !Array.isArray(allergenIds) || allergenIds.length === 0) {
    return [];
  }
  const idSet = new Set(allergenIds.map(Number));
  return customAllergens.filter(a => idSet.has(Number(a.allergen_id)));
}

/**
 * ดึงข้อความเตือนสรุปสารก่อภูมิแพ้ เช่น "กุ้ง / อาหารทะเล, ปลาหมึก"
 */
export function formatAllergenSummary(allergenIds, customAllergens = DEFAULT_ALLERGENS) {
  const badges = resolveAllergenBadges(allergenIds, customAllergens);
  if (badges.length === 0) return '';
  return badges.map(b => b.allergen_name).join(', ');
}
