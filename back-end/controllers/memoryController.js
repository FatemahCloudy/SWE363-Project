import Memory from '../models/Memory.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

export const getMemories = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const following = await Follow.find({ followerId: userId }).select('followingId');
        const followingIds = following.map(f => f.followingId);

        const memories = await Memory.find({
            $or: [
                { privacy: 'public' },
                { userId: userId },
                { privacy: 'followers_only', userId: { $in: followingIds } }
            ]
        })
            .populate('userId', 'username fullName avatarUrl')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: memories.length,
            data: memories
        });
    } catch (error) {
        next(error);
    }
};

export const getMemory = async (req, res, next) => {
    try {
        const memory = await Memory.findById(req.params.id)
            .populate('userId', 'username fullName avatarUrl');

        if (!memory) {
            return next(new ErrorResponse('Memory not found', 404));
        }

        const userId = req.user._id;
        const isOwner = memory.userId._id.toString() === userId.toString();

        if (memory.privacy === 'private' && !isOwner) {
            return next(new ErrorResponse('Access denied', 403));
        }

        if (memory.privacy === 'followers_only' && !isOwner) {
            const isFollowing = await Follow.findOne({
                followerId: userId,
                followingId: memory.userId._id
            });

            if (!isFollowing) {
                return next(new ErrorResponse('Access denied', 403));
            }
        }

        res.json({
            success: true,
            data: memory
        });
    } catch (error) {
        next(error);
    }
};

export const createMemory = async (req, res, next) => {
    try {
        const memoryData = {
            ...req.body,
            userId: req.user._id
        };

        const memory = await Memory.create(memoryData);

        await memory.populate('userId', 'username fullName avatarUrl');

        res.status(201).json({
            success: true,
            data: memory
        });
    } catch (error) {
        next(error);
    }
};

export const updateMemory = async (req, res, next) => {
    try {
        let memory = await Memory.findById(req.params.id);

        if (!memory) {
            return next(new ErrorResponse('Memory not found', 404));
        }

        if (memory.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized to update this memory', 403));
        }

        const allowedFields = ['title', 'description', 'imageUrl', 'category', 'privacy', 'location', 'locationAddress', 'latitude', 'longitude', 'tags'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        memory = await Memory.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('userId', 'username fullName avatarUrl');

        res.json({
            success: true,
            data: memory
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMemory = async (req, res, next) => {
    try {
        const memory = await Memory.findById(req.params.id);

        if (!memory) {
            return next(new ErrorResponse('Memory not found', 404));
        }

        if (memory.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized to delete this memory', 403));
        }

        await Like.deleteMany({ memoryId: req.params.id });
        await Comment.deleteMany({ memoryId: req.params.id });

        await memory.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

export const searchMemories = async (req, res, next) => {
    try {
        const { q, category, privacy } = req.query;
        const userId = req.user._id;

        const following = await Follow.find({ followerId: userId }).select('followingId');
        const followingIds = following.map(f => f.followingId);

        let query = {
            $or: [
                { privacy: 'public' },
                { userId: userId },
                { privacy: 'followers_only', userId: { $in: followingIds } }
            ]
        };

        if (q) {
            query.$and = [
                {
                    $or: [
                        { title: { $regex: q, $options: 'i' } },
                        { description: { $regex: q, $options: 'i' } },
                        { location: { $regex: q, $options: 'i' } }
                    ]
                }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (privacy) {
            query.privacy = privacy;
        }

        const memories = await Memory.find(query)
            .populate('userId', 'username fullName avatarUrl')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: memories.length,
            data: memories
        });
    } catch (error) {
        next(error);
    }
};

export const getUserMemories = async (req, res, next) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user._id;

        const isOwner = targetUserId === currentUserId.toString();

        let privacyFilter;

        if (isOwner) {
            privacyFilter = {};
        } else {
            const isFollowing = await Follow.findOne({
                followerId: currentUserId,
                followingId: targetUserId
            });

            if (isFollowing) {
                privacyFilter = { privacy: { $in: ['public', 'followers_only'] } };
            } else {
                privacyFilter = { privacy: 'public' };
            }
        }

        const memories = await Memory.find({
            userId: targetUserId,
            ...privacyFilter
        })
            .populate('userId', 'username fullName avatarUrl')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: memories.length,
            data: memories
        });
    } catch (error) {
        next(error);
    }
};

export const likeMemory = async (req, res, next) => {
    try {
        const memory = await Memory.findById(req.params.id);

        if (!memory) {
            return next(new ErrorResponse('Memory not found', 404));
        }

        const existingLike = await Like.findOne({
            memoryId: req.params.id,
            userId: req.user._id
        });

        if (existingLike) {
            return next(new ErrorResponse('Already liked this memory', 400));
        }

        await Like.create({
            memoryId: req.params.id,
            userId: req.user._id,
            type: req.body.type || 'like'
        });

        memory.likesCount = (memory.likesCount || 0) + 1;
        await memory.save();

        if (memory.userId.toString() !== req.user._id.toString()) {
            await Notification.create({
                userId: memory.userId,
                type: 'like',
                content: `${req.user.username} liked your memory "${memory.title}"`,
                relatedUserId: req.user._id,
                relatedMemoryId: memory._id
            });
        }

        res.status(201).json({
            success: true,
            data: { liked: true, likesCount: memory.likesCount }
        });
    } catch (error) {
        next(error);
    }
};

export const unlikeMemory = async (req, res, next) => {
    try {
        const memory = await Memory.findById(req.params.id);

        if (!memory) {
            return next(new ErrorResponse('Memory not found', 404));
        }

        const like = await Like.findOneAndDelete({
            memoryId: req.params.id,
            userId: req.user._id
        });

        if (!like) {
            return next(new ErrorResponse('Not liked yet', 400));
        }

        memory.likesCount = Math.max((memory.likesCount || 1) - 1, 0);
        await memory.save();

        res.json({
            success: true,
            data: { liked: false, likesCount: memory.likesCount }
        });
    } catch (error) {
        next(error);
    }
};

export const getLikes = async (req, res, next) => {
    try {
        const likes = await Like.find({ memoryId: req.params.id })
            .populate('userId', 'username fullName avatarUrl');

        res.json({
            success: true,
            count: likes.length,
            data: likes
        });
    } catch (error) {
        next(error);
    }
};
