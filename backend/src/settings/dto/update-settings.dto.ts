export class UpdateSettingsDto {
  store_name?: string;
  tagline?: string;
  promptpay_number?: string;
  promptpay_name?: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  open_time?: string;
  close_time?: string;
  is_open?: boolean;
  base_delivery_fee?: number;
  delivery_fee_per_km?: number;
  max_delivery_km?: number;
  min_order_delivery?: number;
  base_rider_fee?: number;
  vat_rate?: number;
}
