import SavedMemory from '../models/SavedMemory.js';
import Memory from '../models/Memory.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

export const getSavedMemories = async (req, res, next) => {
    try {
        const savedMemories = await SavedMemory.find({ userId: req.user._id })
            .populate({
                path: 'memoryId',
                populate: {
                    path: 'userId',
                    select: 'username fullName avatarUrl'
                }
            })
            .sort({ createdAt: -1 });

        const memories = savedMemories
            .filter(sm => sm.memoryId)
            .map(sm => sm.memoryId);

        res.json({
            success: true,
            count: memories.length,
            data: memories
        });
    } catch (error) {
        next(error);
    }
};

export const saveMemory = async (req, res, next) => {
    try {
        const memory = await Memory.findById(req.params.memoryId);

        if (!memory) {
            return next(new ErrorResponse('Memory not found', 404));
        }

        const existingSave = await SavedMemory.findOne({
            userId: req.user._id,
            memoryId: req.params.memoryId
        });

        if (existingSave) {
            return next(new ErrorResponse('Memory already saved', 400));
        }

        await SavedMemory.create({
            userId: req.user._id,
            memoryId: req.params.memoryId
        });

        res.status(201).json({
            success: true,
            data: { saved: true }
        });
    } catch (error) {
        next(error);
    }
};

export const unsaveMemory = async (req, res, next) => {
    try {
        const savedMemory = await SavedMemory.findOneAndDelete({
            userId: req.user._id,
            memoryId: req.params.memoryId
        });

        if (!savedMemory) {
            return next(new ErrorResponse('Memory not saved', 400));
        }

        res.json({
            success: true,
            data: { saved: false }
        });
    } catch (error) {
        next(error);
    }
};

export const checkSaved = async (req, res, next) => {
    try {
        const savedMemory = await SavedMemory.findOne({
            userId: req.user._id,
            memoryId: req.params.memoryId
        });

        res.json({
            success: true,
            data: { saved: !!savedMemory }
        });
    } catch (error) {
        next(error);
    }
};
