import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import User from './models/User.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

app.use('/api', routes);

app.use(errorHandler);

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@memoryofplace.com',
        password: 'admin123',
        fullName: 'Administrator',
        role: 'admin',
        status: 'active'
      });
      console.log('Default admin user created: admin / admin123');
    }
    
    const sarahExists = await User.findOne({ username: 'sarah' });
    
    if (!sarahExists) {
      await User.create({
        username: 'sarah',
        email: 'sarah@memoryofplace.com',
        password: 'sarah123',
        fullName: 'Sarah Johnson',
        role: 'creator',
        status: 'active',
        bio: 'Travel enthusiast and memory keeper'
      });
      console.log('Default creator user created: sarah / sarah123');
    }
  } catch (error) {
    console.error('Error creating default users:', error.message);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    
    await createDefaultAdmin();
    
    const port = parseInt(process.env.PORT || '6000', 10);
    
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
      console.log(`MongoDB connected`);
      console.log(`API available at http://localhost:${port}/api`);
      console.log(`Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
