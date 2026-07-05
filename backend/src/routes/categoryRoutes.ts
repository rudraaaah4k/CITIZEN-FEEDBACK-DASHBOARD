import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, buildPagination } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', catchAsync(async (req: Request, res: Response) => {
  const { department, isActive, page = '1', limit = '50' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  
  const query: Record<string, unknown> = {};
  if (department) query.department = department;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const [categories, total] = await Promise.all([
    Category.find(query)
      .populate('department', 'name code color')
      .sort({ name: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Category.countDocuments(query),
  ]);

  sendSuccess(res, { categories }, 'Categories retrieved', 200, buildPagination(total, pageNum, limitNum));
}));

router.post('/', authenticate, authorize('admin'), catchAsync(async (req: Request, res: Response) => {
  const category = await Category.create(req.body);
  sendSuccess(res, { category }, 'Category created', 201);
}));

router.patch('/:id', authenticate, authorize('admin'), catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return next(new AppError('Category not found', 404));
  sendSuccess(res, { category }, 'Category updated');
}));

router.delete('/:id', authenticate, authorize('admin'), catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return next(new AppError('Category not found', 404));
  sendSuccess(res, null, 'Category deleted');
}));

export default router;
