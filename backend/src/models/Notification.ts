import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Notification Document Interface
 */
export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'appointment' | 'medication' | 'health_alert' | 'system' | 'emergency';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>; // For storing extra data (appointment ID, etc.)
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  markAsRead(): Promise<void>;
  markAsUnread(): Promise<void>;
  isExpired(): boolean;
}

/**
 * Notification Schema
 */
const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['appointment', 'medication', 'health_alert', 'system', 'emergency'],
        message: '{VALUE} is not a valid notification type',
      },
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message must not exceed 1000 characters'],
    },
    severity: {
      type: String,
      enum: {
        values: ['info', 'warning', 'critical'],
        message: '{VALUE} is not a valid severity level',
      },
      default: 'info',
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    actionUrl: String,
    actionLabel: String,
    metadata: mongoose.Schema.Types.Mixed,
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
  },
  { timestamps: true }
);

/**
 * Indexes
 */
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, read: 1 });
NotificationSchema.index({ severity: 1 });

/**
 * TTL Index: Auto-delete expired notifications after expiresAt
 */
NotificationSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    sparse: true,
  }
);

/**
 * Pre-save: Set default expiresAt to 30 days if not specified
 */
NotificationSchema.pre<INotification>('save', function (next) {
  if (!this.expiresAt) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    this.expiresAt = thirtyDaysFromNow;
  }
  next();
});

/**
 * Methods
 */
NotificationSchema.methods.markAsRead = async function (): Promise<void> {
  this.read = true;
  this.readAt = new Date();
  await this.save();
};

NotificationSchema.methods.markAsUnread = async function (): Promise<void> {
  this.read = false;
  this.readAt = undefined;
  await this.save();
};

NotificationSchema.methods.isExpired = function (): boolean {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

/**
 * Statics interface for proper TypeScript support
 */
interface INotificationStatics {
  findUnread(userId: mongoose.Types.ObjectId): Promise<INotification[]>;
  findByType(userId: mongoose.Types.ObjectId, type: string): Promise<INotification[]>;
  findCritical(userId: mongoose.Types.ObjectId): Promise<INotification[]>;
  countUnread(userId: mongoose.Types.ObjectId): Promise<number>;
  markAllAsRead(userId: mongoose.Types.ObjectId): Promise<any>;
  deleteOldNotifications(daysOld?: number): Promise<any>;
}

/**
 * Statics
 */
NotificationSchema.static('findUnread', function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId, read: false }).sort({ createdAt: -1 });
});

NotificationSchema.static('findByType', function (userId: mongoose.Types.ObjectId, type: string) {
  return this.find({ userId, type }).sort({ createdAt: -1 });
});

NotificationSchema.static('findCritical', function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId, severity: 'critical', read: false }).sort({ createdAt: -1 });
});

NotificationSchema.static('countUnread', function (userId: mongoose.Types.ObjectId) {
  return this.countDocuments({ userId, read: false });
});

NotificationSchema.static('markAllAsRead', async function (userId: mongoose.Types.ObjectId) {
  return this.updateMany({ userId, read: false }, { $set: { read: true, readAt: new Date() } });
});

NotificationSchema.static('deleteOldNotifications', async function (daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  return this.deleteMany({ createdAt: { $lt: cutoffDate } });
});

/**
 * Export Model
 */
export const Notification = mongoose.model<INotification, mongoose.Model<INotification> & INotificationStatics>(
  'Notification',
  NotificationSchema
);
