import User from '../models/User.js';
import Memory from '../models/Memory.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

export const getUsers = async (req, res, next) => {
    try {
        const { q } = req.query;

        let query = { status: 'active' };

        if (q) {
            query.$or = [
                { username: { $regex: q, $options: 'i' } },
                { fullName: { $regex: q, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .limit(50);

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        const followersCount = await Follow.countDocuments({ followingId: user._id });
        const followingCount = await Follow.countDocuments({ followerId: user._id });
        const memoriesCount = await Memory.countDocuments({ userId: user._id });

        res.json({
            success: true,
            data: {
                ...user.toJSON(),
                followersCount,
                followingCount,
                memoriesCount
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getUserByUsername = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        const followersCount = await Follow.countDocuments({ followingId: user._id });
        const followingCount = await Follow.countDocuments({ followerId: user._id });
        const memoriesCount = await Memory.countDocuments({ userId: user._id });

        let isFollowing = false;
        if (req.user) {
            const follow = await Follow.findOne({
                followerId: req.user._id,
                followingId: user._id
            });
            isFollowing = !!follow;
        }

        res.json({
            success: true,
            data: {
                ...user.toJSON(),
                followersCount,
                followingCount,
                memoriesCount,
                isFollowing
            }
        });
    } catch (error) {
        next(error);
    }
};

export const followUser = async (req, res, next) => {
    try {
        const userToFollow = await User.findById(req.params.id);

        if (!userToFollow) {
            return next(new ErrorResponse('User not found', 404));
        }

        if (req.params.id === req.user._id.toString()) {
            return next(new ErrorResponse('Cannot follow yourself', 400));
        }

        const existingFollow = await Follow.findOne({
            followerId: req.user._id,
            followingId: req.params.id
        });

        if (existingFollow) {
            return next(new ErrorResponse('Already following this user', 400));
        }

        await Follow.create({
            followerId: req.user._id,
            followingId: req.params.id
        });

        await Notification.create({
            userId: req.params.id,
            type: 'follow',
            content: `${req.user.username} started following you`,
            relatedUserId: req.user._id
        });

        res.status(201).json({
            success: true,
            data: { following: true }
        });
    } catch (error) {
        next(error);
    }
};

export const unfollowUser = async (req, res, next) => {
    try {
        const follow = await Follow.findOneAndDelete({
            followerId: req.user._id,
            followingId: req.params.id
        });

        if (!follow) {
            return next(new ErrorResponse('Not following this user', 400));
        }

        res.json({
            success: true,
            data: { following: false }
        });
    } catch (error) {
        next(error);
    }
};

export const getFollowers = async (req, res, next) => {
    try {
        const follows = await Follow.find({ followingId: req.params.id })
            .populate('followerId', 'username fullName avatarUrl bio');

        const followers = follows.map(f => f.followerId);

        res.json({
            success: true,
            count: followers.length,
            data: followers
        });
    } catch (error) {
        next(error);
    }
};

export const getFollowing = async (req, res, next) => {
    try {
        const follows = await Follow.find({ followerId: req.params.id })
            .populate('followingId', 'username fullName avatarUrl bio');

        const following = follows.map(f => f.followingId);

        res.json({
            success: true,
            count: following.length,
            data: following
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        await Memory.deleteMany({ userId: req.params.id });
        await Follow.deleteMany({ $or: [{ followerId: req.params.id }, { followingId: req.params.id }] });
        await Notification.deleteMany({ $or: [{ userId: req.params.id }, { relatedUserId: req.params.id }] });

        await user.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
