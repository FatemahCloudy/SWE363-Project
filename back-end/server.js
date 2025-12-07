import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const start = async () => {
    try {
        await connectDB();
        console.log('MongoDB Connected Successfully');

        app.use('/api', apiRoutes);

        app.get('/', (req, res) => {
            res.json({
                success: true,
                message: 'Backend API is running in production'
            });
        });

        app.get('/api/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString()
            });
        });

        app.use(errorHandler);

        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

start();

export default app;
