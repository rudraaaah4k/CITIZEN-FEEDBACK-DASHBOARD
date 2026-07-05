import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import Report from '../models/Report';
import Feedback from '../models/Feedback';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

const generateCSV = (data: Record<string, unknown>[]): string => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => {
      const value = row[header];
      const str = value !== null && value !== undefined ? String(value) : '';
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

export const generateReport = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, type, format, filters } = req.body;

  const report = await Report.create({
    name,
    type,
    format,
    generatedBy: req.user?.id,
    filters: filters || {},
    status: 'generating',
    recordCount: 0,
  });

  setImmediate(async () => {
    try {
      const query: Record<string, unknown> = {};
      
      if (filters?.startDate) query.createdAt = { $gte: new Date(filters.startDate) };
      if (filters?.endDate) {
        const existingDate = query.createdAt as Record<string, unknown> || {};
        query.createdAt = { ...existingDate, $lte: new Date(filters.endDate) };
      }
      if (filters?.department) query.department = filters.department;
      if (filters?.status) query.status = filters.status;

      const feedbacks = await Feedback.find(query)
        .populate('department', 'name code')
        .populate('category', 'name')
        .populate('submittedBy', 'name email')
        .lean();

      const reportData = feedbacks.map((f) => ({
        trackingId: f.trackingId,
        title: f.title,
        status: f.status,
        priority: f.priority,
        department: (f.department as { name?: string })?.name || 'N/A',
        category: (f.category as { name?: string })?.name || 'N/A',
        sentiment: f.aiAnalysis?.sentiment || 'N/A',
        rating: f.rating,
        isUrgent: f.aiAnalysis?.isUrgent ? 'Yes' : 'No',
        submittedAt: f.createdAt,
        resolvedAt: f.resolvedAt || 'N/A',
        isAnonymous: f.isAnonymous ? 'Yes' : 'No',
        summary: f.aiAnalysis?.summary || 'N/A',
      }));

      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      if (format === 'csv') {
        fileContent = generateCSV(reportData);
        fileName = `report-${report._id}.csv`;
        mimeType = 'text/csv';
      } else {
        fileContent = JSON.stringify(reportData, null, 2);
        fileName = `report-${report._id}.json`;
        mimeType = 'application/json';
      }

      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

      const filePath = path.join(reportsDir, fileName);
      fs.writeFileSync(filePath, fileContent);

      await Report.findByIdAndUpdate(report._id, {
        status: 'ready',
        filePath,
        fileUrl: `/reports/${fileName}`,
        fileSize: fs.statSync(filePath).size,
        recordCount: feedbacks.length,
      });
    } catch (err) {
      logger.error(`Report generation failed: ${err}`);
      await Report.findByIdAndUpdate(report._id, {
        status: 'failed',
        errorMessage: String(err),
      });
    }
  });

  sendSuccess(res, { report }, 'Report generation started', 202);
});

export const getReports = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const reports = await Report.find({ generatedBy: req.user?.id })
    .sort({ createdAt: -1 })
    .limit(20);

  sendSuccess(res, { reports }, 'Reports retrieved');
});

export const downloadReport = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const report = await Report.findById(req.params.id);

  if (!report) return next(new AppError('Report not found', 404));
  if (report.status !== 'ready') return next(new AppError('Report is not ready for download', 400));
  if (!report.filePath || !fs.existsSync(report.filePath)) {
    return next(new AppError('Report file not found', 404));
  }

  res.download(report.filePath, `${report.name}.${report.format}`);
});

export const deleteReport = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const report = await Report.findOneAndDelete({
    _id: req.params.id,
    generatedBy: req.user?.id,
  });

  if (!report) return next(new AppError('Report not found', 404));

  if (report.filePath && fs.existsSync(report.filePath)) {
    fs.unlinkSync(report.filePath);
  }

  sendSuccess(res, null, 'Report deleted');
});
