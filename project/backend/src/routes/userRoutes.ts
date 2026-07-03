import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getUserStats,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('admin', 'moderator'));

router.get('/', getUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.patch('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
