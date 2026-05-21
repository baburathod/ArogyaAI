import mongoose, { Schema } from 'mongoose';
/**
 * Notification Schema
 */
const NotificationSchema = new Schema({
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
}, { timestamps: true });
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
NotificationSchema.index({ expiresAt: 1 }, {
    expireAfterSeconds: 0,
    sparse: true,
});
/**
 * Pre-save: Set default expiresAt to 30 days if not specified
 */
NotificationSchema.pre('save', function (next) {
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
NotificationSchema.methods.markAsRead = async function () {
    this.read = true;
    this.readAt = new Date();
    await this.save();
};
NotificationSchema.methods.markAsUnread = async function () {
    this.read = false;
    this.readAt = undefined;
    await this.save();
};
NotificationSchema.methods.isExpired = function () {
    if (!this.expiresAt)
        return false;
    return new Date() > this.expiresAt;
};
/**
 * Statics
 */
NotificationSchema.static('findUnread', function (userId) {
    return this.find({ userId, read: false }).sort({ createdAt: -1 });
});
NotificationSchema.static('findByType', function (userId, type) {
    return this.find({ userId, type }).sort({ createdAt: -1 });
});
NotificationSchema.static('findCritical', function (userId) {
    return this.find({ userId, severity: 'critical', read: false }).sort({ createdAt: -1 });
});
NotificationSchema.static('countUnread', function (userId) {
    return this.countDocuments({ userId, read: false });
});
NotificationSchema.static('markAllAsRead', async function (userId) {
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
export const Notification = mongoose.model('Notification', NotificationSchema);
