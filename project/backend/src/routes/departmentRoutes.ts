import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authenticate, authorize('admin'), createDepartment);
router.patch('/:id', authenticate, authorize('admin'), updateDepartment);
router.delete('/:id', authenticate, authorize('admin'), deleteDepartment);

export default router;
