import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Feedback from '../models/Feedback';
import User from '../models/User';
import Department from '../models/Department';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/apiResponse';

export const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalFeedback,
    previousMonthFeedback,
    totalUsers,
    resolvedFeedback,
    pendingFeedback,
    urgentFeedback,
    avgRatingResult,
    sentimentDist,
    statusDist,
    priorityDist,
    departmentStats,
    monthlyTrend,
    topKeywords,
    recentFeedback,
  ] = await Promise.all([
    Feedback.countDocuments(),
    Feedback.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    User.countDocuments({ role: 'citizen' }),
    Feedback.countDocuments({ status: 'resolved' }),
    Feedback.countDocuments({ status: 'pending' }),
    Feedback.countDocuments({ 'aiAnalysis.isUrgent': true }),
    Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    Feedback.aggregate([
      { $group: { _id: '$aiAnalysis.sentiment', count: { $sum: 1 } } },
    ]),
    Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Feedback.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Feedback.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          avgRating: { $avg: '$rating' },
          urgent: { $sum: { $cond: ['$aiAnalysis.isUrgent', 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept',
        },
      },
      { $unwind: '$dept' },
      {
        $project: {
          name: '$dept.name',
          code: '$dept.code',
          color: '$dept.color',
          total: 1,
          resolved: 1,
          avgRating: { $round: ['$avgRating', 1] },
          urgent: 1,
          resolutionRate: {
            $round: [{ $multiply: [{ $divide: ['$resolved', { $max: ['$total', 1] }] }, 100] }, 1],
          },
        },
      },
      { $sort: { total: -1 } },
    ]),
    Feedback.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          positive: { $sum: { $cond: [{ $eq: ['$aiAnalysis.sentiment', 'positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$aiAnalysis.sentiment', 'negative'] }, 1, 0] } },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          total: 1,
          resolved: 1,
          positive: 1,
          negative: 1,
          avgRating: { $round: ['$avgRating', 1] },
        },
      },
    ]),
    Feedback.aggregate([
      { $unwind: '$aiAnalysis.keywords' },
      { $group: { _id: '$aiAnalysis.keywords', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    Feedback.find()
      .populate('department', 'name code color')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status priority aiAnalysis.sentiment createdAt trackingId department category'),
  ]);

  const currentMonthCount = await Feedback.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  const feedbackGrowth =
    previousMonthFeedback > 0
      ? (((currentMonthCount - previousMonthFeedback) / previousMonthFeedback) * 100).toFixed(1)
      : '100';

  const resolutionRate = totalFeedback > 0
    ? ((resolvedFeedback / totalFeedback) * 100).toFixed(1)
    : '0';

  sendSuccess(res, {
    kpi: {
      totalFeedback,
      totalUsers,
      resolvedFeedback,
      pendingFeedback,
      urgentFeedback,
      avgRating: avgRatingResult[0]?.avg?.toFixed(1) || '0',
      resolutionRate: parseFloat(resolutionRate),
      feedbackGrowth: parseFloat(feedbackGrowth),
      currentMonthFeedback: currentMonthCount,
    },
    charts: {
      sentimentDistribution: sentimentDist,
      statusDistribution: statusDist,
      priorityDistribution: priorityDist,
      departmentStats,
      monthlyTrend,
      topKeywords: topKeywords.map((k) => ({ word: k._id, count: k.count })),
    },
    recentFeedback,
  }, 'Dashboard stats retrieved');
});

export const getDepartmentAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const analytics = await Feedback.aggregate([
    {
      $group: {
        _id: '$department',
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        positive: { $sum: { $cond: [{ $eq: ['$aiAnalysis.sentiment', 'positive'] }, 1, 0] } },
        negative: { $sum: { $cond: [{ $eq: ['$aiAnalysis.sentiment', 'negative'] }, 1, 0] } },
        neutral: { $sum: { $cond: [{ $eq: ['$aiAnalysis.sentiment', 'neutral'] }, 1, 0] } },
        avgRating: { $avg: '$rating' },
        critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
        urgent: { $sum: { $cond: ['$aiAnalysis.isUrgent', 1, 0] } },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: '$department' },
    {
      $project: {
        department: { name: 1, code: 1, color: 1, icon: 1 },
        total: 1,
        pending: 1,
        inProgress: 1,
        resolved: 1,
        rejected: 1,
        positive: 1,
        negative: 1,
        neutral: 1,
        avgRating: { $round: ['$avgRating', 2] },
        critical: 1,
        urgent: 1,
        resolutionRate: {
          $round: [
            { $multiply: [{ $divide: ['$resolved', { $max: ['$total', 1] }] }, 100] },
            1,
          ],
        },
      },
    },
    { $sort: { total: -1 } },
  ]);

  sendSuccess(res, { analytics }, 'Department analytics retrieved');
});

