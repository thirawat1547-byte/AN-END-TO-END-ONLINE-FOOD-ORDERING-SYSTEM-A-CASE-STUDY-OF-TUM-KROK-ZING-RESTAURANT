export declare class OrderItemDto {
    menu_id: number;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    table_id?: number;
    user_id?: number;
    items: OrderItemDto[];
}
