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
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS STORE_SETTINGS (
          id INT PRIMARY KEY,
          store_name VARCHAR(150) NOT NULL DEFAULT 'ร้านตำครกซิ่ง (Tum Krok Zing)',
          tagline VARCHAR(255) DEFAULT 'แซ่บนัว ถึงใจ อาหารอีสานแท้รสเด็ด',
          promptpay_number VARCHAR(50) DEFAULT '081-234-5678',
          promptpay_name VARCHAR(150) DEFAULT 'นายธีรวัฒน์ แสนคำเฮียง (ตำครกซิ่ง)',
          tax_id VARCHAR(50) DEFAULT '0105566099881',
          address VARCHAR(255) DEFAULT '123/45 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210',
          phone VARCHAR(100) DEFAULT '02-987-6543, 081-234-5678',
          open_time VARCHAR(20) DEFAULT '10:30',
          close_time VARCHAR(20) DEFAULT '22:00',
          is_open BOOLEAN NOT NULL DEFAULT TRUE,
          vat_rate DECIMAL(5,2) DEFAULT 7.00,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);

      const rows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT id FROM STORE_SETTINGS WHERE id = 1 LIMIT 1;
      `);

      if (!rows || rows.length === 0) {
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO STORE_SETTINGS (id, store_name, tagline, promptpay_number, promptpay_name, tax_id, address, phone, open_time, close_time, is_open, vat_rate)
          VALUES (1, 'ร้านตำครกซิ่ง (Tum Krok Zing)', 'แซ่บนัว ถึงใจ อาหารอีสานแท้รสเด็ด', '081-234-5678', 'นายธีรวัฒน์ แสนคำเฮียง (ตำครกซิ่ง)', '0105566099881', '123/45 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210', '02-987-6543, 081-234-5678', '10:30', '22:00', TRUE, 7.00);
        `);
        this.logger.log('Initialized default STORE_SETTINGS record');
      }
    } catch (err) {
      this.logger.error('Failed to initialize STORE_SETTINGS table', err);
    }
  }

  async getSettings(): Promise<StoreSettings> {
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM STORE_SETTINGS WHERE id = 1 LIMIT 1;
      `);

      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          store_name: row.store_name,
          tagline: row.tagline,
          promptpay_number: row.promptpay_number,
          promptpay_name: row.promptpay_name,
          tax_id: row.tax_id,
          address: row.address,
          phone: row.phone,
          open_time: row.open_time,
          close_time: row.close_time,
          is_open: Boolean(row.is_open),
          vat_rate: Number(row.vat_rate || 7),
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
      vat_rate: 7,
    };
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<StoreSettings> {
    await this.ensureSettingsTable();

    const current = await this.getSettings();
    const updated = {
      store_name: dto.store_name !== undefined ? dto.store_name : current.store_name,
      tagline: dto.tagline !== undefined ? dto.tagline : current.tagline,
      promptpay_number: dto.promptpay_number !== undefined ? dto.promptpay_number : current.promptpay_number,
      promptpay_name: dto.promptpay_name !== undefined ? dto.promptpay_name : current.promptpay_name,
      tax_id: dto.tax_id !== undefined ? dto.tax_id : current.tax_id,
      address: dto.address !== undefined ? dto.address : current.address,
      phone: dto.phone !== undefined ? dto.phone : current.phone,
      open_time: dto.open_time !== undefined ? dto.open_time : current.open_time,
      close_time: dto.close_time !== undefined ? dto.close_time : current.close_time,
      is_open: dto.is_open !== undefined ? dto.is_open : current.is_open,
      vat_rate: dto.vat_rate !== undefined ? dto.vat_rate : current.vat_rate,
    };

    await this.prisma.$executeRawUnsafe(
      `UPDATE STORE_SETTINGS 
       SET store_name = ?, tagline = ?, promptpay_number = ?, promptpay_name = ?, tax_id = ?, address = ?, phone = ?, open_time = ?, close_time = ?, is_open = ?, vat_rate = ?
       WHERE id = 1;`,
      updated.store_name,
      updated.tagline,
      updated.promptpay_number,
      updated.promptpay_name,
      updated.tax_id,
      updated.address,
      updated.phone,
      updated.open_time,
      updated.close_time,
      updated.is_open ? 1 : 0,
      updated.vat_rate,
    );

    return this.getSettings();
  }

  async toggleStatus(): Promise<StoreSettings> {
    const current = await this.getSettings();
    const newStatus = !current.is_open;
    return this.updateSettings({ is_open: newStatus });
  }
}
