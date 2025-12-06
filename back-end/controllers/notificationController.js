import Notification from '../models/Notification.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .populate('relatedUserId', 'username fullName avatarUrl')
            .populate('relatedMemoryId', 'title imageUrl')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user._id,
            read: false
        });

        res.json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return next(new ErrorResponse('Notification not found', 404));
        }

        if (notification.userId.toString() !== req.user._id.toString()) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        notification.read = true;
        await notification.save();

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { read: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return next(new ErrorResponse('Notification not found', 404));
        }

        if (notification.userId.toString() !== req.user._id.toString()) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        await notification.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

export const clearAllNotifications = async (req, res, next) => {
    try {
        await Notification.deleteMany({ userId: req.user._id });

        res.json({
            success: true,
            message: 'All notifications cleared'
        });
    } catch (error) {
        next(error);
    }
};
