import { Request, Response, NextFunction } from 'express';
import Department from '../models/Department';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, buildPagination } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getDepartments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { page = '1', limit = '20', search, isActive } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, unknown> = {};
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const [departments, total] = await Promise.all([
    Department.find(query)
      .populate('head', 'name email avatar')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum),
    Department.countDocuments(query),
  ]);

  sendSuccess(res, { departments }, 'Departments retrieved', 200, buildPagination(total, pageNum, limitNum));
});

export const getDepartmentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const department = await Department.findById(req.params.id)
    .populate('head', 'name email avatar role');

  if (!department) return next(new AppError('Department not found', 404));

  sendSuccess(res, { department }, 'Department retrieved');
});

export const createDepartment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const department = await Department.create(req.body);
  sendSuccess(res, { department }, 'Department created', 201);
});

export const updateDepartment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!department) return next(new AppError('Department not found', 404));

  sendSuccess(res, { department }, 'Department updated');
});

export const deleteDepartment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const department = await Department.findById(req.params.id);
  if (!department) return next(new AppError('Department not found', 404));

  await department.deleteOne();
  sendSuccess(res, null, 'Department deleted');
});