export const getSentimentTrend = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { period = '30' } = req.query;
  const days = parseInt(period as string);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const trend = await Feedback.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sentiment: '$aiAnalysis.sentiment',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  const heatmapData = await Feedback.aggregate([
    {
      $group: {
        _id: {
          hour: { $hour: '$createdAt' },
          dayOfWeek: { $dayOfWeek: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } },
  ]);

  sendSuccess(res, { trend, heatmapData }, 'Sentiment trend retrieved');
});

export const getTopicAnalysis = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const topics = await Feedback.aggregate([
    { $unwind: '$aiAnalysis.topics' },
    {
      $group: {
        _id: '$aiAnalysis.topics',
        count: { $sum: 1 },
        positive: { $sum: { $cond: [{ $eq: ['$aiAnalysis.sentiment', 'positive'] }, 1, 0] } },
        negative: { $sum: { $cond: [{ $eq: ['$aiAnalysis.sentiment', 'negative'] }, 1, 0] } },
        avgRating: { $avg: '$rating' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ]);

  sendSuccess(res, { topics }, 'Topic analysis retrieved');
});

// Personalized analytics for a single department: used on the department detail page.
// Mirrors the shape of the global dashboard/department comparison so the UI can render
// the same chart components, scoped to one department's real data.
export const getDepartmentAnalyticsById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid department id', 400));
  }

  const department = await Department.findById(id);
  if (!department) {
    return next(new AppError('Department not found', 404));
  }

  const deptObjectId = new mongoose.Types.ObjectId(id);

  const [
    totals,
    statusDist,
    sentimentDist,
    priorityDist,
    monthlyTrend,
    topKeywords,
    recentFeedback,
  ] = await Promise.all([
    Feedback.aggregate([
      { $match: { department: deptObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          urgent: { $sum: { $cond: ['$aiAnalysis.isUrgent', 1, 0] } },
          avgRating: { $avg: '$rating' },
        },
      },
    ]),
    Feedback.aggregate([
      { $match: { department: deptObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Feedback.aggregate([
      { $match: { department: deptObjectId } },
      { $group: { _id: '$aiAnalysis.sentiment', count: { $sum: 1 } } },
    ]),
    Feedback.aggregate([
      { $match: { department: deptObjectId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Feedback.aggregate([
      { $match: { department: deptObjectId } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
      { $project: { year: '$_id.year', month: '$_id.month', total: 1, resolved: 1 } },
    ]),
    Feedback.aggregate([
      { $match: { department: deptObjectId } },
      { $unwind: '$aiAnalysis.keywords' },
      { $group: { _id: '$aiAnalysis.keywords', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]),
    Feedback.find({ department: deptObjectId })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status priority aiAnalysis.sentiment createdAt trackingId category'),
  ]);

  sendSuccess(res, {
    department,
    totals: totals[0] || { total: 0, resolved: 0, pending: 0, urgent: 0, avgRating: 0 },
    charts: {
      statusDistribution: statusDist,
      sentimentDistribution: sentimentDist,
      priorityDistribution: priorityDist,
      monthlyTrend,
      topKeywords: topKeywords.map((k) => ({ word: k._id, count: k.count })),
    },
    recentFeedback,
  }, 'Department analytics retrieved');
});

export const getEmotionAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const emotions = await Feedback.aggregate([
    {
      $group: {
        _id: null,
        avgJoy: { $avg: '$aiAnalysis.emotions.joy' },
        avgAnger: { $avg: '$aiAnalysis.emotions.anger' },
        avgFear: { $avg: '$aiAnalysis.emotions.fear' },
        avgSadness: { $avg: '$aiAnalysis.emotions.sadness' },
        avgSurprise: { $avg: '$aiAnalysis.emotions.surprise' },
        avgDisgust: { $avg: '$aiAnalysis.emotions.disgust' },
        count: { $sum: 1 },
      },
    },
  ]);

  sendSuccess(res, { emotions: emotions[0] || {} }, 'Emotion analytics retrieved');
});
