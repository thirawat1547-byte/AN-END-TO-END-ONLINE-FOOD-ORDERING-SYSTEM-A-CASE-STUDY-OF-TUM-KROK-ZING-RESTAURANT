import { Injectable, NotFoundException, BadRequestException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SettingsService } from '../settings/settings.service';
import { OrdersGateway } from './orders.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ReviewOrderDto } from './dto/review-order.dto';
import { calcRiderFee } from './rider-fee.util';

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

        if (promo.start_date && new Date(promo.start_date) > new Date()) {
          throw new BadRequestException('ขออภัย โค้ดส่วนลดนี้ยังไม่ถึงวันเริ่มใช้งาน');
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
          delivery_landmark: createOrderDto.delivery_landmark || null,
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
        const riderFee = calcRiderFee(storeSetting, createOrderDto.delivery_lat, createOrderDto.delivery_lng);
        try {
          await tx.delivery.create({
            data: {
              order_id: order.order_id,
              delivery_status: 'WAITING_RIDER',
              customer_name: createOrderDto.customer_name || existingUser?.username || 'ลูกค้าเดลิเวอรี',
              customer_phone: createOrderDto.delivery_phone || existingUser?.phone_number || '-',
              delivery_address: createOrderDto.delivery_address || existingUser?.address || 'ตามหมุดจัดส่ง',
              delivery_landmark: createOrderDto.delivery_landmark || null,
              rider_fee: riderFee.rider_fee,
              distance_km: riderFee.distance_km,
              ...(createOrderDto.delivery_lat && createOrderDto.delivery_lng && {
                customer_lat: createOrderDto.delivery_lat,
                customer_lng: createOrderDto.delivery_lng,
              }),
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

    return orders.map((order) => ({
      ...order,
      order_items: order.order_items || [],
    }));
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
        delivery: {
          include: {
            rider: {
              select: {
                user_id: true,
                username: true,
                phone_number: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { order_id: 'desc' },
    });

    return orders.map((order) => {
      const rawRider = order.delivery?.rider || null;
      const rider = rawRider
        ? {
            user_id: rawRider.user_id,
            username: rawRider.username,
            name: rawRider.username,
            phone: rawRider.phone_number || '',
            phone_number: rawRider.phone_number || '',
            role: rawRider.role || 'RIDER',
          }
        : null;

      return {
        ...order,
        order_items: order.order_items || [],
        delivery: order.delivery
          ? {
              ...order.delivery,
              rider,
            }
          : null,
        rider,
      };
    });
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

    const deliveryInclude = {
      include: {
        rider: {
          select: {
            user_id: true,
            username: true,
            phone_number: true,
            role: true,
          },
        },
      },
    };

    const formatActiveOrder = (order: any) => {
      if (!order) return null;
      const rawRider = order.delivery?.rider || null;
      const rider = rawRider
        ? {
            user_id: rawRider.user_id,
            username: rawRider.username,
            name: rawRider.username,
            phone: rawRider.phone_number || '',
            phone_number: rawRider.phone_number || '',
            role: rawRider.role || 'RIDER',
          }
        : null;

      return {
        ...order,
        order_items: order.order_items || [],
        delivery: order.delivery
          ? {
              ...order.delivery,
              rider,
            }
          : null,
        rider,
      };
    };

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
          delivery: deliveryInclude,
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
      if (specific) return formatActiveOrder(specific);
    }

    // ค้นหาออเดอร์เดลิเวอรี่ล่าสุดของ User นี้ ที่ยังอยู่ในขั้นตอนการจัดส่ง (ไม่เกิน 6 ชม.)
    const activeOrder = await this.prisma.order.findFirst({
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
        delivery: deliveryInclude,
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

    return formatActiveOrder(activeOrder);
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
        delivery: {
          include: {
            rider: {
              select: {
                user_id: true,
                username: true,
                phone_number: true,
                role: true,
              },
            },
          },
        },
        user: {
          select: { user_id: true, username: true, phone_number: true, address: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${id}`);
    }

    const rawRider = order.delivery?.rider || null;
    const rider = rawRider
      ? {
          user_id: rawRider.user_id,
          username: rawRider.username,
          name: rawRider.username,
          phone: rawRider.phone_number || '',
          phone_number: rawRider.phone_number || '',
          role: rawRider.role || 'RIDER',
        }
      : null;

    return {
      ...order,
      order_items: order.order_items || [],
      delivery: order.delivery
        ? {
            ...order.delivery,
            rider,
          }
        : null,
      rider,
    };
  }

  // 5. อัปเดตสถานะคำสั่งซื้อ
  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);

    // บันทึกเวลาครัวเริ่มทำ/ทำเสร็จครั้งแรก ใช้คำนวณ "เวลาปรุงเฉลี่ย" ในแดชบอร์ด
    const now = new Date();
    const nextStatus = updateOrderStatusDto.status.toUpperCase();
    const cookingTimes: { cooking_started_at?: Date; cooked_at?: Date } = {};
    if (nextStatus === 'COOKING' && !order.cooking_started_at) {
      cookingTimes.cooking_started_at = now;
    }
    if (['READY', 'SERVED'].includes(nextStatus) && !order.cooked_at) {
      cookingTimes.cooked_at = now;
    }

    const updated = await this.prisma.order.update({
      where: { order_id: id },
      data: {
        status: updateOrderStatusDto.status,
        updated_at: now,
        ...cookingTimes,
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

    const statusUpper = updateOrderStatusDto.status.toUpperCase();

    // ปิดงานจัดส่งที่ค้างอยู่ให้ตรงกับออเดอร์ (ไม่งั้นไรเดอร์จะติดสถานะ "มีงานค้าง" และรับงานใหม่ไม่ได้)
    if (statusUpper === 'CANCELLED') {
      await this.prisma.delivery.updateMany({
        where: { order_id: id, delivery_status: { notIn: ['DELIVERED', 'CANCELLED'] } },
        data: { delivery_status: 'CANCELLED' },
      });
    } else if (statusUpper === 'COMPLETED') {
      // ไรเดอร์รับอาหารออกไปแล้ว = ถือว่าส่งสำเร็จ (นับค่ารอบ), ยังไม่ได้รับอาหาร = ปิดงานโดยไม่นับค่ารอบ
      const delivering = await this.prisma.delivery.findMany({
        where: { order_id: id, delivery_status: 'DELIVERING' },
      });
      if (delivering.length > 0) {
        const orderInfo = await this.prisma.order.findUnique({
          where: { order_id: id },
          include: { transaction: true },
        });
        const lastTxn = (orderInfo?.transaction || []).slice(-1)[0];
        const isCash = /cash/i.test(lastTxn?.payment_method || '');
        const cashStatus = isCash ? 'PENDING' : 'NONE';
        const cashAmount = isCash ? Number(orderInfo?.total_price || 0) : 0;

        await this.prisma.delivery.updateMany({
          where: { order_id: id, delivery_status: 'DELIVERING' },
          data: {
            delivery_status: 'DELIVERED',
            delivered_at: new Date(),
            cash_amount: cashAmount,
            cash_status: cashStatus,
          },
        });
      }
      await this.prisma.delivery.updateMany({
        where: { order_id: id, delivery_status: { in: ['WAITING_RIDER', 'ASSIGNED'] } },
        data: { delivery_status: 'CANCELLED' },
      });
    }

    // คืนสต็อกวัตถุดิบกรณีออเดอร์ถูกยกเลิก (CANCELLED)
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

  // 7. ไรเดอร์กดรับงานจัดส่ง (รับได้เฉพาะออเดอร์ที่ครัวทำเสร็จแล้ว และยังไม่มีไรเดอร์คนอื่นรับ)
  async claimDelivery(orderId: number, riderId: number) {
    if (!riderId) throw new ForbiddenException('ไม่พบข้อมูลไรเดอร์ กรุณาเข้าสู่ระบบใหม่');
    const order = await this.findOne(orderId);

    if ((order.order_type || '').toUpperCase() !== 'DELIVERY') {
      throw new BadRequestException('ออเดอร์นี้ไม่ใช่งานเดลิเวอรี');
    }
    if (!['READY', 'SERVED'].includes((order.status || '').toUpperCase())) {
      throw new BadRequestException('ครัวยังทำอาหารไม่เสร็จ ยังไม่สามารถรับงานนี้ได้');
    }
    if (!this.isPaymentReadyForRider(order)) {
      throw new BadRequestException('ออเดอร์นี้ยังไม่ได้ชำระเงินหรือร้านยังไม่ยืนยันยอดโอน ยังไม่สามารถรับงานได้');
    }

    // ไรเดอร์ 1 คนถือได้ทีละ 1 งาน (เงื่อนไขเดียวกับแท็บ "งานของฉัน")
    const myActive = await this.prisma.delivery.findFirst({
      where: {
        ...this.activeRiderDeliveryWhere(riderId),
        order_id: { not: orderId },
      },
      select: { order_id: true },
    });
    if (myActive) {
      throw new BadRequestException(`คุณมีงานที่ยังส่งไม่เสร็จอยู่ (ออเดอร์ #${myActive.order_id})`);
    }

    // คิดค่ารอบตามระยะทางจากร้านถึงลูกค้าใหม่ตอนรับงาน (ใช้ค่าตั้งค่าร้านล่าสุด) แล้วล็อกไว้กับงานนี้
    const storeSetting = await this.prisma.storeSetting.findUnique({ where: { id: 1 } }).catch(() => null);
    const riderFee = calcRiderFee(storeSetting, order.delivery?.customer_lat, order.delivery?.customer_lng);

    if (!order.delivery) {
      await this.prisma.delivery.create({
        data: {
          order_id: orderId,
          delivery_status: 'WAITING_RIDER',
          customer_name: (order.user as any)?.username || 'ลูกค้าเดลิเวอรี',
          customer_phone: order.delivery_phone || (order.user as any)?.phone_number || '-',
          delivery_address: order.delivery_address || (order.user as any)?.address || '-',
          delivery_landmark: order.delivery_landmark || null,
          rider_fee: riderFee.rider_fee,
          distance_km: riderFee.distance_km,
        },
      }).catch(() => {});
    }

    // อัปเดตแบบมีเงื่อนไข ป้องกันไรเดอร์ 2 คนกดรับงานเดียวกันพร้อมกัน
    const claimed = await this.prisma.delivery.updateMany({
      where: {
        order_id: orderId,
        OR: [{ rider_id: null }, { rider_id: riderId }],
        delivery_status: { in: ['WAITING_RIDER', 'ASSIGNED'] },
      },
      data: {
        rider_id: riderId,
        delivery_status: 'ASSIGNED',
        assigned_at: new Date(),
        rider_fee: riderFee.rider_fee,
        distance_km: riderFee.distance_km,
      },
    });
    if (claimed.count === 0) {
      throw new BadRequestException('งานนี้มีไรเดอร์คนอื่นรับไปแล้ว');
    }

    const updatedOrder = await this.findOne(orderId);

    try {
      this.ordersGateway.sendOrderStatusUpdated(updatedOrder);
    } catch (e) {}

    return { order: updatedOrder, delivery: updatedOrder.delivery };
  }

  // ไรเดอร์รับงานได้เมื่อ: ชำระเงินแล้ว (ร้านยืนยันยอด) หรือเป็นเงินสดปลายทาง (ไรเดอร์เก็บเงินเอง)
  private isPaymentReadyForRider(order: { transaction?: { payment_method: string; payment_status: string }[] }) {
    const txn = (order.transaction || []).slice(-1)[0];
    if (!txn) return false;
    const status = (txn.payment_status || '').toUpperCase();
    if (status === 'COMPLETED') return true;
    return /cash/i.test(txn.payment_method || '') && status === 'PENDING';
  }

  // งานจัดส่งที่ไรเดอร์ถืออยู่จริง: ยังไม่ส่งเสร็จ และออเดอร์ยังไม่ถูกปิด/ยกเลิก
  private activeRiderDeliveryWhere(riderId: number) {
    return {
      rider_id: riderId,
      delivery_status: { in: ['ASSIGNED', 'DELIVERING'] },
      order: { order_type: 'DELIVERY', status: { notIn: ['COMPLETED', 'CANCELLED'] } },
    };
  }

  // 7.1 ไรเดอร์คืนงาน (ยกเลิกการรับงาน) ได้เฉพาะก่อนรับอาหารออกจากร้าน
  async releaseDelivery(orderId: number, riderId: number, isAdmin = false) {
    const delivery = await this.prisma.delivery.findUnique({ where: { order_id: orderId } });
    if (!delivery) throw new NotFoundException(`ไม่พบงานจัดส่งของออเดอร์ #${orderId}`);
    if (!isAdmin && delivery.rider_id !== riderId) {
      throw new ForbiddenException('งานนี้ไม่ใช่งานของคุณ');
    }
    if (delivery.delivery_status !== 'ASSIGNED') {
      throw new BadRequestException('รับอาหารออกจากร้านแล้ว ไม่สามารถคืนงานได้');
    }

    await this.prisma.delivery.update({
      where: { order_id: orderId },
      data: { rider_id: null, delivery_status: 'WAITING_RIDER', assigned_at: null },
    });

    const updatedOrder = await this.findOne(orderId);
    try {
      this.ordersGateway.sendOrderStatusUpdated(updatedOrder);
    } catch (e) {}
    return updatedOrder;
  }

  // 7.2 ข้อมูลหน้าไรเดอร์: งานที่เปิดให้รับ, งานที่กำลังส่งของฉัน, ออเดอร์ที่ยังปรุงอยู่ในครัว
  async getRiderJobs(riderId: number) {
    const include = {
      order_items: { include: { menu: true, order_item_options: true } },
      delivery: true,
      transaction: true,
      user: { select: { user_id: true, username: true, phone_number: true, address: true } },
    };

    const [available, mine, cooking] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          order_type: 'DELIVERY',
          status: { in: ['READY', 'SERVED'] },
          OR: [{ delivery: null }, { delivery: { rider_id: null } }],
        },
        include,
        orderBy: { updated_at: 'asc' },
      }),
      this.prisma.delivery
        .findFirst({ where: this.activeRiderDeliveryWhere(riderId), select: { order_id: true } })
        .then((d) => (d ? this.prisma.order.findUnique({ where: { order_id: d.order_id }, include }) : null)),
      this.prisma.order.findMany({
        where: {
          order_type: 'DELIVERY',
          status: { in: ['PENDING', 'PAID', 'COOKING'] },
        },
        include,
        orderBy: { created_at: 'asc' },
      }),
    ]);

    // งานที่ยังไม่มีคนรับ: แสดงค่ารอบตามระยะทางด้วยค่าตั้งค่าร้านล่าสุด (ค่าจริงจะล็อกตอนกดรับงาน)
    const storeSetting = await this.prisma.storeSetting.findUnique({ where: { id: 1 } }).catch(() => null);
    const withFeeEstimate = (o: any) => {
      if (!o.delivery) return o;
      const fee = calcRiderFee(storeSetting, o.delivery.customer_lat, o.delivery.customer_lng);
      return { ...o, delivery: { ...o.delivery, ...fee } };
    };

    // ครัวทำเสร็จแล้วแต่ยังไม่ได้ชำระเงิน/ร้านยังไม่ยืนยันยอดโอน -> แยกไว้ ยังไม่ให้รับงาน
    const paid = available.filter((o) => this.isPaymentReadyForRider(o));
    const awaitingPayment = available.filter((o) => !this.isPaymentReadyForRider(o));

    const formatOrder = (o: any) => ({
      ...o,
      order_items: o.order_items || [],
    });

    return {
      available: paid.map((o) => formatOrder(withFeeEstimate(o))),
      awaiting_payment: awaitingPayment.map((o) => formatOrder(o)),
      mine: mine ? formatOrder(mine) : null,
      cooking: cooking.map((o) => formatOrder(o)),
    };
  }

  // 8. ไรเดอร์อัปเดตสถานะการนำส่ง (PICKED_UP, DELIVERED) พร้อมแนบรูปถ่าย
  async updateDeliveryStatus(orderId: number, riderId: number, status: string, proofImageUrl?: string, isAdmin = false) {
    const stUpper = (status || '').toUpperCase();
    const isDelivered = stUpper === 'DELIVERED';
    const isPickedUp = stUpper === 'PICKED_UP' || stUpper === 'IN_DELIVERY';
    if (!isDelivered && !isPickedUp) {
      throw new BadRequestException('สถานะการจัดส่งไม่ถูกต้อง');
    }

    const delivery = await this.prisma.delivery.findUnique({ where: { order_id: orderId } });
    if (!delivery) throw new NotFoundException(`ไม่พบงานจัดส่งของออเดอร์ #${orderId}`);
    if (!isAdmin && delivery.rider_id !== riderId) {
      throw new ForbiddenException('งานนี้ไม่ใช่งานของคุณ');
    }
    if (isPickedUp && delivery.delivery_status !== 'ASSIGNED') {
      throw new BadRequestException('สถานะงานไม่ถูกต้องสำหรับการรับอาหาร');
    }
    if (isDelivered && delivery.delivery_status !== 'DELIVERING') {
      throw new BadRequestException('ต้องกดรับอาหารออกจากร้านก่อนจึงจะยืนยันส่งสำเร็จได้');
    }

    let cashStatus = 'NONE';
    let cashAmount = 0;

    if (isDelivered) {
      const orderInfo = await this.prisma.order.findUnique({
        where: { order_id: orderId },
        include: { transaction: true },
      });

      const lastTxn = (orderInfo?.transaction || []).slice(-1)[0];
      const isCash = /cash/i.test(lastTxn?.payment_method || '');

      if (isCash) {
        cashStatus = 'PENDING';
        cashAmount = Number(orderInfo?.total_price || 0);

        // หากมีรายการชำระเงินแบบ CASH ที่สถานะเป็น PENDING ให้อัปเดตเป็น COMPLETED พร้อมบันทึก paid_at
        if (lastTxn && lastTxn.payment_status === 'PENDING') {
          await this.prisma.transaction.update({
            where: { transaction_id: lastTxn.transaction_id },
            data: {
              payment_status: 'COMPLETED',
              paid_at: new Date(),
            },
          }).catch(() => {});
        }
      } else {
        cashStatus = 'NONE';
        cashAmount = 0;
      }
    }

    await this.prisma.delivery.update({
      where: { order_id: orderId },
      data: {
        delivery_status: isDelivered ? 'DELIVERED' : 'DELIVERING',
        ...(isPickedUp && { picked_up_at: new Date() }),
        ...(isDelivered && {
          delivered_at: new Date(),
          ...(proofImageUrl && { proof_image_url: proofImageUrl }),
          cash_amount: cashAmount,
          cash_status: cashStatus,
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

  // 14. นำส่งเงินสดสำหรับไรเดอร์ (PENDING -> SUBMITTED)
  async submitCash(deliveryIds: number[], riderId: number) {
    if (!deliveryIds || deliveryIds.length === 0) {
      throw new BadRequestException('กรุณาระบุรหัสงานจัดส่งที่ต้องการนำส่งเงินสด');
    }

    const deliveries = await this.prisma.delivery.findMany({
      where: {
        delivery_id: { in: deliveryIds },
      },
      include: {
        order: true,
      },
    });

    if (deliveries.length !== deliveryIds.length) {
      throw new NotFoundException('พบงานจัดส่งบางรายการไม่มีอยู่ในระบบ');
    }

    for (const d of deliveries) {
      if (d.rider_id !== riderId) {
        throw new ForbiddenException(`งานจัดส่ง #${d.delivery_id} ไม่ใช่งานของคุณ`);
      }
      if (d.cash_status !== 'PENDING') {
        throw new BadRequestException(
          `งานจัดส่ง #${d.delivery_id} ไม่ได้อยู่ในสถานะค้างนำส่ง (สถานะปัจจุบัน: ${d.cash_status})`,
        );
      }
    }

    const now = new Date();
    await this.prisma.delivery.updateMany({
      where: {
        delivery_id: { in: deliveryIds },
        rider_id: riderId,
      },
      data: {
        cash_status: 'SUBMITTED',
        cash_submitted_at: now,
      },
    });

    const totalAmount = deliveries.reduce((sum, d) => sum + Number(d.cash_amount), 0);

    const payload = {
      rider_id: riderId,
      delivery_ids: deliveryIds,
      count: deliveryIds.length,
      total_cash_amount: totalAmount,
      submitted_at: now,
    };

    try {
      this.ordersGateway.notifyCashSubmitted(payload);
    } catch (e) {}

    return {
      message: `นำส่งเงินสดสำเร็จ ${deliveryIds.length} รายการ ยอดรวม ${totalAmount} บาท`,
      ...payload,
    };
  }

  // 15. แอดมินยืนยันรับเงินสดจากไรเดอร์ (SUBMITTED -> CONFIRMED)
  async confirmCash(deliveryId: number, adminUserId: number) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { delivery_id: deliveryId },
    });
    if (!delivery) {
      throw new NotFoundException(`ไม่พบงานจัดส่งรหัส #${deliveryId}`);
    }

    const updated = await this.prisma.delivery.update({
      where: { delivery_id: deliveryId },
      data: {
        cash_status: 'CONFIRMED',
        cash_confirmed_at: new Date(),
        cash_confirmed_by: adminUserId ? Number(adminUserId) : null,
      },
      include: {
        rider: { select: { user_id: true, username: true } },
        cash_confirmer: { select: { user_id: true, username: true } },
      },
    });

    return {
      message: `ยืนยันการรับเงินสดของงาน #${deliveryId} เรียบร้อยแล้ว`,
      delivery: updated,
    };
  }

  // 16. แอดมินปฏิเสธเงินสดจากไรเดอร์ ปรับสถานะกลับเป็น PENDING
  async rejectCash(deliveryId: number) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { delivery_id: deliveryId },
    });
    if (!delivery) {
      throw new NotFoundException(`ไม่พบงานจัดส่งรหัส #${deliveryId}`);
    }

    const updated = await this.prisma.delivery.update({
      where: { delivery_id: deliveryId },
      data: {
        cash_status: 'PENDING',
        cash_submitted_at: null,
      },
      include: {
        rider: { select: { user_id: true, username: true } },
      },
    });

    return {
      message: `ปรับสถานะเงินสดของงาน #${deliveryId} กลับเป็น PENDING เพื่อให้ไรเดอร์ตรวจสอบและส่งใหม่`,
      delivery: updated,
    };
  }
}