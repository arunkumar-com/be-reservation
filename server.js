// 1) Load env first
import 'dotenv/config';

// 2) Imports
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

// 3) App setup
const app = express();
const port = process.env.PORT || 4000;

// 4) Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,      // must be exactly your Netlify URL, no slash
  'http://localhost:5173'
].filter(Boolean);

// 5) Middleware
app.use(express.json());
app.use(cors({
  origin: (incomingOrigin, callback) => {
    console.log('CORS check for origin:', incomingOrigin);
    if (!incomingOrigin) return callback(null, true);
    if (allowedOrigins.includes(incomingOrigin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: Origin ${incomingOrigin} not allowed`));
  },
  credentials: true
}));
app.use(cookieParser());

// 6) DB
connectDB();

// 7) Error-catching wrapper
app.use(async (req, res, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Route error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 8) Routes
app.use('/api/food', foodRouter);
app.use('/images', express.static('uploads'));
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

app.get('/', (req, res) => res.send('API Working'));

// 9) Startup logs & listen
console.log('✅ Connected to DB');
console.log('🚀 Server listening on port', port);
console.log('🌐 Allowed CORS origins:', allowedOrigins);

app.listen(port);
