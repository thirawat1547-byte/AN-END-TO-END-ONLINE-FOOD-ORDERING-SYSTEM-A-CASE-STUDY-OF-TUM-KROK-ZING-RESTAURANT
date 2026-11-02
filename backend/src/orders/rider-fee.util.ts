// คำนวณค่ารอบไรเดอร์ตามระยะทาง (แบบเดียวกับแอปเดลิเวอรี่ทั่วไป)
// ค่ารอบ = ค่าเริ่มต้น (ครอบคลุม rider_free_km กม.แรก) + rider_fee_per_km × กม.ที่เกิน (ปัดขึ้นเป็นกิโลเต็ม)

// ระยะทางเส้นตรงคูณค่าประมาณเส้นทางถนนจริง (ถนนมักไกลกว่าเส้นตรงราว 30%)
const ROAD_FACTOR = 1.3;

export interface RiderFeeSettings {
  base_rider_fee?: number | string | { toString(): string } | null;
  rider_free_km?: number | string | { toString(): string } | null;
  rider_fee_per_km?: number | string | { toString(): string } | null;
  store_lat?: number | string | { toString(): string } | null;
  store_lng?: number | string | { toString(): string } | null;
}

const num = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// คืนค่า distance_km = 0 เมื่อไม่มีพิกัดร้านหรือพิกัดลูกค้า (คิดค่ารอบเริ่มต้นอย่างเดียว)
export function calcRiderFee(settings: RiderFeeSettings | null | undefined, customerLat?: unknown, customerLng?: unknown) {
  const baseFee = num(settings?.base_rider_fee, 40);
  const freeKm = num(settings?.rider_free_km, 3);
  const perKm = num(settings?.rider_fee_per_km, 7);
  const storeLat = Number(settings?.store_lat);
  const storeLng = Number(settings?.store_lng);
  const lat = Number(customerLat);
  const lng = Number(customerLng);

  if (!storeLat || !storeLng || !lat || !lng) {
    return { distance_km: 0, rider_fee: baseFee };
  }

  const distanceKm = Math.round(haversineKm(storeLat, storeLng, lat, lng) * ROAD_FACTOR * 100) / 100;
  const extraKm = Math.max(0, Math.ceil(distanceKm - freeKm));
  return { distance_km: distanceKm, rider_fee: baseFee + extraKm * perKm };
}
