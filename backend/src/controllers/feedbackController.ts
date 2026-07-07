import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import Feedback, { FeedbackStatus } from '../models/Feedback';
import Department from '../models/Department';
import Category from '../models/Category';
import Notification from '../models/Notification';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, buildPagination } from '../utils/apiResponse';
import { analyzeText } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';
import { sendFeedbackStatusEmail } from '../utils/emailService';
import { emitToUser, emitToAdmins, emitToFeedback } from '../config/socket';
import logger from '../utils/logger';

export const submitFeedback = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const {
    title,
    description,
    department,
    category,
    priority,
    rating,
    location,
    isAnonymous,
    tags,
    isPublic,
  } = req.body;

  const deptExists = await Department.findById(department);
  if (!deptExists) return next(new AppError('Department not found', 404));

  const catExists = await Category.findById(category);
  if (!catExists) return next(new AppError('Category not found', 404));

  const attachments = (req.files as Express.Multer.File[] || []).map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    url: `/uploads/${file.filename}`,
  }));

  const aiAnalysis = await analyzeText(title, description);

  if (aiAnalysis.isSpam) {
    return next(new AppError('Your feedback was detected as spam. Please submit genuine feedback.', 400));
  }

  const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

  const feedback = await Feedback.create({
    title,
    description,
    department,
    category,
    priority: aiAnalysis.isUrgent ? 'critical' : priority || 'medium',
    rating: parseInt(rating) || 3,
    location: parsedLocation || {},
    attachments,
    submittedBy: isAnonymous === 'true' || isAnonymous === true ? undefined : req.user?.id,
    isAnonymous: isAnonymous === 'true' || isAnonymous === true,
    aiAnalysis,
    tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    isPublic: isPublic !== false,
    statusHistory: req.user?.id ? [{
      status: 'pending',
      changedBy: req.user.id,
      changedAt: new Date(),
      note: 'Feedback submitted',
    }] : [],
  });

  await Department.findByIdAndUpdate(department, { $inc: { totalFeedback: 1 } });
  await Category.findByIdAndUpdate(category, { $inc: { feedbackCount: 1 } });

  if (req.user?.id && !feedback.isAnonymous) {
    await Notification.create({
      recipient: req.user.id,
      type: 'feedback_submitted',
      title: 'Feedback Submitted Successfully',
      message: `Your feedback "${title}" has been submitted. Tracking ID: ${feedback.trackingId}`,
      feedback: feedback._id,
      data: { trackingId: feedback.trackingId },
    });
  }

  const admins = await User.find({ role: { $in: ['admin', 'moderator'] } }).select('_id');
  if (admins.length > 0) {
    await Notification.insertMany(
      admins.map((admin) => ({
        recipient: admin._id,
        type: 'feedback_submitted',
        title: 'New Feedback Received',
        message: `New ${aiAnalysis.isUrgent ? '🚨 URGENT ' : ''}feedback: "${title}" in ${deptExists.name} department.`,
        feedback: feedback._id,
        data: { trackingId: feedback.trackingId, isUrgent: aiAnalysis.isUrgent },
      }))
    );
  }

  await feedback.populate([
    { path: 'department', select: 'name code color' },
    { path: 'category', select: 'name color' },
  ]);

  // Real-time: notify admins so the dashboard, department view and feedback list
  // can refresh immediately instead of waiting for the next poll.
  emitToAdmins('feedback:new', { feedback });
  admins.forEach((admin) => {
    emitToUser(admin._id.toString(), 'notification:new', {
      title: 'New Feedback Received',
      message: `New ${aiAnalysis.isUrgent ? 'urgent ' : ''}feedback: "${title}" in ${deptExists.name} department.`,
      type: 'feedback_submitted',
    });
  });

  sendSuccess(res, { feedback }, 'Feedback submitted successfully', 201);
});

