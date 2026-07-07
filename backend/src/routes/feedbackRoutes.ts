import { Router } from 'express';
import {
  submitFeedback,
  getFeedbacks,
  getFeedbackById,
  trackFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getMyFeedbacks,
  addAdminNote,
  getFeedbackStats,
  downloadFeedbackPDF,
} from '../controllers/feedbackController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { feedbackLimiter, uploadLimiter } from '../middleware/rateLimiter';
import { upload } from '../config/multer';

const router = Router();

router.get('/track/:trackingId', trackFeedback);
router.get('/stats', authenticate, authorize('admin', 'moderator'), getFeedbackStats);
router.get('/my', authenticate, getMyFeedbacks);

router.get('/', authenticate, getFeedbacks);
router.post(
  '/',
  optionalAuth,
  feedbackLimiter,
  upload.array('attachments', 5),
  submitFeedback
);

router.get('/:id/pdf', authenticate, authorize('admin', 'moderator', 'department_head'), downloadFeedbackPDF);
router.get('/:id', authenticate, getFeedbackById);
router.patch('/:id/status', authenticate, authorize('admin', 'moderator', 'department_head'), updateFeedbackStatus);
router.patch('/:id/note', authenticate, authorize('admin', 'moderator'), addAdminNote);
router.delete('/:id', authenticate, deleteFeedback);

export default router;

