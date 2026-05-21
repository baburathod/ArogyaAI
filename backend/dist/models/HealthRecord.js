import mongoose, { Schema } from 'mongoose';
/**
 * Health Record Schema
 */
const HealthRecordSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true,
    },
    recordType: {
        type: String,
        enum: {
            values: ['vitals', 'diagnosis', 'prescription', 'lab_test', 'vaccination'],
            message: '{VALUE} is not a valid record type',
        },
        required: true,
        index: true,
    },
    date: {
        type: Date,
        default: Date.now,
        index: true,
    },
    data: {
        // Vitals
        temperature: {
            type: Number,
            min: [35, 'Temperature too low'],
            max: [42, 'Temperature too high'],
        },
        heartRate: {
            type: Number,
            min: [30, 'Heart rate too low'],
            max: [200, 'Heart rate too high'],
        },
        bloodPressure: {
            type: String,
            match: [/^\d{2,3}\/\d{2,3}$/, 'Invalid blood pressure format (e.g., 120/80)'],
        },
        respiratoryRate: {
            type: Number,
            min: [8, 'Respiratory rate too low'],
            max: [60, 'Respiratory rate too high'],
        },
        spo2: {
            type: Number,
            min: [60, 'SpO2 too low'],
            max: [100, 'SpO2 cannot exceed 100'],
        },
        weight: {
            type: Number,
            min: [0.5, 'Invalid weight'],
        },
        height: {
            type: Number,
            min: [0.5, 'Invalid height'],
        },
        // Diagnosis
        condition: String,
        severity: {
            type: String,
            enum: ['low', 'medium', 'high'],
        },
        // Prescription
        medications: [
            {
                name: {
                    type: String,
                    required: true,
                },
                dosage: {
                    type: String,
                    required: true,
                },
                duration: {
                    type: String,
                    required: true,
                },
                frequency: {
                    type: String,
                    required: true,
                },
                _id: false,
            },
        ],
        // Lab test
        testName: String,
        results: mongoose.Schema.Types.Mixed,
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes must not exceed 500 characters'],
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        sparse: true,
    },
}, { timestamps: true });
/**
 * Indexes for Performance
 */
HealthRecordSchema.index({ userId: 1, date: -1 });
HealthRecordSchema.index({ userId: 1, recordType: 1 });
HealthRecordSchema.index({ doctorId: 1 });
HealthRecordSchema.index({ date: -1 });
/**
 * TTL Index: Auto-delete non-critical records after 2 years
 */
HealthRecordSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 63072000, // 2 years
    partialFilterExpression: { recordType: { $in: ['vitals', 'lab_test'] } },
});
/**
 * Virtuals
 */
HealthRecordSchema.virtual('bmi').get(function () {
    if (!this.data.weight || !this.data.height)
        return null;
    return (this.data.weight / (this.data.height * this.data.height)).toFixed(2);
});
/**
 * Static Methods
 */
HealthRecordSchema.static('findByUser', function (userId, limit = 50) {
    return this.find({ userId }).sort({ date: -1 }).limit(limit);
});
HealthRecordSchema.static('findLatestVitals', function (userId) {
    return this.findOne({ userId, recordType: 'vitals' }).sort({ date: -1 });
});
HealthRecordSchema.static('findByDateRange', function (userId, startDate, endDate) {
    return this.find({ userId, date: { $gte: startDate, $lte: endDate } }).sort({ date: -1 });
});
/**
 * Export Model
 */
export const HealthRecord = mongoose.model('HealthRecord', HealthRecordSchema);
