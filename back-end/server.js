import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import { devRouter } from './routes/devRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'memory-of-place-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24*60*60*1000 }
}));

const start = async () => {
    const mongoConn = await connectDB();
    const mongoConnected = !!mongoConn;
    global.mongoConnected = mongoConnected;

    if (mongoConnected) {
        app.use('/api', apiRoutes);
    } else {
        app.use('/api', devRouter());
    }

    app.use(errorHandler);

    const server = createServer(app);
    const port = parseInt(process.env.PORT || '5000', 10);
    
    server.listen(port, '0.0.0.0', () => {
        console.log('============================================================');
        console.log(` Server:  http://localhost:${port}`);
        console.log(`🗄 MongoDB: ${mongoConnected ? 'Connected' : 'Not connected (DEV mode)'}`);
        console.log('Test health: /api/health');
        console.log('============================================================');
    });
};

start();

export default app;
