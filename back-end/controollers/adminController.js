import User from '../models/User.js';
import Memory from '../models/Memory.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Report from '../models/Report.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMemories = await Memory.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalLikes = await Like.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    const newMemoriesToday = await Memory.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    const recentUsers = await User.find()
      .select('username fullName avatarUrl createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentMemories = await Memory.find()
      .populate('userId', 'username')
      .select('title category createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalMemories,
          totalComments,
          totalLikes,
          pendingReports,
          newUsersToday,
          newMemoriesToday
        },
        recentUsers,
        recentMemories
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q, role, status } = req.query;
    
    let query = {};
    
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'creator', 'admin'].includes(role)) {
      return next(new ErrorResponse('Invalid role', 400));
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended', 'deleted'].includes(status)) {
      return next(new ErrorResponse('Invalid status', 400));
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    
    const reports = await Report.find({ status })
      .populate('reporterId', 'username fullName')
      .populate('reportedUserId', 'username fullName')
      .populate('reportedMemoryId', 'title')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

export const reviewReport = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;
    
    if (!['reviewed', 'resolved', 'dismissed'].includes(status)) {
      return next(new ErrorResponse('Invalid status', 400));
    }
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true }
    )
      .populate('reporterId', 'username fullName')
      .populate('reportedUserId', 'username fullName')
      .populate('reportedMemoryId', 'title');
    
    if (!report) {
      return next(new ErrorResponse('Report not found', 404));
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMemoryAdmin = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return next(new ErrorResponse('Memory not found', 404));
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
