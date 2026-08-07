import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { inspectionRouter } from './routes/inspections.js';
import { adminRouter } from './routes/admin.js';
import { marketRouter } from './routes/market.js';
import { mediaRouter } from './routes/media.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Security & Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', limiter);

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/inspections', inspectionRouter);
app.use('/api/admin', adminRouter);
app.use('/api/market', marketRouter);
app.use('/api/media', mediaRouter);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'FreshVision AI Enterprise Backend',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FreshVision Enterprise API Server running on port http://localhost:${PORT}`);
});
