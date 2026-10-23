-- Create OrderSummary View
CREATE OR REPLACE VIEW ORDER_SUMMARIES_VIEW AS
SELECT 
    o.order_id, 
    t.table_number, 
    o.total_price, 
    o.status, 
    o.created_at AS order_date
FROM ORDERS o
LEFT JOIN TABLES t ON o.table_id = t.table_id;

-- Create TransactionReceipt View
CREATE OR REPLACE VIEW TRANSACTION_RECEIPTS_VIEW AS
SELECT 
    tr.transaction_id,
    tr.order_id,
    u.username AS customer_name,
    tr.amount AS total_amount,
    tr.payment_method,
    tr.payment_status,
    o.created_at AS payment_date
FROM TRANSACTIONS tr
LEFT JOIN ORDERS o ON tr.order_id = o.order_id
LEFT JOIN USERS u ON o.user_id = u.user_id;

-- Create TopSellingMenu View
CREATE OR REPLACE VIEW TOP_SELLING_MENUS_VIEW AS
SELECT 
    m.menu_id,
    m.menu_name AS menu_name,
    c.category_name AS category_name,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.subtotal) AS total_revenue
FROM ORDER_ITEMS oi
JOIN MENUS m ON oi.menu_id = m.menu_id
JOIN CATEGORIES c ON m.category_id = c.category_id
GROUP BY m.menu_id, m.menu_name, c.category_name;

-- Create LowStockAlert View
CREATE OR REPLACE VIEW LOW_STOCK_ALERTS_VIEW AS
SELECT 
    i.ingredient_id,
    i.ingredient_name AS ingredient_name,
    i.quantity_in_stock,
    i.reorder_level,
    i.unit
FROM INGREDIENTS i
WHERE i.quantity_in_stock <= i.reorder_level;

-- Create LiveTableStatus View
CREATE OR REPLACE VIEW LIVE_TABLE_STATUS_VIEW AS
SELECT 
    t.table_id,
    t.table_number,
    t.capacity,
    t.status AS current_status,
    o.order_id AS current_order_id,
    o.total_price AS current_total
FROM TABLES t
LEFT JOIN ORDERS o ON t.table_id = o.table_id AND o.status IN ('PENDING', 'PREPARING', 'SERVED');