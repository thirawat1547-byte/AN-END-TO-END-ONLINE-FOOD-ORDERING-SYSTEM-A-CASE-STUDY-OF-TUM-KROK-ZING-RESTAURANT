// คำนวณค่ารอบไรเดอร์ตามระยะทาง (Rider Delivery Fee)
// สูตรคำนวณใหม่: riderFee = base + per_step * Math.floor(km / step_km)
// คำนวณจากระยะทางเส้นตรง (Haversine distance) ตรงๆ ทันที (ยกเลิกตัวคูณ ROAD_FACTOR)

export interface RiderFeeSettings {
  base_rider_fee?: number | string | { toString(): string } | null;
  rider_fee_step_km?: number | string | { toString(): string } | null;
  rider_fee_per_step?: number | string | { toString(): string } | null;
  store_lat?: number | string | { toString(): string } | null;
  store_lng?: number | string | { toString(): string } | null;
  // ฟิลด์สูตรเดิมสำหรับ backward compatibility
  rider_free_km?: number | string | { toString(): string } | null;
  rider_fee_per_km?: number | string | { toString(): string } | null;
}

const num = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// คืนค่า distance_km = 0 เมื่อไม่มีพิกัดร้านหรือพิกัดลูกค้า (คิดค่ารอบเริ่มต้น base อย่างเดียว)
export function calcRiderFee(settings: RiderFeeSettings | null | undefined, customerLat?: unknown, customerLng?: unknown) {
  const base = num(settings?.base_rider_fee, 15);
  const stepKm = num(settings?.rider_fee_step_km, 2);
  const perStep = num(settings?.rider_fee_per_step, 5);
  const safeStepKm = stepKm > 0 ? stepKm : 2;

  const storeLat = Number(settings?.store_lat);
  const storeLng = Number(settings?.store_lng);
  const lat = Number(customerLat);
  const lng = Number(customerLng);

  if (!storeLat || !storeLng || !lat || !lng) {
    return { distance_km: 0, rider_fee: base };
  }

  // คำนวณจากระยะทางเส้นตรง (Haversine distance) ตรงๆ ไม่คูณ ROAD_FACTOR
  const distanceKm = Math.round(haversineKm(storeLat, storeLng, lat, lng) * 100) / 100;
  const steps = Math.floor(distanceKm / safeStepKm);
  const riderFee = base + perStep * Math.max(0, steps);

  return { distance_km: distanceKm, rider_fee: riderFee };
}
