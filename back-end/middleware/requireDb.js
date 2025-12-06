import { isMongoConnected } from '../config/db.js';

export const requireDb = (req, res, next) => {
    if (!isMongoConnected()) {
        return res.status(503).json({
            success: false,
            error: 'Database not available',
            message: 'MongoDB connection required. Please set MONGODB_URI environment variable.',
            developmentNote: 'In development mode, the frontend uses localStorage for data persistence.'
        });
    }
    next();
};