export const getFeedbacks = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const {
    page = '1',
    limit = '10',
    status,
    priority,
    department,
    category,
    sentiment,
    isUrgent,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate,
    endDate,
    isAnonymous,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const query: mongoose.FilterQuery<typeof Feedback> = {};

  if (req.user?.role === 'citizen') {
    query.submittedBy = req.user.id;
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (department) query.department = department;
  if (category) query.category = category;
  if (sentiment) query['aiAnalysis.sentiment'] = sentiment;
  if (isUrgent === 'true') query['aiAnalysis.isUrgent'] = true;
  if (isAnonymous === 'true') query.isAnonymous = true;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }

  if (search) {
    query.$text = { $search: search as string };
  }

  const sortOptions: Record<string, 1 | -1> = {};
  sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [feedbacks, total] = await Promise.all([
    Feedback.find(query)
      .populate('department', 'name code color icon')
      .populate('category', 'name color icon')
      .populate('submittedBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Feedback.countDocuments(query),
  ]);

  sendSuccess(
    res,
    { feedbacks },
    'Feedbacks retrieved successfully',
    200,
    buildPagination(total, pageNum, limitNum)
  );
});

export const getFeedbackById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('department', 'name code color icon email')
    .populate('category', 'name color icon')
    .populate('submittedBy', 'name email avatar')
    .populate('assignedTo', 'name email avatar role')
    .populate('statusHistory.changedBy', 'name role');

  if (!feedback) {
    return next(new AppError('Feedback not found', 404));
  }

  if (
    req.user?.role === 'citizen' &&
    !feedback.isAnonymous &&
    feedback.submittedBy &&
    (feedback.submittedBy as unknown as { _id: { toString(): string } })._id.toString() !== req.user.id
  ) {
    return next(new AppError('Access denied', 403));
  }

  await Feedback.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

  sendSuccess(res, { feedback }, 'Feedback retrieved successfully');
});

export const trackFeedback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { trackingId } = req.params;

  const feedback = await Feedback.findOne({ trackingId: trackingId.toUpperCase() })
    .populate('department', 'name code color icon')
    .populate('category', 'name')
    .select('-adminNotes -submittedBy -anonymousToken');

  if (!feedback) {
    return next(new AppError('No feedback found with this tracking ID', 404));
  }

  sendSuccess(res, { feedback }, 'Feedback retrieved successfully');
});

export const updateFeedbackStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, note, assignedTo } = req.body;

  const feedback = await Feedback.findById(id).populate('submittedBy', 'name email notificationPreferences');

  if (!feedback) {
    return next(new AppError('Feedback not found', 404));
  }

  const previousStatus = feedback.status;

  const updateData: Partial<{
    status: FeedbackStatus;
    assignedTo: string;
    resolvedAt: Date;
    closedAt: Date;
    resolutionNotes: string;
  }> = { status };
  
  if (assignedTo) updateData.assignedTo = assignedTo;
  if (status === 'resolved') {
    updateData.resolvedAt = new Date();
    const dept = await Department.findById(feedback.department);
    if (dept) {
      await Department.findByIdAndUpdate(feedback.department, {
        $inc: { resolvedFeedback: 1 },
      });
    }
  }
  if (status === 'closed') updateData.closedAt = new Date();
  if (note) updateData.resolutionNotes = note;

  await Feedback.findByIdAndUpdate(id, {
    ...updateData,
    $push: {
      statusHistory: {
        status,
        changedBy: req.user?.id,
        changedAt: new Date(),
        note,
      },
    },
  });

  const updatedFeedback = await Feedback.findById(id)
    .populate('department', 'name code')
    .populate('category', 'name')
    .populate('submittedBy', 'name email notificationPreferences');

  if (
    updatedFeedback?.submittedBy &&
    !updatedFeedback.isAnonymous
  ) {
    const submitter = updatedFeedback.submittedBy as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
      notificationPreferences: { email: boolean };
    };

    await Notification.create({
      recipient: submitter._id,
      type: 'status_changed',
      title: `Feedback Status Updated`,
      message: `Your feedback "${feedback.title}" status changed from ${previousStatus} to ${status}.${note ? ` Note: ${note}` : ''}`,
      feedback: feedback._id,
      data: { trackingId: feedback.trackingId, previousStatus, newStatus: status },
    });

    emitToUser(submitter._id.toString(), 'notification:new', {
      title: 'Feedback Status Updated',
      message: `Your feedback "${feedback.title}" is now ${status.replace('_', ' ')}.`,
      type: 'status_changed',
    });

    if (submitter.notificationPreferences?.email) {
      try {
        await sendFeedbackStatusEmail(
          submitter.name,
          submitter.email,
          feedback.trackingId,
          status,
          note
        );
      } catch {
        logger.warn(`Status email failed for ${submitter.email}`);
      }
    }
  }

  // Real-time: push the updated feedback to anyone viewing this specific feedback,
  // to admins managing the list/dashboard, and to the submitter directly.
  emitToFeedback(id, 'feedback:updated', { feedback: updatedFeedback });
  emitToAdmins('feedback:updated', { feedback: updatedFeedback });
  if (updatedFeedback?.submittedBy) {
    const submitterId = (updatedFeedback.submittedBy as unknown as { _id: mongoose.Types.ObjectId })._id.toString();
    emitToUser(submitterId, 'feedback:updated', { feedback: updatedFeedback });
  }

  sendSuccess(res, { feedback: updatedFeedback }, 'Feedback status updated successfully');
});

