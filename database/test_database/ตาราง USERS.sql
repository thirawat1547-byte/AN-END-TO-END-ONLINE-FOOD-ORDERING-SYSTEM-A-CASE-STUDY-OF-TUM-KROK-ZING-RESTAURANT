-- 1. พิสูจน์ตาราง USERS (ผู้ใช้งานและสมาชิก)
-- การทดสอบบนเว็บ: กดปุ่ม "สมัครสมาชิก" (Register) หรือ "แก้ไขโปรไฟล์"
-- สิ่งที่สังเกต: รายชื่อผู้ใช้ล่าสุด, รหัสผ่านถูกเข้ารหัส bcrypt, และ Role
SELECT user_id, username, email, phone_number, role 
FROM USERS 
ORDER BY user_id;