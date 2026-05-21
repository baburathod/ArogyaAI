import mongoose from 'mongoose';

const OfflineQueueSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['queued', 'processing', 'done', 'failed'], default: 'queued' },
    attempts: { type: Number, default: 0 },
    lastError: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const OfflineQueue = mongoose.model('OfflineQueue', OfflineQueueSchema);

export default OfflineQueue;
