// 1) Load environment variables before anything else
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db.js';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

// 2) Create Express app
const app = express();
const port = process.env.PORT || 4000;

// 3) Define allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,                           // e.g. https://thunderous-scone-2d484c.netlify.app
  'http://localhost:5173'                           // your React dev server
].filter(Boolean); // removes any undefined entries

// 4) Middleware

// JSON parser
app.use(express.json());

// CORS: allow credentials and validate origins
app.use(cors({
  origin: (incomingOrigin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!incomingOrigin) return callback(null, true);
    if (allowedOrigins.includes(incomingOrigin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: Origin ${incomingOrigin} not allowed`));
  },
  credentials: true
}));

// Cookie parser
app.use(cookieParser());

// 5) Database connection
connectDB();

// 6) API routes
app.use('/api/food', foodRouter);
app.use('/images', express.static('uploads'));
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// 7) Health check
app.get('/', (req, res) => res.send('API Working'));

// 8) Startup logs
console.log('✅ Connected to DB');
console.log('🚀 Server starting on port', port);
console.log('🌐 Allowed CORS origins:', allowedOrigins);

// 9) Start server
app.listen(port, () => {
  console.log(`🔌 Server listening at http://localhost:${port}`);
});