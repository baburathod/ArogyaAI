import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
/**
 * Appointment Schema
 */
const AppointmentSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required'],
        index: true,
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required'],
        index: true,
    },
    type: {
        type: String,
        enum: {
            values: ['in-clinic', 'video', 'phone'],
            message: '{VALUE} is not a valid appointment type',
        },
        required: true,
    },
    scheduledAt: {
        type: Date,
        required: [true, 'Scheduled date is required'],
        index: true,
        validate: {
            validator: (v) => v > new Date(),
            message: 'Appointment must be scheduled for future date',
        },
    },
    duration: {
        type: Number,
        default: 30,
        min: [15, 'Minimum duration is 15 minutes'],
        max: [120, 'Maximum duration is 120 minutes'],
    },
    reason: {
        type: String,
        required: [true, 'Reason for appointment is required'],
        minlength: [10, 'Reason must be at least 10 characters'],
        maxlength: [500, 'Reason must not exceed 500 characters'],
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes must not exceed 500 characters'],
    },
    status: {
        type: String,
        enum: {
            values: ['scheduled', 'completed', 'cancelled', 'no-show'],
            message: '{VALUE} is not a valid status',
        },
        default: 'scheduled',
        index: true,
    },
    confirmationToken: {
        type: String,
        unique: true,
        sparse: true,
    },
    isConfirmed: {
        type: Boolean,
        default: false,
        index: true,
    },
    confirmedAt: Date,
    cancelledReason: String,
    cancelledBy: {
        type: String,
        enum: ['patient', 'doctor', 'system'],
        sparse: true,
    },
    meetingUrl: String,
}, { timestamps: true });
/**
 * Indexes
 */
AppointmentSchema.index({ patientId: 1, scheduledAt: 1 });
AppointmentSchema.index({ doctorId: 1, scheduledAt: 1 });
AppointmentSchema.index({ status: 1, scheduledAt: 1 });
AppointmentSchema.index({ scheduledAt: 1 });
/**
 * Pre-save: Generate confirmation token
 */
AppointmentSchema.pre('save', function (next) {
    if (!this.confirmationToken) {
        this.confirmationToken = crypto.randomBytes(32).toString('hex');
    }
    next();
});
/**
 * Methods
 */
AppointmentSchema.methods.generateConfirmationToken = function () {
    this.confirmationToken = crypto.randomBytes(32).toString('hex');
    return this.confirmationToken;
};
AppointmentSchema.methods.confirmAppointment = async function () {
    this.isConfirmed = true;
    this.confirmedAt = new Date();
    await this.save();
};
AppointmentSchema.methods.cancel = async function (reason, cancelledBy) {
    this.status = 'cancelled';
    this.cancelledReason = reason;
    this.cancelledBy = cancelledBy;
    await this.save();
};
AppointmentSchema.methods.isUpcoming = function () {
    return this.scheduledAt > new Date() && this.status === 'scheduled';
};
AppointmentSchema.methods.isPast = function () {
    return this.scheduledAt < new Date();
};
/**
 * Statics
 */
AppointmentSchema.static('findByPatient', function (patientId, status) {
    const query = { patientId };
    if (status)
        query.status = status;
    return this.find(query).sort({ scheduledAt: -1 });
});
AppointmentSchema.static('findByDoctor', function (doctorId, status) {
    const query = { doctorId };
    if (status)
        query.status = status;
    return this.find(query).sort({ scheduledAt: -1 });
});
AppointmentSchema.static('findUpcoming', function (limit = 10) {
    return this.find({
        scheduledAt: { $gte: new Date() },
        status: 'scheduled',
    })
        .sort({ scheduledAt: 1 })
        .limit(limit);
});
/**
 * Auto-mark as no-show after appointment time passes
 */
AppointmentSchema.static('markNoShows', async function () {
    const now = new Date();
    return this.updateMany({
        scheduledAt: { $lt: now },
        status: 'scheduled',
    }, {
        $set: { status: 'no-show' },
    });
});
/**
 * Export Model
 */
export const Appointment = mongoose.model('Appointment', AppointmentSchema);
