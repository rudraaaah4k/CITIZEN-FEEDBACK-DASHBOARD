import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, buildPagination } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { page = '1', limit = '20', isRead } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, unknown> = { recipient: req.user?.id };
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate('feedback', 'trackingId title status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user?.id, isRead: false }),
  ]);

  sendSuccess(
    res,
    { notifications, unreadCount },
    'Notifications retrieved',
    200,
    buildPagination(total, pageNum, limitNum)
  );
});

export const markAsRead = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user?.id },
    { isRead: true, readAt: new Date() }
  );

  sendSuccess(res, null, 'Notification marked as read');
});

export const markAllAsRead = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  await Notification.updateMany(
    { recipient: req.user?.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  sendSuccess(res, null, 'All notifications marked as read');
});

export const deleteNotification = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user?.id });
  sendSuccess(res, null, 'Notification deleted');
});

export const getUnreadCount = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const count = await Notification.countDocuments({ recipient: req.user?.id, isRead: false });
  sendSuccess(res, { count }, 'Unread count retrieved');
});
