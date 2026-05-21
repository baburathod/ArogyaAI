import mongoose, { Schema, Document, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';

/**
 * User Document Interface
 */
export interface IUser extends Omit<Document, 'toJSON'> {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'patient' | 'doctor' | 'emergency' | 'admin';
  phone?: string;
  dateOfBirth?: Date;
  specialization?: string; // For doctors
  licenseNumber?: string;  // For doctors
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(plainPassword: string): Promise<boolean>;
  toJSON(): Record<string, any>;
}

/**
 * User Schema with Validation
 */
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return by default
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'doctor', 'emergency', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'patient',
      index: true,
    },
    phone: {
      type: String,
      match: [/^[+]?[0-9]{10,}$/, 'Invalid phone number format'],
      sparse: true,
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: (v: Date | undefined) => !v || v < new Date(),
        message: 'Date of birth must be in the past',
      },
    },
    specialization: String,
    licenseNumber: {
      type: String,
      sparse: true,
      unique: true,
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * Indexes for Performance
 */
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ licenseNumber: 1 }, { sparse: true, unique: true });

/**
 * Pre-save Middleware: Hash password before saving
 */
UserSchema.pre<IUser>('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.passwordHash = await bcryptjs.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Methods
 */
UserSchema.methods.comparePassword = async function (plainPassword: string): Promise<boolean> {
  return bcryptjs.compare(plainPassword, this.passwordHash);
};

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete (user as any).passwordHash;
  return user as Omit<IUser, 'passwordHash'>;
};

/**
 * Virtual for age
 */
UserSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  return new Date().getFullYear() - this.dateOfBirth.getFullYear();
});

/**
 * Statics interface for proper TypeScript support
 */
interface IUserStatics {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveByRole(role: string): Promise<IUser[]>;
}

/**
 * Statics for common queries
 */
UserSchema.static('findByEmail', function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
});

UserSchema.static('findActiveByRole', function (role: string) {
  return this.find({ role, isActive: true });
});

/**
 * Export User Model
 */
export const User = mongoose.model<IUser, mongoose.Model<IUser> & IUserStatics>('User', UserSchema);
