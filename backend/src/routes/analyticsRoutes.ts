import { Router } from 'express';
import {
  getDashboardStats,
  getDepartmentAnalytics,
  getSentimentTrend,
  getTopicAnalysis,
  getEmotionAnalytics,
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('admin', 'moderator', 'department_head'));

router.get('/dashboard', getDashboardStats);
router.get('/departments', getDepartmentAnalytics);
router.get('/sentiment-trend', getSentimentTrend);
router.get('/topics', getTopicAnalysis);
router.get('/emotions', getEmotionAnalytics);

export default router;
