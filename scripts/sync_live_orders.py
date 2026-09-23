import urllib.request
import json
import subprocess

def sync():
    url = 'http://161.33.43.187/api/v1/orders'
    print(f'Fetching live orders from {url}...')
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        orders = json.loads(response.read().decode('utf-8'))
    
    print(f'Retrieved {len(orders)} orders.')
    
    sql_statements = [
        'SET FOREIGN_KEY_CHECKS = 0;',
    ]
    
    for o in orders:
        oid = o['order_id']
        uid = o.get('user_id') or 'NULL'
        tid = o.get('table_id') or 'NULL'
        pid = o.get('promo_id') or 'NULL'
        otype = o.get('order_type') or 'DINE_IN'
        status = o.get('status') or 'COMPLETED'
        price = o.get('total_price') or 0
        created = o.get('created_at', '2026-09-20 12:00:00').replace('T', ' ').replace('Z', '')
        if len(created) > 23:
            created = created[:23]

        sql_statements.append(
            f"INSERT INTO tum_krok_zing.ORDERS (order_id, user_id, table_id, promo_id, order_type, status, total_price, created_at) "
            f"VALUES ({oid}, {uid}, {tid}, {pid}, '{otype}', '{status}', {price}, '{created}') "
            f"ON DUPLICATE KEY UPDATE status = '{status}', total_price = {price};"
        )

        for it in o.get('order_items', []):
            oi_id = it.get('order_item_id')
            mid = it.get('menu_id')
            qty = it.get('quantity', 1)
            uprice = it.get('unit_price', 0)
            raw_notes = it.get('notes') or ''
            notes = raw_notes.replace("'", "''")
            icreated = it.get('created_at', created).replace('T', ' ').replace('Z', '')
            if len(icreated) > 23:
                icreated = icreated[:23]

            sql_statements.append(
                f"INSERT INTO tum_krok_zing.ORDER_ITEMS (order_item_id, order_id, menu_id, quantity, unit_price, notes, created_at) "
                f"VALUES ({oi_id}, {oid}, {mid}, {qty}, {uprice}, '{notes}', '{icreated}') "
                f"ON DUPLICATE KEY UPDATE quantity = {qty}, unit_price = {uprice};"
            )

        for tr in o.get('transaction', []):
            tr_id = tr.get('transaction_id')
            amount = tr.get('amount', price)
            pmethod = tr.get('payment_method', 'PROMPTPAY')
            pstatus = tr.get('payment_status', 'COMPLETED')

            sql_statements.append(
                f"INSERT INTO tum_krok_zing.TRANSACTIONS (transaction_id, order_id, amount, payment_method, payment_status) "
                f"VALUES ({tr_id}, {oid}, {amount}, '{pmethod}', '{pstatus}') "
                f"ON DUPLICATE KEY UPDATE payment_status = '{pstatus}';"
            )

    # Sync ingredients
    try:
        ing_url = 'http://161.33.43.187/api/v1/ingredients'
        print(f'Fetching live ingredients from {ing_url}...')
        req_ing = urllib.request.Request(ing_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_ing) as res_ing:
            ingredients = json.loads(res_ing.read().decode('utf-8'))
        print(f'Retrieved {len(ingredients)} ingredients.')
        for ing in ingredients:
            name = ing['name'].replace("'", "''")
            qty = ing['quantity']
            min_qty = ing['min_quantity']
            unit = ing['unit']
            sql_statements.append(
                f"UPDATE tum_krok_zing.INGREDIENTS SET quantity_in_stock = {qty}, reorder_level = {min_qty}, unit = '{unit}' "
                f"WHERE ingredient_name = '{name}';"
            )
    except Exception as e:
        print(f'Warning: ingredients sync: {e}')

    sql_statements.append('SET FOREIGN_KEY_CHECKS = 1;')

    sql_content = '\n'.join(sql_statements)
    with open('scripts/sync_orders.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print('Executing SQL into tumkrokzing_db...')
    proc = subprocess.run(
        ['docker', 'exec', '-i', 'tumkrokzing_db', 'mysql', '-u', 'root', '-prootpassword', '--default-character-set=utf8mb4', 'tum_krok_zing'],
        input=sql_content.encode('utf-8'),
        capture_output=True
    )
    if proc.returncode == 0:
        print('SUCCESS: Sync completed successfully!')
    else:
        print('ERROR:', proc.stderr.decode('utf-8'))

if __name__ == '__main__':
    sync()
