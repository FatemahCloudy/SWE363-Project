import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

export const signup = async (req, res, next) => {
    try {
        const { username, email, password, fullName } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return next(new ErrorResponse('Email already registered', 400));
            }
            if (existingUser.username === username) {
                return next(new ErrorResponse('Username already taken', 400));
            }
        }

        const user = await User.create({
            username,
            email,
            password,
            fullName,
            role: 'user'
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        if (user.status !== 'active') {
            return next(new ErrorResponse('Account is not active', 401));
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const allowedFields = ['fullName', 'bio', 'avatarUrl', 'coverUrl', 'location'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

export const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return next(new ErrorResponse('Current password is incorrect', 400));
        }

        user.password = newPassword;
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};
