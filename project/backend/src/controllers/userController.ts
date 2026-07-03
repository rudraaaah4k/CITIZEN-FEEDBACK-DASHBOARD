import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Feedback from '../models/Feedback';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, buildPagination } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getUsers = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { page = '1', limit = '10', role, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = Math.min(50, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, unknown> = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOptions: Record<string, 1 | -1> = {};
  sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(query)
      .populate('department', 'name code')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  sendSuccess(res, { users }, 'Users retrieved', 200, buildPagination(total, pageNum, limitNum));
});

export const getUserById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id).populate('department', 'name code');
  if (!user) return next(new AppError('User not found', 404));

  const feedbackStats = await Feedback.aggregate([
    { $match: { submittedBy: user._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      },
    },
  ]);

  sendSuccess(res, { user, feedbackStats: feedbackStats[0] || { total: 0, resolved: 0, pending: 0 } }, 'User retrieved');
});

export const updateUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { password, ...updateData } = req.body;

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) return next(new AppError('User not found', 404));

  sendSuccess(res, { user }, 'User updated');
});

export const toggleUserStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  if (user._id.toString() === req.user?.id) {
    return next(new AppError('Cannot deactivate your own account', 400));
  }

  user.isActive = !user.isActive;
  await user.save();

  sendSuccess(res, { user }, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
});

export const deleteUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  if (user._id.toString() === req.user?.id) {
    return next(new AppError('Cannot delete your own account', 400));
  }

  await user.deleteOne();
  sendSuccess(res, null, 'User deleted');
});

export const getUserStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const [totalUsers, roleBreakdown, recentUsers, activeUsers] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role avatar createdAt'),
    User.countDocuments({ isActive: true }),
  ]);

  sendSuccess(res, { totalUsers, roleBreakdown, recentUsers, activeUsers }, 'User stats retrieved');
});
