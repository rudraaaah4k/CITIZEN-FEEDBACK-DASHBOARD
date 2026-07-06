import mongoose, { Document, Schema, Model } from 'mongoose';

export type FeedbackStatus = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface IAttachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

export interface IAIAnalysis {
  sentiment: SentimentType;
  sentimentScore: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
  keywords: string[];
  topics: string[];
  isSpam: boolean;
  spamScore: number;
  urgencyScore: number;
  isUrgent: boolean;
  language: string;
  summary: string;
  recommendations: string[];
  toxicityScore: number;
  subjectivity: number;
  analyzedAt: Date;
}

export interface IStatusHistory {
  status: FeedbackStatus;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
  note?: string;
}

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  trackingId: string;
  title: string;
  description: string;
  department: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  rating: number;
  location: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  attachments: IAttachment[];
  submittedBy?: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  anonymousToken?: string;
  assignedTo?: mongoose.Types.ObjectId;
  aiAnalysis: IAIAnalysis;
  statusHistory: IStatusHistory[];
  adminNotes?: string;
  resolutionNotes?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  dueDate?: Date;
  tags: string[];
  viewCount: number;
  upvotes: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true },
});

const AIAnalysisSchema = new Schema<IAIAnalysis>({
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
  sentimentScore: { type: Number, default: 0, min: -1, max: 1 },
  emotions: {
    joy: { type: Number, default: 0 },
    anger: { type: Number, default: 0 },
    fear: { type: Number, default: 0 },
    sadness: { type: Number, default: 0 },
    surprise: { type: Number, default: 0 },
    disgust: { type: Number, default: 0 },
  },
  keywords: [{ type: String }],
  topics: [{ type: String }],
  isSpam: { type: Boolean, default: false },
  spamScore: { type: Number, default: 0 },
  urgencyScore: { type: Number, default: 0 },
  isUrgent: { type: Boolean, default: false },
  language: { type: String, default: 'en' },
  summary: { type: String },
  recommendations: [{ type: String }],
  toxicityScore: { type: Number, default: 0 },
  subjectivity: { type: Number, default: 0 },
  analyzedAt: { type: Date },
});

const StatusHistorySchema = new Schema<IStatusHistory>({
  status: {
    type: String,
    enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected', 'closed'],
    required: true,
  },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
  note: { type: String, maxlength: 500 },
});

const FeedbackSchema = new Schema<IFeedback>(
  {
    trackingId: {
      type: String,
      unique: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected', 'closed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    attachments: [AttachmentSchema],
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isAnonymous: { type: Boolean, default: false },
    anonymousToken: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    aiAnalysis: { type: AIAnalysisSchema, default: {} },
    statusHistory: [StatusHistorySchema],
    adminNotes: { type: String, maxlength: 2000 },
    resolutionNotes: { type: String, maxlength: 2000 },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    dueDate: { type: Date },
    tags: [{ type: String }],
    viewCount: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate tracking ID
FeedbackSchema.pre('save', async function (next) {
  if (!this.trackingId) {
    const prefix = 'CFB';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.trackingId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Indexes for performance

FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ priority: 1 });
FeedbackSchema.index({ department: 1 });
FeedbackSchema.index({ category: 1 });
FeedbackSchema.index({ submittedBy: 1 });
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ 'aiAnalysis.sentiment': 1 });
FeedbackSchema.index({ 'aiAnalysis.isUrgent': 1 });
FeedbackSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Feedback: Model<IFeedback> = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
export default Feedback;
