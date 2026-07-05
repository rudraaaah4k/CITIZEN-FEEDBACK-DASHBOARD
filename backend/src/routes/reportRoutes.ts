import { Router } from 'express';
import {
  generateReport,
  getReports,
  downloadReport,
  deleteReport,
} from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('admin', 'moderator'));

router.post('/generate', generateReport);
router.get('/', getReports);
router.get('/:id/download', downloadReport);
router.delete('/:id', deleteReport);

export default router;
