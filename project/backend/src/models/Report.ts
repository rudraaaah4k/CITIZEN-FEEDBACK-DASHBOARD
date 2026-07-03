import mongoose, { Document, Schema, Model } from 'mongoose';

export type ReportType = 'feedback_summary' | 'department_analysis' | 'sentiment_report' | 'user_activity' | 'custom';
export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type ReportStatus = 'generating' | 'ready' | 'failed';

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  generatedBy: mongoose.Types.ObjectId;
  filters: {
    startDate?: Date;
    endDate?: Date;
    department?: mongoose.Types.ObjectId;
    status?: string;
    category?: string;
  };
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;
  recordCount: number;
  errorMessage?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ['feedback_summary', 'department_analysis', 'sentiment_report', 'user_activity', 'custom'],
      required: true,
    },
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv'],
      required: true,
    },
    status: {
      type: String,
      enum: ['generating', 'ready', 'failed'],
      default: 'generating',
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filters: {
      startDate: { type: Date },
      endDate: { type: Date },
      department: { type: Schema.Types.ObjectId, ref: 'Department' },
      status: { type: String },
      category: { type: String },
    },
    filePath: { type: String },
    fileUrl: { type: String },
    fileSize: { type: Number },
    recordCount: { type: Number, default: 0 },
    errorMessage: { type: String },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

ReportSchema.index({ generatedBy: 1, createdAt: -1 });
ReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Report: Model<IReport> = mongoose.model<IReport>('Report', ReportSchema);
export default Report;
