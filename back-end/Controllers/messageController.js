import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

export const getConversations = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: userId }, { receiverId: userId }]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ['$senderId', userId] },
                            then: '$receiverId',
                            else: '$senderId'
                        }
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$read', false] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    user: {
                        _id: 1,
                        username: 1,
                        fullName: 1,
                        avatarUrl: 1
                    },
                    lastMessage: 1,
                    unreadCount: 1
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const partnerId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: partnerId },
                { senderId: partnerId, receiverId: userId }
            ]
        })
            .populate('senderId', 'username fullName avatarUrl')
            .populate('receiverId', 'username fullName avatarUrl')
            .sort({ createdAt: 1 });

        await Message.updateMany(
            { senderId: partnerId, receiverId: userId, read: false },
            { read: true }
        );

        res.json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { receiverId, content } = req.body;

        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return next(new ErrorResponse('Receiver not found', 404));
        }

        if (receiverId === req.user._id.toString()) {
            return next(new ErrorResponse('Cannot send message to yourself', 400));
        }

        const message = await Message.create({
            senderId: req.user._id,
            receiverId,
            content
        });

        await message.populate('senderId', 'username fullName avatarUrl');
        await message.populate('receiverId', 'username fullName avatarUrl');

        await Notification.create({
            userId: receiverId,
            type: 'message',
            content: `${req.user.username} sent you a message`,
            relatedUserId: req.user._id
        });

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return next(new ErrorResponse('Message not found', 404));
        }

        if (message.receiverId.toString() !== req.user._id.toString()) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        message.read = true;
        await message.save();

        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return next(new ErrorResponse('Message not found', 404));
        }

        if (message.senderId.toString() !== req.user._id.toString()) {
            return next(new ErrorResponse('Not authorized to delete this message', 403));
        }

        await message.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
