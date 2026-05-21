import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Emergency Document Interface
 */
export interface IEmergency extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'medical_emergency' | 'mental_health_crisis' | 'accident' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    coordinates?: [number, number]; // [longitude, latitude] for geospatial queries
  };
  description: string;
  emergencyContacts?: Array<{ name: string; phone: string; relation: string }>;
  contactedServices: string[];
  status: 'active' | 'responded' | 'resolved' | 'cancelled';
  responderId?: mongoose.Types.ObjectId;
  responderNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Emergency Schema
 */
const EmergencySchema = new Schema<IEmergency>(
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
        values: ['medical_emergency', 'mental_health_crisis', 'accident', 'other'],
        message: '{VALUE} is not a valid emergency type',
      },
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid severity level',
      },
      default: 'high',
      index: true,
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Invalid latitude'],
        max: [90, 'Invalid latitude'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Invalid longitude'],
        max: [180, 'Invalid longitude'],
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
        maxlength: [500, 'Address must not exceed 500 characters'],
      },
    },
    description: {
      type: String,
      required: [true, 'Emergency description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },
    emergencyContacts: {
      type: [
        {
          name: { type: String, required: true },
          phone: { type: String, required: true },
          relation: { type: String, required: true },
        },
      ],
      default: [],
    },
    contactedServices: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'responded', 'resolved', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
      index: true,
    },
    responderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true,
    },
    responderNotes: {
      type: String,
      maxlength: [500, 'Notes must not exceed 500 characters'],
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

/**
 * Geospatial Index for location-based queries
 */
EmergencySchema.index({ 'location.coordinates': '2dsphere' });

/**
 * Compound Indexes
 */
EmergencySchema.index({ userId: 1, status: 1 });
EmergencySchema.index({ severity: 1, status: 1 });
EmergencySchema.index({ createdAt: -1 });
EmergencySchema.index({ responderId: 1, status: 1 });

/**
 * Pre-save Middleware: Set geospatial coordinates
 */
EmergencySchema.pre<IEmergency>('save', function (next) {
  if (this.location.latitude && this.location.longitude) {
    (this.location as any).coordinates = {
      type: 'Point',
      coordinates: [this.location.longitude, this.location.latitude],
    };
  }
  next();
});

/**
 * Statics interface for proper TypeScript support
 */
interface IEmergencyStatics {
  findActiveByUser(userId: mongoose.Types.ObjectId): Promise<IEmergency[]>;
  findNearby(
    longitude: number,
    latitude: number,
    maxDistance?: number
  ): Promise<IEmergency[]>;
  findCritical(): Promise<IEmergency[]>;
}

/**
 * Static Methods
 */
EmergencySchema.static('findActiveByUser', function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId, status: 'active' }).sort({ createdAt: -1 });
});

EmergencySchema.static('findNearby', function (
  longitude: number,
  latitude: number,
  maxDistance: number = 5000
) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude] as [number, number],
        },
        $maxDistance: maxDistance,
      },
    },
    status: 'active',
  }).sort({ createdAt: -1 });
});

EmergencySchema.static('findCritical', function () {
  return this.find({ severity: 'critical', status: 'active' }).sort({ createdAt: -1 });
});

/**
 * Export Model
 */
export const Emergency = mongoose.model<IEmergency, mongoose.Model<IEmergency> & IEmergencyStatics>(
  'Emergency',
  EmergencySchema
);
