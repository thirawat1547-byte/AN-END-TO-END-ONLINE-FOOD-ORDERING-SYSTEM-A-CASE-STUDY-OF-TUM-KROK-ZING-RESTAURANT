import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// Health Check Endpoint (For Monitoring & Load Balancer)
// ==========================================
app.get('/health', async (req, res) => {
    try {
        // ทดสอบยิง Query เบาๆ ไปที่ Database เพื่อเช็คว่า Connection ยังดีอยู่ไหม
        await prisma.$queryRaw`SELECT 1`;
        
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
            message: 'Tum Krok Zing API is running smoothly 🚀'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            message: 'Database connection failed ❌'
        });
    }
});

// ==========================================
// API Endpoints
// ==========================================
app.get('/', (req, res) => {
    res.send('Welcome to Tum Krok Zing API!');
});

// เริ่มรันเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// จัดการการปิดโปรแกรมอย่างปลอดภัย (Graceful Shutdown)
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
