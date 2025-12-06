import Comment from '../models/Comment.js';
import Memory from '../models/Memory.js';
import Notification from '../models/Notification.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

export const getComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ memoryId: req.params.memoryId })
            .populate('userId', 'username fullName avatarUrl')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        next(error);
    }
};

export const createComment = async (req, res, next) => {
    try {
        const memory = await Memory.findById(req.params.memoryId);

        if (!memory) {
            return next(new ErrorResponse('Memory not found', 404));
        }

        const comment = await Comment.create({
            memoryId: req.params.memoryId,
            userId: req.user._id,
            content: req.body.content
        });

        memory.commentsCount = (memory.commentsCount || 0) + 1;
        await memory.save();

        await comment.populate('userId', 'username fullName avatarUrl');

        if (memory.userId.toString() !== req.user._id.toString()) {
            await Notification.create({
                userId: memory.userId,
                type: 'comment',
                content: `${req.user.username} commented on your memory "${memory.title}"`,
                relatedUserId: req.user._id,
                relatedMemoryId: memory._id
            });
        }

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

export const updateComment = async (req, res, next) => {
    try {
        let comment = await Comment.findById(req.params.id);

        if (!comment) {
            return next(new ErrorResponse('Comment not found', 404));
        }

        if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized to update this comment', 403));
        }

        comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { content: req.body.content },
            { new: true, runValidators: true }
        ).populate('userId', 'username fullName avatarUrl');

        res.json({
            success: true,
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

export const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return next(new ErrorResponse('Comment not found', 404));
        }

        if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized to delete this comment', 403));
        }

        const memory = await Memory.findById(comment.memoryId);
        if (memory) {
            memory.commentsCount = Math.max((memory.commentsCount || 1) - 1, 0);
            await memory.save();
        }

        await comment.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
