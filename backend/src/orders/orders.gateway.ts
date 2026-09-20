// src/orders/orders.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // รองรับทุก Origin สำหรับการทดสอบและใช้งานร่วมกับ Frontend
    credentials: true,
  },
})
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  afterInit(server: Server) {
    this.logger.log('⚡ Orders WebSocket Gateway เริ่มทำงานเรียบร้อยแล้ว');
  }

  handleConnection(client: Socket) {
    this.logger.log(`🔌 Client เชื่อมต่อ Socket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Client ตัดการเชื่อมต่อ Socket: ${client.id}`);
  }

  /**
   * ฟังก์ชันส่งสัญญาณแจ้งเตือนออเดอร์ใหม่ (new_order) ไปยังหน้าจอครัว (KDS) และทุก Client ที่เชื่อมต่ออยู่
   * @param order ข้อมูลออเดอร์ที่ถูกบันทึกลงฐานข้อมูลแล้ว
   */
  sendNewOrder(order: any) {
    this.logger.log(`📢 กระจายสัญญาณ new_order: #${order?.order_id || order?.id}`);
    this.server.emit('new_order', order);
  }

  /**
   * ฟังก์ชันส่งสัญญาณเมื่อสถานะออเดอร์มีการเปลี่ยนแปลง (เช่น จาก PENDING -> COOKING -> SERVED)
   * @param order ข้อมูลออเดอร์หลังอัปเดตสถานะ
   */
  sendOrderStatusUpdated(order: any) {
    this.logger.log(`📢 กระจายสัญญาณ order_status_updated: #${order?.order_id || order?.id} -> ${order?.status}`);
    this.server.emit('order_status_updated', order);
  }

  /**
   * รองรับการรับสัญญาณ place_order หรือ new_order จากฝั่ง Frontend (ถ้ามี)
   */
  @SubscribeMessage('place_order')
  handlePlaceOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    this.logger.log(`📥 ได้รับสัญญาณ place_order จาก Client: ${client.id}`);
    // กระจายต่อให้ Client อื่นๆ ทันที
    if (payload) {
      this.server.emit('new_order', payload);
    }
    return { status: 'acknowledged', receivedAt: new Date().toISOString() };
  }

  /**
   * ตรวจสอบสถานะการเชื่อมต่อ (Ping-Pong)
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', time: new Date().toISOString() };
  }
}

