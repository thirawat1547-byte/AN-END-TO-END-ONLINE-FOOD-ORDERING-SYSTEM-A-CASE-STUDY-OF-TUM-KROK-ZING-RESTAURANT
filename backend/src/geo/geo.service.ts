import {
  Injectable,
  Logger,
  BadGatewayException,
  NotFoundException,
} from '@nestjs/common';
import {
  AddressDetailsDto,
  ReverseGeocodeResponseDto,
  SearchAddressItemDto,
} from './dto/geo-response.dto';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  // In-memory Cache สำหรับเก็บผลลัพธ์ (TTL 24 ชั่วโมง)
  private readonly cache = new Map<string, CacheItem<any>>();
  private readonly cacheTtlMs = 24 * 60 * 60 * 1000;

  // คิวจำกัดความถี่การยิง OpenStreetMap Nominatim (Rate Limiting: ไม่เกิน 1 req/sec)
  private lastRequestTime = 0;
  private queue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  private getUserAgent(): string {
    return (
      process.env.NOMINATIM_USER_AGENT ||
      'TumKrokZing/1.0 (+https://tumkrokzing.duckdns.org)'
    );
  }

  /**
   * คิวจัดสรรการเรียก Nominatim ไม่ให้เกิน 1 คำขอต่อวินาที
   */
  private scheduleRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.queue.length === 0) return;
    this.isProcessingQueue = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      const minIntervalMs = 1050; // หน่วงเวลาอย่างน้อย 1,050ms ระหว่างแต่ละ request ตามนโยบาย Nominatim

      if (elapsed < minIntervalMs) {
        await new Promise((resolve) => setTimeout(resolve, minIntervalMs - elapsed));
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        await task();
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * แปลงที่อยู่วัตถุจาก OSM ให้เป็นฟิลด์มาตรฐานไทย
   */
  private formatAddress(rawAddress: any): AddressDetailsDto {
    if (!rawAddress || typeof rawAddress !== 'object') {
      return {
        house_number: '',
        road: '',
        subdistrict: '',
        district: '',
        province: '',
        postcode: '',
      };
    }

    const house_number =
      rawAddress.house_number ||
      rawAddress.building ||
      rawAddress.house_name ||
      '';

    const road =
      rawAddress.road ||
      rawAddress.street ||
      rawAddress.pedestrian ||
      rawAddress.path ||
      rawAddress.footway ||
      rawAddress.highway ||
      '';

    const subdistrict =
      rawAddress.subdistrict ||
      rawAddress.suburb ||
      rawAddress.neighbourhood ||
      rawAddress.quarter ||
      rawAddress.village ||
      rawAddress.hamlet ||
      '';

    const district =
      rawAddress.district ||
      rawAddress.city_district ||
      rawAddress.county ||
      rawAddress.city ||
      rawAddress.town ||
      rawAddress.municipality ||
      '';

    const province =
      rawAddress.province ||
      rawAddress.state ||
      rawAddress.region ||
      rawAddress.state_district ||
      '';

    const postcode = rawAddress.postcode || '';

    return {
      house_number,
      road,
      subdistrict,
      district,
      province,
      postcode,
    };
  }

  /**
   * 1. แปลงพิกัดย้อนกลับ (Reverse Geocoding)
   *    - ปัดเศษพิกัดละติจูด/ลองจิจูดทศนิยม 4 ตำแหน่ง (~10 เมตร) เป็น Cache Key เพื่อลดการยิงซ้ำ
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResponseDto> {
    const latNum = Number(lat);
    const lngNum = Number(lng);

    // ปัดเศษ 4 ตำแหน่งทศนิยม
    const cacheKey = `reverse:${latNum.toFixed(4)},${lngNum.toFixed(4)}`;

    // ตรวจสอบ Cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    // เรียกผ่าน Queue Throttler
    const result = await this.scheduleRequest<ReverseGeocodeResponseDto>(async () => {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latNum}&lon=${lngNum}&accept-language=th`;
      const userAgent = this.getUserAgent();

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': userAgent,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new BadGatewayException(
            `Nominatim API error: HTTP status ${response.status}`,
          );
        }

        const data: any = await response.json();
        if (data.error) {
          throw new NotFoundException(
            data.error || 'ไม่พบข้อมูลที่อยู่ตามพิกัดที่ระบุ',
          );
        }

        const formattedAddress = this.formatAddress(data.address);
        const displayName = data.display_name || 'ไม่ทราบชื่อสถานที่';

        const output: ReverseGeocodeResponseDto = {
          lat: latNum,
          lng: lngNum,
          display_name: displayName,
          address: formattedAddress,
        };

        return output;
      } catch (err: any) {
        if (err instanceof NotFoundException || err instanceof BadGatewayException) {
          throw err;
        }
        this.logger.error(`Reverse geocoding failed: ${err.message}`, err.stack);
        throw new BadGatewayException('ไม่สามารถเชื่อมต่อบริการแปลงพิกัด OpenStreetMap ได้');
      }
    });

    // บันทึกลง Cache
    this.cache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + this.cacheTtlMs,
    });

    return result;
  }

  /**
   * 2. ค้นหาที่อยู่ (Search Address)
   *    - ใช้ Keyword การค้นหาเป็น Cache Key
   */
  async searchAddress(q: string): Promise<SearchAddressItemDto[]> {
    const trimmed = (q || '').trim();
    if (!trimmed) {
      return [];
    }

    const cacheKey = `search:${trimmed.toLowerCase()}`;

    // ตรวจสอบ Cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    // เรียกผ่าน Queue Throttler
    const result = await this.scheduleRequest<SearchAddressItemDto[]>(async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        trimmed,
      )}&countrycodes=th&accept-language=th`;
      const userAgent = this.getUserAgent();

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': userAgent,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new BadGatewayException(
            `Nominatim API error: HTTP status ${response.status}`,
          );
        }

        const data: any = await response.json();
        if (!Array.isArray(data)) {
          return [];
        }

        const items: SearchAddressItemDto[] = data.map((item: any) => ({
          place_id: item.place_id,
          display_name: item.display_name || '',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.address ? this.formatAddress(item.address) : undefined,
        }));

        return items;
      } catch (err: any) {
        if (err instanceof BadGatewayException) {
          throw err;
        }
        this.logger.error(`Search address failed: ${err.message}`, err.stack);
        throw new BadGatewayException('ไม่สามารถเชื่อมต่อบริการค้นหาที่อยู่ OpenStreetMap ได้');
      }
    });

    // บันทึกลง Cache
    this.cache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + this.cacheTtlMs,
    });

    return result;
  }
}