export const deleteFeedback = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(new AppError('Feedback not found', 404));
  }

  if (
    req.user?.role === 'citizen' &&
    feedback.submittedBy?.toString() !== req.user.id
  ) {
    return next(new AppError('Access denied', 403));
  }

  await feedback.deleteOne();

  await Department.findByIdAndUpdate(feedback.department, { $inc: { totalFeedback: -1 } });
  await Category.findByIdAndUpdate(feedback.category, { $inc: { feedbackCount: -1 } });

  sendSuccess(res, null, 'Feedback deleted successfully');
});

export const getMyFeedbacks = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { page = '1', limit = '10', status } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  const query: mongoose.FilterQuery<typeof Feedback> = { submittedBy: req.user?.id };
  if (status) query.status = status;

  const [feedbacks, total] = await Promise.all([
    Feedback.find(query)
      .populate('department', 'name code color')
      .populate('category', 'name color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Feedback.countDocuments(query),
  ]);

  sendSuccess(
    res,
    { feedbacks },
    'Your feedbacks retrieved',
    200,
    buildPagination(total, pageNum, limitNum)
  );
});

export const addAdminNote = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { note } = req.body;

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { adminNotes: note },
    { new: true }
  );

  if (!feedback) return next(new AppError('Feedback not found', 404));

  sendSuccess(res, { feedback }, 'Admin note added');
});

export const getFeedbackStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const [
    totalCount,
    statusCounts,
    sentimentCounts,
    priorityCounts,
    urgentCount,
    avgRating,
  ] = await Promise.all([
    Feedback.countDocuments(),
    Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Feedback.aggregate([
      { $group: { _id: '$aiAnalysis.sentiment', count: { $sum: 1 } } },
    ]),
    Feedback.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Feedback.countDocuments({ 'aiAnalysis.isUrgent': true }),
    Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
  ]);

  const resolvedCount = statusCounts.find((s) => s._id === 'resolved')?.count || 0;
  const resolutionRate = totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(1) : '0';

  sendSuccess(res, {
    total: totalCount,
    statusBreakdown: statusCounts,
    sentimentBreakdown: sentimentCounts,
    priorityBreakdown: priorityCounts,
    urgentCount,
    avgRating: avgRating[0]?.avg?.toFixed(1) || '0',
    resolutionRate: parseFloat(resolutionRate),
  }, 'Stats retrieved');
});

