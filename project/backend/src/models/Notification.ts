import mongoose, { Document, Schema, Model } from 'mongoose';

export type NotificationType = 
  | 'feedback_submitted'
  | 'feedback_updated'
  | 'feedback_resolved'
  | 'feedback_rejected'
  | 'status_changed'
  | 'comment_added'
  | 'system_alert'
  | 'welcome'
  | 'password_changed';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  feedback?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'feedback_submitted',
        'feedback_updated',
        'feedback_resolved',
        'feedback_rejected',
        'status_changed',
        'comment_added',
        'system_alert',
        'welcome',
        'password_changed',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    feedback: { type: Schema.Types.ObjectId, ref: 'Feedback' },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
