import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDepartment extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  description: string;
  head?: mongoose.Types.ObjectId;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  icon: string;
  color: string;
  totalFeedback: number;
  resolvedFeedback: number;
  avgResolutionTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, 'Department code cannot exceed 10 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    head: { type: Schema.Types.ObjectId, ref: 'User' },
    email: {
      type: String,
      required: [true, 'Department email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: { type: String },
    address: { type: String, maxlength: 300 },
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: 'Building2' },
    color: { type: String, default: '#6366f1' },
    totalFeedback: { type: Number, default: 0 },
    resolvedFeedback: { type: Number, default: 0 },
    avgResolutionTime: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

DepartmentSchema.index({ name: 1 });
DepartmentSchema.index({ code: 1 });
DepartmentSchema.index({ isActive: 1 });

const Department: Model<IDepartment> = mongoose.model<IDepartment>('Department', DepartmentSchema);
export default Department;
