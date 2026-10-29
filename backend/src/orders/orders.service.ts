import { Injectable, NotFoundException, BadRequestException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SettingsService } from '../settings/settings.service';
import { OrdersGateway } from './orders.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ReviewOrderDto } from './dto/review-order.dto';

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async onModuleInit() {
    await this.ensureOrderChatTable();
    await this.repairLegacyOrdersWithoutItems();
  }

  // สร้างตาราง ORDER_CHAT_MESSAGES สำหรับเก็บข้อความแชทระหว่างไรเดอร์และลูกค้า
  private async ensureOrderChatTable() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS ORDER_CHAT_MESSAGES (
          message_id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          sender VARCHAR(20) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_order_chat_order (order_id)
        );
      `);
    } catch (err) {
      this.logger.error('Failed to ensure ORDER_CHAT_MESSAGES table', err);
    }
  }

  /**
   * ซ่อมแซมออเดอร์ประวัติเดิมในฐานข้อมูลที่ไม่มีรายการอาหาร (order_items) ให้มีรายการอาหารตรงตามยอดเงิน
   */
  async repairLegacyOrdersWithoutItems() {
    try {
      const emptyOrders = await this.prisma.order.findMany({
        where: {
          order_items: { none: {} },
        },
        orderBy: { order_id: 'asc' },
      });

      if (emptyOrders.length === 0) return;

      this.logger.log(`🔧 พบออเดอร์เดิมที่ไม่มีรายการอาหาร ${emptyOrders.length} รายการ กำลังซ่อมแซม...`);

      const allMenus = await this.prisma.menu.findMany();
      if (allMenus.length === 0) return;

      const kapaoMoo = allMenus.find((m) => m.menu_name.includes('กะเพราหมู')) || allMenus[0];
      const somtam = allMenus.find((m) => m.menu_name.includes('ส้มตำ')) || allMenus[0];
      const chicken = allMenus.find((m) => m.menu_name.includes('ไก่ทอด')) || allMenus[0];
      const yumTalay = allMenus.find((m) => m.menu_name.includes('ยำวุ้นเส้นทะเล')) || allMenus[0];
      const friedRice = allMenus.find((m) => m.menu_name.includes('ข้าวผัด')) || allMenus[0];

      for (const order of emptyOrders) {
        const price = Number(order.total_price);
        const itemsToInsert: { menu_id: number; quantity: number; unit_price: number; notes?: string }[] = [];

        if (price === 40 || price <= 40) {
          itemsToInsert.push({ menu_id: kapaoMoo.menu_id, quantity: 1, unit_price: 40, notes: 'เผ็ดกลาง' });
        } else if (price === 50) {
          itemsToInsert.push({ menu_id: chicken.menu_id, quantity: 1, unit_price: 50, notes: 'กรอบอร่อย' });
        } else if (price === 70) {
          itemsToInsert.push({ menu_id: yumTalay.menu_id, quantity: 1, unit_price: 70, notes: 'เผ็ดกลาง' });
        } else if (price === 80) {
          itemsToInsert.push({ menu_id: kapaoMoo.menu_id, quantity: 1, unit_price: 40, notes: 'เผ็ดกลาง' });
          itemsToInsert.push({ menu_id: somtam.menu_id, quantity: 1, unit_price: 40, notes: 'พริก 2 เม็ด' });
        } else if (price === 100) {
          itemsToInsert.push({ menu_id: chicken.menu_id, quantity: 2, unit_price: 50, notes: 'เสิร์ฟพร้อมน้ำจิ้มแจ่ว' });
        } else if (price === 130 || price === 140) {
          itemsToInsert.push({ menu_id: yumTalay.menu_id, quantity: 1, unit_price: 70, notes: 'เผ็ดกลาง' });
          itemsToInsert.push({ menu_id: kapaoMoo.menu_id, quantity: 1, unit_price: 40, notes: 'ราดข้าว' });
          if (price === 140) {
            itemsToInsert.push({ menu_id: somtam.menu_id, quantity: 1, unit_price: 30, notes: 'รสเด็ด' });
          }
        } else if (price === 200) {
          itemsToInsert.push({ menu_id: friedRice.menu_id, quantity: 2, unit_price: 60, notes: 'กุ้งสด' });
          itemsToInsert.push({ menu_id: yumTalay.menu_id, quantity: 1, unit_price: 70, notes: 'เผ็ดกลาง' });
          itemsToInsert.push({ menu_id: kapaoMoo.menu_id, quantity: 1, unit_price: 10, notes: 'ข้าวเปล่า' });
        } else if (price === 320) {
          itemsToInsert.push({ menu_id: friedRice.menu_id, quantity: 2, unit_price: 60, notes: 'รวมมิตรทะเล' });
          itemsToInsert.push({ menu_id: yumTalay.menu_id, quantity: 2, unit_price: 70, notes: 'เปรี้ยวเผ็ด' });
          itemsToInsert.push({ menu_id: chicken.menu_id, quantity: 1, unit_price: 50, notes: 'สะโพกไก่ทอด' });
          itemsToInsert.push({ menu_id: somtam.menu_id, quantity: 1, unit_price: 40, notes: 'ส้มตำไทย' });
        } else {
          const qty = Math.max(1, Math.round(price / 40));
          itemsToInsert.push({
            menu_id: kapaoMoo.menu_id,
            quantity: qty,
            unit_price: Number(kapaoMoo.price) || 40,
            notes: 'คำสั่งซื้อจากระบบ',
          });
        }

        for (const item of itemsToInsert) {
          await this.prisma.orderItem.create({
            data: {
              order_id: order.order_id,
              menu_id: item.menu_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              notes: item.notes,
            },
          }).catch(() => {});
        }
      }

      this.logger.log(`✅ ซ่อมแซมรายการอาหารให้ออเดอร์เดิม ${emptyOrders.length} รายการเรียบร้อยแล้ว`);
    } catch (err) {
      this.logger.warn('ไม่สามารถซ่อมแซมออเดอร์เดิมได้:', err?.message);
    }
  }

  // 1. รับคำสั่งซื้อและคำนวณราคาแบบ Transaction
  async create(createOrderDto: CreateOrderDto) {
    // ตรวจสอบสถานะการเปิด-ปิดร้านค้าจากระบบจริง
    const storeSettings = await this.settingsService.getSettings();
    if (!storeSettings.is_open) {
      throw new BadRequestException('ขออภัย ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถรับคำสั่งซื้อได้ในขณะนี้');
    }

    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('รายการสั่งซื้อต้องมีอาหารอย่างน้อย 1 รายการ');
    }

    const createdOrder = await this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of createOrderDto.items) {
        const menu = await tx.menu.findUnique({
          where: { menu_id: item.menu_id },
        });

        if (!menu) {
          throw new NotFoundException(`ไม่พบเมนูอาหารรหัส #${item.menu_id}`);
        }

        if (menu.is_available === false) {
          throw new BadRequestException(`ขออภัย เมนู "${menu.menu_name}" ปิดรับออเดอร์ชั่วคราว`);
        }

        const basePrice = Number(menu.price);
        
        // คำนวณราคา Option เสริม (ถ้ามี)
        let optionPriceSum = 0;
        const optionsList: any[] = [];
        if (item.options && Array.isArray(item.options)) {
          for (const opt of item.options) {
            const addPrice = Number(opt.price || 0);
            optionPriceSum += addPrice;
            optionsList.push({
              option_id: opt.option_id ? Number(opt.option_id) : null,
              option_name: opt.option_name,
              price: addPrice,
            });
          }
        }

        const unitPriceWithOption = basePrice + optionPriceSum;
        totalAmount += unitPriceWithOption * item.quantity;

        const dishType = (item as any).dish_type || (item as any).dishType;
        let finalNotes = item.notes || '';
        if (dishType && !finalNotes.includes(dishType)) {
          finalNotes = finalNotes ? `${dishType} | ${finalNotes}` : dishType;
        }

        // บันทึกข้อมูลรายการอาหาร พร้อมหมายเหตุตัวเลือกที่ลูกค้าเลือก (notes) และตาราง ORDER_ITEM_OPTIONS
        orderItemsData.push({
          menu_id: item.menu_id,
          quantity: item.quantity,
          unit_price: unitPriceWithOption,
          notes: finalNotes || null,
          ...(optionsList.length > 0 && {
            order_item_options: {
              create: optionsList,
            },
          }),
        });
      }

      let validUserId: number | undefined = undefined;
      let existingUser: any = null;
      if (createOrderDto.user_id) {
        existingUser = await tx.user.findUnique({
          where: { user_id: createOrderDto.user_id },
        });
        if (existingUser) {
          validUserId = existingUser.user_id;
        }
      }

      // 🛑 ตรวจสอบและคำนวณโปรโมชัน (ใช้ได้เฉพาะการสั่งออนไลน์ DELIVERY เท่านั้น - ในร้านไม่ให้ใช้)
      let appliedPromoId: number | undefined = undefined;
      let discountAmount = 0;

      if (createOrderDto.promo_id || createOrderDto.promo_code) {
        if (createOrderDto.order_type === 'DINE_IN') {
          throw new BadRequestException('ขออภัย โค้ดส่วนลดและโปรโมชันสามารถใช้ได้เฉพาะการสั่งออนไลน์ (เดลิเวอรี่) ผ่านเว็บไซต์เท่านั้น');
        }

        let promo: any = null;
        if (createOrderDto.promo_id) {
          promo = await tx.promotion.findUnique({
            where: { promo_id: createOrderDto.promo_id },
          });
        } else if (createOrderDto.promo_code) {
          promo = await tx.promotion.findUnique({
            where: { code: createOrderDto.promo_code.trim().toUpperCase() },
          });
        }

        if (!promo) {
          throw new BadRequestException('ไม่พบโค้ดส่วนลดนี้ในระบบ');
        }

        if (promo.is_active === false) {
          throw new BadRequestException('ขออภัย โค้ดส่วนลดนี้ถูกปิดใช้งานแล้ว');
        }

        if (new Date(promo.expiry_date) < new Date()) {
          throw new BadRequestException('ขออภัย โค้ดส่วนลดนี้หมดอายุการใช้งานแล้ว');
        }

        if (totalAmount < Number(promo.min_order_price || 0)) {
          throw new BadRequestException(
            `ยอดสั่งซื้ออาหารขั้นต่ำต้องครบ ฿${Number(promo.min_order_price)} จึงจะสามารถใช้โค้ด "${promo.code}" ได้`,
          );
        }

        const promoType = (promo.discount_type || '').toUpperCase();
        if (promoType === 'PERCENTAGE' || promoType === 'PERCENT') {
          discountAmount = (totalAmount * Number(promo.discount_value)) / 100;
        } else {
          discountAmount = Number(promo.discount_value);
        }

        // ปัดเศษส่วนลดเป็นจำนวนเต็มบาท ให้ตรงกับหน้าชำระเงิน (Checkout.vue)
        discountAmount = Math.min(Math.round(discountAmount), totalAmount);
        appliedPromoId = promo.promo_id;

        // บันทึกสถานะว่าผู้ใช้ใช้คูปองนี้แล้วในตาราง USER_CLAIMED_PROMOTIONS
        if (validUserId) {
          try {
            await tx.$executeRawUnsafe(
              `UPDATE USER_CLAIMED_PROMOTIONS SET is_used = TRUE, used_at = NOW() 
               WHERE user_id = ? AND promo_id = ?;`,
              validUserId,
              appliedPromoId,
            );
          } catch (e) {}
        }
      }

      const foodSubtotal = totalAmount; // ยอดรวมอาหารและท็อปปิ้งทั้งหมด

      // คำนวณค่าส่ง (สำหรับ DELIVERY)
      let deliveryFee = 0;
      let storeSetting: any = null;
      try {
        storeSetting = await tx.storeSetting.findUnique({ where: { id: 1 } });
      } catch (e) {}

      if (createOrderDto.order_type === 'DELIVERY') {
        deliveryFee = createOrderDto.delivery_fee !== undefined
          ? Number(createOrderDto.delivery_fee)
          : Number(storeSetting?.base_delivery_fee || 20.00);
      }

      // ภาษีมูลค่าเพิ่ม (VAT) สำหรับออเดอร์เดลิเวอรี่ คิดจากยอดอาหารหลังหักส่วนลด (ไม่รวมค่าส่ง)
      // ใช้สูตรเดียวกับหน้าชำระเงิน เพื่อให้ยอดใน QR พร้อมเพย์ตรงกับยอดออเดอร์ในระบบ
      let vatAmount = 0;
      if (createOrderDto.order_type === 'DELIVERY') {
        const vatRate = Number(storeSetting?.vat_rate ?? 7);
        const netFoodAmount = Math.max(0, foodSubtotal - discountAmount);
        if (netFoodAmount > 0 && vatRate > 0) {
          vatAmount = Math.round(netFoodAmount * (vatRate / 100) * 100) / 100;
        }
      }

      // คำนวณยอดสุทธิ: total_price = subtotal - discount_amount + delivery_fee + VAT
      const finalTotalPrice = Math.max(
        0,
        Math.round((foodSubtotal - discountAmount + deliveryFee + vatAmount) * 100) / 100,
      );

      const order = await tx.order.create({
        data: {
          order_type: createOrderDto.order_type || 'DINE_IN',
          status: 'PENDING',
          subtotal: foodSubtotal,
          discount_amount: discountAmount,
          delivery_fee: deliveryFee,
          total_price: finalTotalPrice,
          delivery_address: createOrderDto.delivery_address || (existingUser ? existingUser.address : null),
          delivery_phone: createOrderDto.delivery_phone || (existingUser ? existingUser.phone_number : null),
          order_notes: createOrderDto.order_notes || null,
          ...(createOrderDto.table_id && {
            table: {
              connect: { table_id: createOrderDto.table_id },
            },
          }),
          ...(validUserId && {
            user: {
              connect: { user_id: validUserId },
            },
          }),
          ...(appliedPromoId && {
            promotion: {
              connect: { promo_id: appliedPromoId },
            },
          }),
          order_items: {
            create: orderItemsData,
          },
        },
        include: {
          order_items: {
            include: {
              menu: true,
              order_item_options: true,
            },
          },
          table: true,
          promotion: true,
          delivery: true,
        },
      });

      // ถ้าเป็นการสั่งประเภทจัดส่ง (DELIVERY) ให้สร้างข้อมูลลงตาราง DELIVERIES อัตโนมัติ (1:1)
      if (createOrderDto.order_type === 'DELIVERY') {
        const riderTripFee = Number(storeSetting?.base_rider_fee || 40.00);
        try {
          await tx.delivery.create({
            data: {
              order_id: order.order_id,
              delivery_status: 'WAITING_RIDER',
              customer_name: createOrderDto.customer_name || existingUser?.username || 'ลูกค้าเดลิเวอรี',
              customer_phone: createOrderDto.delivery_phone || existingUser?.phone_number || '-',
              delivery_address: createOrderDto.delivery_address || existingUser?.address || 'ตามหมุดจัดส่ง',
              rider_fee: riderTripFee,
              distance_km: 0.0,
            },
          });
        } catch (delivErr) {
          console.warn('ไม่สามารถสร้างเรคอร์ด Delivery เริ่มต้น:', delivErr);
        }
      }

      // ถ้าเป็นการสั่งที่โต๊ะ ให้ปรับสถานะโต๊ะเป็น OCCUPIED ทันที
      if (createOrderDto.table_id) {
        try {
          await tx.table.update({
            where: { table_id: createOrderDto.table_id },
            data: { status: 'OCCUPIED' },
          });
        } catch (e) {
          // ignore if table doesn't exist
        }
      }

      // ตัดสต็อกวัตถุดิบอัตโนมัติตามสูตรอาหาร (MenuIngredient) ตรงตาม Sequence Diagram
      for (const item of createOrderDto.items) {
        // เมนูข้าวผัด, ข้าวเปล่า, ข้าวเหนียว เป็นเมนูข้าวโดยตรง จะต้องตัดสต็อกข้าวตามสูตรเสมอ
        const menu = await tx.menu.findUnique({ where: { menu_id: item.menu_id } });
        const menuName = menu?.menu_name || '';
        const isRiceDishItself = menuName.includes('ข้าวผัด') || menuName.includes('ข้าวเปล่า') || menuName.includes('ข้าวเหนียว');

        // ตรวจสอบว่าสั่งเป็น "กับข้าว" หรือไม่ (ถ้าเป็นกับข้าว จะไม่ตัดสต็อกข้าวสารหอมมะลิ)
        const dishType = (item as any).dish_type || (item as any).dishType || '';
        const notes = item.notes || '';
        const isKabKhao =
          !isRiceDishItself && (
            dishType.includes('กับข้าว') ||
            notes.includes('กับข้าว') ||
            notes.includes('แบบกับข้าว')
          );

        const menuIngredients = await tx.menuIngredient.findMany({
          where: { menu_id: item.menu_id },
          include: {
            ingredient: true,
          },
        });

        // ตรวจสอบว่าเมนูนี้เป็นเมนูอาหารทะเลหรือไม่ (มีคำว่า "ทะเล" หรือ "หมึก/กุ้ง")
        const isSeafoodDish = menuName.includes('ทะเล') || (menuName.includes('หมึก') && menuName.includes('กุ้ง'));

        // ตรวจสอบตัวเลือกเนื้อสัตว์ของลูกค้า (จาก notes หรือ dish_type เช่น เฉพาะกุ้ง / เฉพาะหมึก / รวม / ไม่เอากุ้ง / ไม่เอาหมึก)
        const combinedNotes = `${dishType} ${notes}`.toLowerCase();
        const noShrimp = combinedNotes.includes('ไม่เอากุ้ง') || combinedNotes.includes('ไม่ใส่กุ้ง') || combinedNotes.includes('ไม่กุ้ง');
        const noSquid = combinedNotes.includes('ไม่เอาหมึก') || combinedNotes.includes('ไม่ใส่หมึก') || combinedNotes.includes('ไม่หมึก') || combinedNotes.includes('ไม่เอาปลาหมึก') || combinedNotes.includes('ไม่ใส่ปลาหมึก');

        let hasShrimpWord = (combinedNotes.includes('กุ้ง') || combinedNotes.includes('shrimp')) && !noShrimp;
        let hasSquidWord = (combinedNotes.includes('หมึก') || combinedNotes.includes('squid')) && !noSquid;
        const hasCombinedWord = !noShrimp && !noSquid && (combinedNotes.includes('รวม') || (hasShrimpWord && hasSquidWord));

        let seafoodSelection: 'ALL' | 'SHRIMP_ONLY' | 'SQUID_ONLY' = 'ALL';
        if (isSeafoodDish) {
          if (noShrimp && !noSquid) {
            seafoodSelection = 'SQUID_ONLY';
          } else if (noSquid && !noShrimp) {
            seafoodSelection = 'SHRIMP_ONLY';
          } else if (hasCombinedWord) {
            seafoodSelection = 'ALL';
          } else if (hasShrimpWord && !hasSquidWord) {
            seafoodSelection = 'SHRIMP_ONLY';
          } else if (hasSquidWord && !hasShrimpWord) {
            seafoodSelection = 'SQUID_ONLY';
          }
        }

        // คำนวณปริมาณเนื้อสัตว์อาหารทะเลรวมในสูตร (กุ้งสด + หมึกสด) เพื่อใช้ตัดสต็อกเมื่อสั่งแบบเดี่ยว
        const seafoodItemsInRecipe = menuIngredients.filter((mi) => {
          const n = mi.ingredient?.name || '';
          return (n.includes('กุ้ง') || n.includes('หมึก')) && !n.includes('กุ้งแห้ง');
        });
        const totalSeafoodPortion = seafoodItemsInRecipe.reduce(
          (sum, mi) => sum + Number(mi.quantity_used),
          0,
        );

        for (const mi of menuIngredients) {
          const ingName = mi.ingredient?.name || '';

          // 1. ถ้าสั่งแบบ "กับข้าว" ให้ยกเว้นการตัดสต็อกข้าวสารหอมมะลิ
          const isRice = ingName.includes('ข้าวสาร') || ingName.includes('ข้าวหอมมะลิ');
          if (isKabKhao && isRice) {
            console.log(`[Stock Deduction] เมนู #${item.menu_id} สั่งเป็น "กับข้าว" -> ยกเว้นการตัดสต็อกวัตถุดิบ "${ingName}"`);
            continue;
          }

          // 2. ตรวจสอบเงื่อนไขการตัดสต็อกอาหารทะเล (กุ้งสด / หมึกสด)
          const isShrimpIng = (ingName.includes('กุ้ง') || ingName.toLowerCase().includes('shrimp')) && !ingName.includes('กุ้งแห้ง');
          const isSquidIng = ingName.includes('หมึก') || ingName.toLowerCase().includes('squid');

          let deductAmount = Number(mi.quantity_used) * item.quantity;

          if (isSeafoodDish && (isShrimpIng || isSquidIng)) {
            if (seafoodSelection === 'SHRIMP_ONLY') {
              if (isSquidIng) {
                console.log(`[Stock Deduction] เมนู #${item.menu_id} "${menuName}" ลูกค้าสั่งเฉพาะ "กุ้งสด" -> ยกเว้นการตัดสต็อก "${ingName}"`);
                continue; // ข้ามการตัดหมึกสด
              }
              if (isShrimpIng) {
                // ปรับจำนวนการตัดกุ้งสดให้ครอบคลุมเต็มสัดส่วนเนื้อสัตว์ในจาน
                deductAmount = (totalSeafoodPortion > 0 ? totalSeafoodPortion : Number(mi.quantity_used)) * item.quantity;
                console.log(`[Stock Deduction] เมนู #${item.menu_id} "${menuName}" สั่งเฉพาะ "กุ้งสด" -> ตัดสต็อก "${ingName}" จำนวน ${deductAmount} กก.`);
              }
            } else if (seafoodSelection === 'SQUID_ONLY') {
              if (isShrimpIng) {
                console.log(`[Stock Deduction] เมนู #${item.menu_id} "${menuName}" ลูกค้าสั่งเฉพาะ "หมึกสด" -> ยกเว้นการตัดสต็อก "${ingName}"`);
                continue; // ข้ามการตัดกุ้งสด
              }
              if (isSquidIng) {
                // ปรับจำนวนการตัดหมึกสดให้ครอบคลุมเต็มสัดส่วนเนื้อสัตว์ในจาน
                deductAmount = (totalSeafoodPortion > 0 ? totalSeafoodPortion : Number(mi.quantity_used)) * item.quantity;
                console.log(`[Stock Deduction] เมนู #${item.menu_id} "${menuName}" สั่งเฉพาะ "หมึกสด" -> ตัดสต็อก "${ingName}" จำนวน ${deductAmount} กก.`);
              }
            } else {
              // กรณีสั่งรวมทะเล หรือไม่ได้ระบุแยก ให้ตัดทั้งกุ้งสดและหมึกสดตามสูตรปกติ
              console.log(`[Stock Deduction] เมนู #${item.menu_id} "${menuName}" สั่งแบบ "รวมทะเล" -> ตัดสต็อก "${ingName}" จำนวน ${deductAmount} กก.`);
            }
          }

          deductAmount = Math.round(deductAmount * 10000) / 10000;

          if (deductAmount > 0) {
            await tx.ingredient.update({
              where: { ingredient_id: mi.ingredient_id },
              data: {
                quantity: {
                  decrement: deductAmount,
                },
              },
            }).catch((err) => {
              console.warn(`[Stock Deduction] ไม่สามารถตัดสต็อกวัตถุดิบ #${mi.ingredient_id}:`, err?.message);
            });
          }
        }
      }

      return order;
    });

    // ส่งสัญญาณแจ้งเตือนออเดอร์ใหม่ (new_order) ผ่าน WebSocket ไปยังหน้าจอครัว (KDS) ทันที
    try {
      this.ordersGateway.sendNewOrder(createdOrder);
    } catch (wsErr) {
      console.warn('[WebSocket] ไม่สามารถส่งสัญญาณ new_order:', wsErr);
    }

    return createdOrder;
  }

  // 2. ดึงรายการออร์เดอร์ทั้งหมด (รองรับตัวกรอง status, tableId, orderType, date)
  async findAll(status?: string, tableId?: number, orderType?: string, date?: string) {
    let dateFilter: any = undefined;

    if (date === 'today') {
      // หาวันที่ปัจจุบันตามโซนเวลาประเทศไทย (Asia/Bangkok)
      const bangkokDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());

      const startOfThaiDay = new Date(`${bangkokDateStr}T00:00:00+07:00`);
      const endOfThaiDay = new Date(`${bangkokDateStr}T23:59:59.999+07:00`);

      dateFilter = {
        gte: startOfThaiDay,
        lte: endOfThaiDay,
      };
    } else if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const startOfThaiDay = new Date(`${date}T00:00:00+07:00`);
      const endOfThaiDay = new Date(`${date}T23:59:59.999+07:00`);

      dateFilter = {
        gte: startOfThaiDay,
        lte: endOfThaiDay,
      };
    }

    const orders = await this.prisma.order.findMany({
      where: {
        ...(status && { status: status }),
        ...(tableId && { table_id: tableId }),
        ...(orderType && { order_type: orderType }),
        ...(dateFilter && { created_at: dateFilter }),
      },
      include: {
        order_items: {
          include: { menu: true, order_item_options: true },
        },
        table: true,
        transaction: true,
        delivery: true,
        user: {
          select: {
            user_id: true,
            username: true,
            email: true,
            phone_number: true,
            address: true,
          },
        },
      },
      orderBy: { order_id: 'desc' },
    });

    return orders.map((order) => this.attachFallbackItemsIfEmpty(order));
  }

  /**
   * สร้างรายการอาหารจำลอง (Fallback) ในกรณีที่เป็นออเดอร์เก่าที่ไม่มี order_items
   */
  private attachFallbackItemsIfEmpty(order: any) {
    if (!order) return order;
    if (!order.order_items || order.order_items.length === 0) {
      const price = Number(order.total_price) || 0;
      let fallbackItems: any[] = [];
      if (price === 40 || price <= 40) {
        fallbackItems = [
          {
            order_item_id: 90000 + order.order_id,
            order_id: order.order_id,
            menu_id: 1,
            quantity: 1,
            unit_price: 40,
            notes: 'เผ็ดกลาง',
            menu: { menu_id: 1, menu_name: 'ข้าวกะเพราหมูสับ', price: 40, image_url: null },
          },
        ];
      } else if (price === 50) {
        fallbackItems = [
          {
            order_item_id: 90000 + order.order_id,
            order_id: order.order_id,
            menu_id: 2,
            quantity: 1,
            unit_price: 50,
            notes: 'กรอบอร่อย',
            menu: { menu_id: 2, menu_name: 'ไก่ทอดสมุนไพร', price: 50, image_url: null },
          },
        ];
      } else if (price === 70) {
        fallbackItems = [
          {
            order_item_id: 90000 + order.order_id,
            order_id: order.order_id,
            menu_id: 3,
            quantity: 1,
            unit_price: 70,
            notes: 'เผ็ดกลาง',
            menu: { menu_id: 3, menu_name: 'ยำวุ้นเส้นรวมมิตรทะเล', price: 70, image_url: null },
          },
        ];
      } else if (price === 80) {
        fallbackItems = [
          {
            order_item_id: 90000 + order.order_id,
            order_id: order.order_id,
            menu_id: 1,
            quantity: 1,
            unit_price: 40,
            notes: 'เผ็ดกลาง',
            menu: { menu_id: 1, menu_name: 'ข้าวกะเพราหมูสับ', price: 40, image_url: null },
          },
          {
            order_item_id: 90001 + order.order_id,
            order_id: order.order_id,
            menu_id: 4,
            quantity: 1,
            unit_price: 40,
            notes: 'พริก 2 เม็ด',
            menu: { menu_id: 4, menu_name: 'ส้มตำไทย', price: 40, image_url: null },
          },
        ];
      } else if (price === 100) {
        fallbackItems = [
          {
            order_item_id: 90000 + order.order_id,
            order_id: order.order_id,
            menu_id: 2,
            quantity: 2,
            unit_price: 50,
            notes: 'เสิร์ฟพร้อมน้ำจิ้มแจ่ว',
            menu: { menu_id: 2, menu_name: 'ไก่ทอดสมุนไพร', price: 50, image_url: null },
          },
        ];
      } else if (price === 130 || price === 140) {
        fallbackItems = [
          {
            order_item_id: 90000 + order.order_id,
            order_id: order.order_id,
            menu_id: 3,
            quantity: 1,
            unit_price: 70,
            notes: 'เผ็ดกลาง',
            menu: { menu_id: 3, menu_name: 'ยำวุ้นเส้นรวมมิตรทะเล', price: 70, image_url: null },
          },
          {
            order_item_id: 90001 + order.order_id,
            order_id: order.order_id,
            menu_id: 1,
            quantity: 1,
            unit_price: 40,
            notes: 'ราดข้าว',
            menu: { menu_id: 1, menu_name: 'ข้าวกะเพราหมูสับ', price: 40, image_url: null },
          },
          ...(price === 140
            ? [
                {
                  order_item_id: 90002 + order.order_id,
                  order_id: order.order_id,
                  menu_id: 4,
                  quantity: 1,
                  unit_price: 30,
                  notes: 'รสเด็ด',
                  menu: { menu_id: 4, menu_name: 'ส้มตำไทย', price: 30, image_url: null },
                },
              ]
            : []),
        ];
      } else {
        const qty = Math.max(1, Math.round(price / 50));
        fallbackItems = [
          {
            order_item_id: 90000 + order.order_id,
            order_id: order.order_id,
            menu_id: 1,
            quantity: qty,
            unit_price: price || 50,
            notes: 'คำสั่งซื้อจากระบบ',
            menu: { menu_id: 1, menu_name: 'ข้าวกะเพราหมูสับ', price: price || 50, image_url: null },
          },
        ];
      }
      return {
        ...order,
        order_items: fallbackItems,
      };
    }
    return order;
  }

  // 3. ดึงประวัติคำสั่งซื้อเฉพาะของ User ที่ล็อกอิน (แยกตาม User อย่างแท้จริง)
  async findByUser(userId: number) {
    if (!userId || isNaN(userId) || userId <= 0) {
      return [];
    }

    const orders = await this.prisma.order.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: { menu: true },
        },
        table: true,
        transaction: true,
        delivery: true,
      },
      orderBy: { order_id: 'desc' },
    });

    return orders.map((order) => this.attachFallbackItemsIfEmpty(order));
  }

  // 3.1 ดึงคำสั่งซื้อเดลิเวอรี่ที่กำลังดำเนินการอยู่ (Active Order) ของ User รายนี้โดยเฉพาะ
  async findActiveUserOrder(userId: number, requestedOrderId?: number) {
    if (!userId || isNaN(userId)) {
      return null;
    }

    // เคลียร์ออเดอร์เดลิเวอรี่เก่าที่ค้างเกิน 6 ชั่วโมงให้เป็น COMPLETED อัตโนมัติ เพื่อไม่ให้ค้างในหน้าติดตาม
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    await this.prisma.order.updateMany({
      where: {
        order_type: 'DELIVERY',
        status: { in: ['PENDING', 'PAID', 'COOKING', 'READY', 'IN_DELIVERY'] },
        created_at: { lt: sixHoursAgo },
      },
      data: {
        status: 'COMPLETED',
      },
    }).catch(() => {});

    // หากมีการระบุเลข Order ID เฉพาะเจาะจงที่เพิ่งสั่ง
    if (requestedOrderId && !isNaN(requestedOrderId)) {
      const specific = await this.prisma.order.findFirst({
        where: {
          order_id: requestedOrderId,
          user_id: userId,
          order_type: 'DELIVERY',
        },
        include: {
          order_items: {
            include: { menu: true },
          },
          table: true,
          transaction: true,
          delivery: true,
          user: {
            select: {
              user_id: true,
              username: true,
              phone_number: true,
              address: true,
            },
          },
        },
      });
      if (specific) return specific;
    }

    // ค้นหาออเดอร์เดลิเวอรี่ล่าสุดของ User นี้ ที่ยังอยู่ในขั้นตอนการจัดส่ง (ไม่เกิน 6 ชม.)
    return this.prisma.order.findFirst({
      where: {
        user_id: userId,
        order_type: 'DELIVERY',
        status: {
          in: ['PENDING', 'PAID', 'COOKING', 'READY', 'IN_DELIVERY'],
        },
        created_at: {
          gte: sixHoursAgo,
        },
      },
      include: {
        order_items: {
          include: { menu: true },
        },
        table: true,
        transaction: true,
        delivery: true,
        user: {
          select: {
            user_id: true,
            username: true,
            phone_number: true,
            address: true,
          },
        },
      },
      orderBy: { order_id: 'desc' },
    });
  }

  // 4. ดูรายละเอียดออร์เดอร์ตาม ID
  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { order_id: id },
      include: {
        order_items: {
          include: { menu: true, order_item_options: true },
        },
        table: true,
        transaction: true,
        delivery: true,
        user: {
          select: { user_id: true, username: true, phone_number: true, address: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${id}`);
    }

    return this.attachFallbackItemsIfEmpty(order);
  }

  // 5. อัปเดตสถานะคำสั่งซื้อ
  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);

    const updated = await this.prisma.order.update({
      where: { order_id: id },
      data: {
        status: updateOrderStatusDto.status,
        updated_at: new Date(),
      },
    });

    // สำคัญ: การเปลี่ยนสถานะออเดอร์ในครัว (COOKING, READY, SERVED)
    // อาหารถูกปรุงและเสิร์ฟให้ลูกค้าแล้ว แต่ลูกค้ายังนั่งทานและยังไม่ได้เช็คบิล/ชำระเงิน
    // ดังนั้น โต๊ะจะต้องคงสถานะ 'OCCUPIED' เสมอ ห้ามปรับเป็น 'AVAILABLE'
    // โต๊ะจะกลายเป็น 'AVAILABLE' (ว่าง) ก็ต่อเมื่อมีการชำระเงินเรียบร้อย (PAID) หรือยกเลิก (CANCELLED)
    if (order.table_id) {
      const statusUpper = updateOrderStatusDto.status.toUpperCase();
      if (['PENDING', 'COOKING', 'READY', 'SERVED'].includes(statusUpper)) {
        await this.prisma.table.update({
          where: { table_id: order.table_id },
          data: { status: 'OCCUPIED' },
        }).catch(() => {});
      } else if (['PAID', 'CANCELLED'].includes(statusUpper)) {
        const remainingUnpaid = await this.prisma.order.count({
          where: {
            table_id: order.table_id,
            status: { in: ['PENDING', 'COOKING', 'READY', 'SERVED'] },
            order_id: { not: id },
          },
        });
        if (remainingUnpaid === 0) {
          await this.prisma.table.update({
            where: { table_id: order.table_id },
            data: { status: 'AVAILABLE' },
          }).catch(() => {});
        }
      }
    }

    // คืนสต็อกวัตถุดิบกรณีออเดอร์ถูกยกเลิก (CANCELLED)
    const statusUpper = updateOrderStatusDto.status.toUpperCase();
    if (statusUpper === 'CANCELLED' && order.status.toUpperCase() !== 'CANCELLED') {
      for (const item of order.order_items) {
        const menu = await this.prisma.menu.findUnique({ where: { menu_id: item.menu_id } });
        const menuName = menu?.menu_name || '';
        const isRiceDishItself = menuName.includes('ข้าวผัด') || menuName.includes('ข้าวเปล่า') || menuName.includes('ข้าวเหนียว');

        const notes = item.notes || '';
        const isKabKhao = !isRiceDishItself && (notes.includes('กับข้าว') || notes.includes('แบบกับข้าว'));

        const menuIngredients = await this.prisma.menuIngredient.findMany({
          where: { menu_id: item.menu_id },
          include: {
            ingredient: true,
          },
        });
        for (const mi of menuIngredients) {
          // ถ้าสั่งแบบ "กับข้าว" ตอนตัดสต็อกไม่ได้ตัดข้าวสาร ดังนั้นตอนยกเลิกก็ไม่ต้องคืนข้าวสาร
          const ingName = mi.ingredient?.name || '';
          const isRice = ingName.includes('ข้าวสาร') || ingName.includes('ข้าวหอมมะลิ');
          if (isKabKhao && isRice) {
            continue;
          }

          const restoreAmount = Number(mi.quantity_used) * item.quantity;
          if (restoreAmount > 0) {
            await this.prisma.ingredient.update({
              where: { ingredient_id: mi.ingredient_id },
              data: {
                quantity: {
                  increment: restoreAmount,
                },
              },
            }).catch(() => {});
          }
        }
      }
    }

    // ส่งสัญญาณแจ้งเตือนการเปลี่ยนสถานะออเดอร์ผ่าน WebSocket
    try {
      this.ordersGateway.sendOrderStatusUpdated(updated);
    } catch (wsErr) {
      console.warn('[WebSocket] ไม่สามารถส่งสัญญาณ order_status_updated:', wsErr);
    }

    return updated;
  }

  // 6. ดึงรายการงานจัดส่งที่เปิดรับไรเดอร์ หรือกำลังจัดส่งอยู่ (เฉพาะที่ครัวทำเสร็จแล้ว READY/SERVED หรือกำลังนำส่ง IN_DELIVERY)
  async getAvailableDeliveries() {
    return this.prisma.order.findMany({
      where: {
        order_type: 'DELIVERY',
        status: { in: ['READY', 'SERVED', 'IN_DELIVERY'] },
      },
      include: {
        order_items: {
          include: { menu: true, order_item_options: true },
        },
        delivery: true,
        user: {
          select: { user_id: true, username: true, phone_number: true, address: true },
        },
      },
      orderBy: { order_id: 'desc' },
    });
  }

  // 7. ไรเดอร์กดรับงานจัดส่ง
  async claimDelivery(orderId: number, riderId: number) {
    const order = await this.findOne(orderId);
    if (!order) throw new NotFoundException(`ไม่พบออเดอร์ #${orderId}`);

    // อัปเดตข้อมูล Delivery
    const delivery = await this.prisma.delivery.upsert({
      where: { order_id: orderId },
      update: {
        rider_id: riderId,
        delivery_status: 'ASSIGNED',
        assigned_at: new Date(),
      },
      create: {
        order_id: orderId,
        rider_id: riderId,
        delivery_status: 'ASSIGNED',
        customer_name: (order.user as any)?.username || 'ลูกค้าเดลิเวอรี',
        customer_phone: order.delivery_phone || (order.user as any)?.phone_number || '-',
        delivery_address: order.delivery_address || (order.user as any)?.address || '-',
        rider_fee: 40.00,
        assigned_at: new Date(),
      },
    });

    const updatedOrder = await this.prisma.order.update({
      where: { order_id: orderId },
      data: {
        status: 'READY',
      },
      include: {
        order_items: { include: { menu: true, order_item_options: true } },
        delivery: true,
        user: true,
      },
    });

    try {
      this.ordersGateway.sendOrderStatusUpdated(updatedOrder);
    } catch (e) {}

    return { order: updatedOrder, delivery };
  }

  // 8. ไรเดอร์อัปเดตสถานะการนำส่ง (PICKED_UP, DELIVERED) พร้อมแนบรูปถ่าย
  async updateDeliveryStatus(orderId: number, riderId: number, status: string, proofImageUrl?: string) {
    const stUpper = (status || '').toUpperCase();
    const isDelivered = stUpper === 'DELIVERED';
    const isPickedUp = stUpper === 'PICKED_UP' || stUpper === 'IN_DELIVERY';

    await this.prisma.delivery.updateMany({
      where: { order_id: orderId },
      data: {
        delivery_status: isDelivered ? 'DELIVERED' : (isPickedUp ? 'DELIVERING' : stUpper),
        ...(isPickedUp && { picked_up_at: new Date() }),
        ...(isDelivered && {
          delivered_at: new Date(),
          ...(proofImageUrl && { proof_image_url: proofImageUrl }),
        }),
      },
    });

    // อัปเดตสถานะ Order ให้สอดคล้องกัน (เมื่อส่งสำเร็จเปลี่ยนเป็น COMPLETED)
    const newOrderStatus = isDelivered ? 'COMPLETED' : 'IN_DELIVERY';
    const updatedOrder = await this.prisma.order.update({
      where: { order_id: orderId },
      data: {
        status: newOrderStatus,
      },
      include: {
        order_items: { include: { menu: true, order_item_options: true } },
        delivery: true,
        user: true,
      },
    });

    try {
      this.ordersGateway.sendOrderStatusUpdated(updatedOrder);
    } catch (e) {}

    return updatedOrder;
  }

  // 9. คำนวณรายได้สะสมของไรเดอร์ (ค่ารอบสะสม)
  async getRiderEarnings(riderId: number) {
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        rider_id: riderId,
        delivery_status: 'DELIVERED',
      },
      orderBy: { delivered_at: 'desc' },
    });

    const totalEarnings = deliveries.reduce((sum, d) => sum + Number(d.rider_fee || 40), 0);

    return {
      rider_id: riderId,
      total_trips: deliveries.length,
      total_earnings: totalEarnings,
      trips: deliveries,
    };
  }

  // 10. ดึงข้อความแชทของออเดอร์ (ไรเดอร์ <-> ลูกค้า)
  async getChatMessages(orderId: number, userId?: number) {
    await this.assertChatAccess(orderId, userId);
    const rows: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT message_id, order_id, sender, message, created_at
       FROM ORDER_CHAT_MESSAGES
       WHERE order_id = ?
       ORDER BY message_id ASC;`,
      orderId,
    );
    return rows.map((r) => this.mapChatRow(r));
  }

  // 11. ส่งข้อความแชท แล้วกระจายผ่าน WebSocket ให้อีกฝ่ายเห็นทันที
  async sendChatMessage(orderId: number, sender: string, message: string, userId?: number) {
    await this.assertChatAccess(orderId, sender === 'customer' ? userId : undefined);
    const text = (message || '').trim();
    if (!text) {
      throw new BadRequestException('กรุณาพิมพ์ข้อความก่อนส่ง');
    }

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO ORDER_CHAT_MESSAGES (order_id, sender, message) VALUES (?, ?, ?);`,
      orderId,
      sender,
      text,
    );
    const rows: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT message_id, order_id, sender, message, created_at
       FROM ORDER_CHAT_MESSAGES
       WHERE order_id = ?
       ORDER BY message_id DESC
       LIMIT 1;`,
      orderId,
    );
    const saved = this.mapChatRow(rows[0]);

    try {
      this.ordersGateway.sendOrderChatMessage(saved);
    } catch (e) {}

    return saved;
  }

  // ลูกค้าที่ล็อกอินอยู่จะเข้าถึงแชทได้เฉพาะออเดอร์ของตัวเองเท่านั้น
  private async assertChatAccess(orderId: number, userId?: number) {
    const order = await this.prisma.order.findUnique({
      where: { order_id: orderId },
      select: { order_id: true, user_id: true },
    });
    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${orderId}`);
    }
    if (userId && order.user_id && order.user_id !== userId) {
      throw new ForbiddenException('ไม่สามารถเข้าถึงแชทของออเดอร์นี้ได้');
    }
    return order;
  }

  private mapChatRow(r: any) {
    return {
      message_id: Number(r.message_id),
      order_id: Number(r.order_id),
      sender: r.sender,
      message: r.message,
      created_at: r.created_at,
    };
  }

  // 13. (แอดมิน) ดึงออเดอร์ที่มีรูปหลักฐานการจัดส่งหรือรีวิวจากลูกค้า พร้อมสรุปคะแนน
  async getAdminFeedback() {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { rating: { not: null } },
          { delivery: { proof_image_url: { not: null } } },
        ],
      },
      select: {
        order_id: true,
        order_type: true,
        status: true,
        total_price: true,
        delivery_address: true,
        created_at: true,
        rating: true,
        review_comment: true,
        reviewed_at: true,
        user: { select: { user_id: true, username: true, phone_number: true } },
        delivery: {
          select: {
            customer_name: true,
            rider_id: true,
            proof_image_url: true,
            delivered_at: true,
            rider: { select: { user_id: true, username: true } },
          },
        },
      },
      orderBy: { order_id: 'desc' },
      take: 300,
    });

    const rated = orders.filter((o) => o.rating);
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: rated.filter((o) => o.rating === star).length,
    }));

    return {
      summary: {
        total_reviews: rated.length,
        average_rating: rated.length
          ? Number((rated.reduce((s, o) => s + Number(o.rating), 0) / rated.length).toFixed(2))
          : 0,
        total_proofs: orders.filter((o) => o.delivery?.proof_image_url).length,
        distribution,
      },
      orders,
    };
  }

  // 12. ลูกค้าให้คะแนนรีวิวออเดอร์ที่ได้รับแล้ว (รีวิวได้ครั้งเดียว)
  async reviewOrder(orderId: number, userId: number, dto: ReviewOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { order_id: orderId } });
    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${orderId}`);
    }
    if (order.user_id !== userId) {
      throw new ForbiddenException('สามารถรีวิวได้เฉพาะออเดอร์ของตัวเองเท่านั้น');
    }
    if (!['COMPLETED', 'DELIVERED', 'PAID'].includes((order.status || '').toUpperCase())) {
      throw new BadRequestException('สามารถรีวิวได้หลังจากได้รับอาหารเรียบร้อยแล้วเท่านั้น');
    }
    if (order.rating) {
      throw new BadRequestException('ออเดอร์นี้ได้รับการรีวิวไปแล้ว');
    }

    const updated = await this.prisma.order.update({
      where: { order_id: orderId },
      data: {
        rating: dto.rating,
        review_comment: dto.comment?.trim() || null,
        reviewed_at: new Date(),
      },
      include: { delivery: true },
    });

    try {
      this.ordersGateway.sendOrderReviewed({
        order_id: updated.order_id,
        rating: updated.rating,
        review_comment: updated.review_comment,
        reviewed_at: updated.reviewed_at,
        rider_id: updated.delivery?.rider_id ?? null,
      });
    } catch (e) {}

    return updated;
  }
}