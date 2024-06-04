import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentResultRoutes from './routes/paymentResultRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import deleteImageRoutes from './routes/deleteImageRoutes.js';
import uploadMultipleRoutes from './routes/uploadMultipleRoutes.js';
import updateMultipleImageRoutes from './routes/updateMultipleImageRoutes.js';
import tiktokRoutes from './routes/tiktokRoutes.js';
import { Server as SocketIO } from 'socket.io';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import configureSocket from './socket.js';
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentResultRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload', deleteImageRoutes);
app.use('/api/uploads', uploadMultipleRoutes);
app.use('/api/uploads', updateMultipleImageRoutes);
app.use('/api/tiktok', tiktokRoutes);

app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
// app.use('/uploads01', express.static(path.join(__dirname, '/uploads01')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  const __dirname = path.resolve();
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

const expressServer = app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);
const io = new SocketIO(expressServer, {
  cors: {
    origin: ['http://localhost:3000', 'https://buyifang.whtec.net'], // Your React app's origin
    methods: ['GET', 'POST'], // Allowed HTTP methods
    credentials: true, // If you need to send cookies with the request
    pingTimeout: 500, // 5 seconds
    pingInterval: 2000, // 25 seconds
  },
});

// const io = new SocketIO(expressServer);
configureSocket(io);
