import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

/**
 * Appointment Document Interface
 */
export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  type: 'in-clinic' | 'video' | 'phone';
  scheduledAt: Date;
  duration: number;
  reason: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  confirmationToken: string;
  isConfirmed: boolean;
  confirmedAt?: Date;
  cancelledReason?: string;
  cancelledBy?: 'patient' | 'doctor' | 'system';
  meetingUrl?: string; // For video appointments
  createdAt: Date;
  updatedAt: Date;

  // Methods
  generateConfirmationToken(): string;
  confirmAppointment(): Promise<void>;
  cancel(reason: string, cancelledBy: 'patient' | 'doctor' | 'system'): Promise<void>;
  isUpcoming(): boolean;
  isPast(): boolean;
}

/**
 * Appointment Schema
 */
const AppointmentSchema = new Schema<IAppointment>(
  {
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
        validator: (v: Date) => v > new Date(),
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
  },
  { timestamps: true }
);

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
AppointmentSchema.pre<IAppointment>('save', function (next) {
  if (!this.confirmationToken) {
    this.confirmationToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

/**
 * Methods
 */
AppointmentSchema.methods.generateConfirmationToken = function (): string {
  this.confirmationToken = crypto.randomBytes(32).toString('hex');
  return this.confirmationToken;
};

AppointmentSchema.methods.confirmAppointment = async function (): Promise<void> {
  this.isConfirmed = true;
  this.confirmedAt = new Date();
  await this.save();
};

AppointmentSchema.methods.cancel = async function (
  reason: string,
  cancelledBy: 'patient' | 'doctor' | 'system'
): Promise<void> {
  this.status = 'cancelled';
  this.cancelledReason = reason;
  this.cancelledBy = cancelledBy;
  await this.save();
};

AppointmentSchema.methods.isUpcoming = function (): boolean {
  return this.scheduledAt > new Date() && this.status === 'scheduled';
};

AppointmentSchema.methods.isPast = function (): boolean {
  return this.scheduledAt < new Date();
};

/**
 * Statics interface for proper TypeScript support
 */
interface IAppointmentStatics {
  findByPatient(patientId: mongoose.Types.ObjectId, status?: string): Promise<IAppointment[]>;
  findByDoctor(doctorId: mongoose.Types.ObjectId, status?: string): Promise<IAppointment[]>;
  findUpcoming(limit?: number): Promise<IAppointment[]>;
  markNoShows(): Promise<any>;
}

/**
 * Statics
 */
AppointmentSchema.static('findByPatient', function (patientId: mongoose.Types.ObjectId, status?: string) {
  const query: any = { patientId };
  if (status) query.status = status;
  return this.find(query).sort({ scheduledAt: -1 });
});

AppointmentSchema.static('findByDoctor', function (doctorId: mongoose.Types.ObjectId, status?: string) {
  const query: any = { doctorId };
  if (status) query.status = status;
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
  return this.updateMany(
    {
      scheduledAt: { $lt: now },
      status: 'scheduled',
    },
    {
      $set: { status: 'no-show' },
    }
  );
});

/**
 * Export Model
 */
export const Appointment = mongoose.model<IAppointment, mongoose.Model<IAppointment> & IAppointmentStatics>(
  'Appointment',
  AppointmentSchema
);
