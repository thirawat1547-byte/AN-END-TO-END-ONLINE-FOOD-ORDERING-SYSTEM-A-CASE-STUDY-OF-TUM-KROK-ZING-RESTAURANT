import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

export interface StoreSettings {
  id: number;
  store_name: string;
  tagline: string;
  promptpay_number: string;
  promptpay_name: string;
  tax_id: string;
  address: string;
  phone: string;
  open_time: string;
  close_time: string;
  is_open: boolean;
  base_delivery_fee: number;
  delivery_fee_per_km: number;
  max_delivery_km: number;
  min_order_delivery: number;
  base_rider_fee: number;
  vat_rate: number;
}

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureSettingsTable();
  }

  private async ensureSettingsTable() {
    try {
      const existing = await this.prisma.storeSetting.findUnique({ where: { id: 1 } });
      if (!existing) {
        await this.prisma.storeSetting.create({
          data: {
            id: 1,
            store_name: 'ร้านตำครกซิ่ง (Tum Krok Zing)',
            tagline: 'แซ่บนัว ถึงใจ อาหารอีสานแท้รสเด็ด',
            promptpay_number: '081-234-5678',
            promptpay_name: 'นายธีรวัฒน์ แสนคำเฮียง (ตำครกซิ่ง)',
            tax_id: '0105566099881',
            address: '123/45 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210',
            phone: '02-987-6543, 081-234-5678',
            open_time: '10:30',
            close_time: '22:00',
            is_open: true,
            base_delivery_fee: 20.00,
            delivery_fee_per_km: 10.00,
            max_delivery_km: 15.00,
            min_order_delivery: 100.00,
            base_rider_fee: 40.00,
            vat_rate: 7.00,
          },
        });
        this.logger.log('Initialized default STORE_SETTINGS record');
      }
    } catch (err) {
      this.logger.error('Failed to initialize STORE_SETTINGS table', err);
    }
  }

  async getSettings(): Promise<StoreSettings> {
    try {
      const row = await this.prisma.storeSetting.findUnique({ where: { id: 1 } });
      if (row) {
        return {
          id: row.id,
          store_name: row.store_name,
          tagline: row.tagline || '',
          promptpay_number: row.promptpay_number || '',
          promptpay_name: row.promptpay_name || '',
          tax_id: row.tax_id || '',
          address: row.address || '',
          phone: row.phone || '',
          open_time: row.open_time || '10:30',
          close_time: row.close_time || '22:00',
          is_open: Boolean(row.is_open),
          base_delivery_fee: Number(row.base_delivery_fee || 20.00),
          delivery_fee_per_km: Number(row.delivery_fee_per_km || 10.00),
          max_delivery_km: Number(row.max_delivery_km || 15.00),
          min_order_delivery: Number(row.min_order_delivery || 100.00),
          base_rider_fee: Number(row.base_rider_fee || 40.00),
          vat_rate: Number(row.vat_rate || 7.00),
        };
      }
    } catch (err) {
      this.logger.warn('Could not query STORE_SETTINGS, falling back to default', err);
    }

    return {
      id: 1,
      store_name: 'ร้านตำครกซิ่ง (Tum Krok Zing)',
      tagline: 'แซ่บนัว ถึงใจ อาหารอีสานแท้รสเด็ด',
      promptpay_number: '081-234-5678',
      promptpay_name: 'นายธีรวัฒน์ แสนคำเฮียง (ตำครกซิ่ง)',
      tax_id: '0105566099881',
      address: '123/45 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210',
      phone: '02-987-6543, 081-234-5678',
      open_time: '10:30',
      close_time: '22:00',
      is_open: true,
      base_delivery_fee: 20.00,
      delivery_fee_per_km: 10.00,
      max_delivery_km: 15.00,
      min_order_delivery: 100.00,
      base_rider_fee: 40.00,
      vat_rate: 7.00,
    };
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<StoreSettings> {
    await this.ensureSettingsTable();

    await this.prisma.storeSetting.update({
      where: { id: 1 },
      data: {
        ...(dto.store_name !== undefined && { store_name: dto.store_name }),
        ...(dto.tagline !== undefined && { tagline: dto.tagline }),
        ...(dto.promptpay_number !== undefined && { promptpay_number: dto.promptpay_number }),
        ...(dto.promptpay_name !== undefined && { promptpay_name: dto.promptpay_name }),
        ...(dto.tax_id !== undefined && { tax_id: dto.tax_id }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.open_time !== undefined && { open_time: dto.open_time }),
        ...(dto.close_time !== undefined && { close_time: dto.close_time }),
        ...(dto.is_open !== undefined && { is_open: dto.is_open }),
        ...(dto.base_delivery_fee !== undefined && { base_delivery_fee: dto.base_delivery_fee }),
        ...(dto.delivery_fee_per_km !== undefined && { delivery_fee_per_km: dto.delivery_fee_per_km }),
        ...(dto.max_delivery_km !== undefined && { max_delivery_km: dto.max_delivery_km }),
        ...(dto.min_order_delivery !== undefined && { min_order_delivery: dto.min_order_delivery }),
        ...(dto.base_rider_fee !== undefined && { base_rider_fee: dto.base_rider_fee }),
        ...(dto.vat_rate !== undefined && { vat_rate: dto.vat_rate }),
      },
    });

    return this.getSettings();
  }

  async toggleStatus(): Promise<StoreSettings> {
    const current = await this.getSettings();
    const newStatus = !current.is_open;
    return this.updateSettings({ is_open: newStatus });
  }
}
