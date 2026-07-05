import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISettings extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  value: unknown;
  category: string;
  description: string;
  isPublic: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['general', 'email', 'notifications', 'ai', 'security', 'appearance'],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isPublic: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

SettingsSchema.index({ key: 1 });
SettingsSchema.index({ category: 1 });

const Settings: Model<ISettings> = mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings;