// Generates a one-off PDF summary for a single piece of feedback, on demand.
// This lives on the feedback summary page and replaces the old, generic
// batch "Reports" feature.
export const downloadFeedbackPDF = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('department', 'name code email')
    .populate('category', 'name')
    .populate('submittedBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('statusHistory.changedBy', 'name role');

  if (!feedback) {
    return next(new AppError('Feedback not found', 404));
  }

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const safeId = feedback.trackingId || feedback._id.toString();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="feedback-summary-${safeId}.pdf"`);

  doc.pipe(res);

  const department = feedback.department as unknown as { name?: string; code?: string } | undefined;
  const category = feedback.category as unknown as { name?: string } | undefined;
  const submittedBy = feedback.submittedBy as unknown as { name?: string; email?: string } | undefined;

  doc
    .fontSize(20)
    .fillColor('#1e1b4b')
    .text('Feedback Summary Report', { align: 'center' })
    .moveDown(0.5);

  doc
    .fontSize(10)
    .fillColor('#64748b')
    .text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' })
    .moveDown(1.5);

  const addRow = (label: string, value: string) => {
    doc.fontSize(11).fillColor('#334155').font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').fillColor('#0f172a').text(value || 'N/A');
  };

  doc.fontSize(14).fillColor('#1e1b4b').font('Helvetica-Bold').text('Overview').moveDown(0.3);
  addRow('Tracking ID', feedback.trackingId);
  addRow('Title', feedback.title);
  addRow('Status', feedback.status.replace('_', ' '));
  addRow('Priority', feedback.priority);
  addRow('Rating', `${feedback.rating} / 5`);
  addRow('Department', department?.name || 'N/A');
  addRow('Category', category?.name || 'N/A');
  addRow('Submitted By', feedback.isAnonymous ? 'Anonymous' : submittedBy?.name || 'Unknown');
  addRow('Submitted On', new Date(feedback.createdAt).toLocaleString());
  if (feedback.resolvedAt) addRow('Resolved On', new Date(feedback.resolvedAt).toLocaleString());
  doc.moveDown(1);

  doc.fontSize(14).fillColor('#1e1b4b').font('Helvetica-Bold').text('Description').moveDown(0.3);
  doc.fontSize(11).font('Helvetica').fillColor('#0f172a').text(feedback.description, { align: 'left' }).moveDown(1);

  if (feedback.aiAnalysis) {
    doc.fontSize(14).fillColor('#1e1b4b').font('Helvetica-Bold').text('AI Analysis').moveDown(0.3);
    addRow('Sentiment', feedback.aiAnalysis.sentiment);
    addRow('Urgency Score', `${Math.round((feedback.aiAnalysis.urgencyScore || 0) * 100)}%`);
    addRow('Language', (feedback.aiAnalysis.language || 'N/A').toUpperCase());
    if (feedback.aiAnalysis.keywords?.length) addRow('Keywords', feedback.aiAnalysis.keywords.join(', '));
    if (feedback.aiAnalysis.summary) addRow('AI Summary', feedback.aiAnalysis.summary);
    doc.moveDown(1);
  }

  if (feedback.resolutionNotes) {
    doc.fontSize(14).fillColor('#1e1b4b').font('Helvetica-Bold').text('Resolution Notes').moveDown(0.3);
    doc.fontSize(11).font('Helvetica').fillColor('#0f172a').text(feedback.resolutionNotes).moveDown(1);
  }

  if (feedback.statusHistory?.length) {
    doc.fontSize(14).fillColor('#1e1b4b').font('Helvetica-Bold').text('Status Timeline').moveDown(0.3);
    feedback.statusHistory.forEach((h) => {
      const changedBy = h.changedBy as unknown as { name?: string } | undefined;
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#334155')
        .text(`${new Date(h.changedAt).toLocaleString()} — ${h.status.replace('_', ' ')}${changedBy?.name ? ` (by ${changedBy.name})` : ''}${h.note ? `: ${h.note}` : ''}`);
    });
  }

  doc.end();
});

