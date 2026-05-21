import { z } from 'zod';

/**
 * Validation schemas using Zod for type-safe validation
 */

// ============================================
// USER VALIDATION
// ============================================
export const UserCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['patient', 'doctor', 'emergency', 'admin']),
  phone: z.string().regex(/^[+]?[0-9]{10,}$/, 'Invalid phone number').optional(),
  dateOfBirth: z.date().optional(),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[+]?[0-9]{10,}$/).optional(),
  dateOfBirth: z.date().optional(),
  specialization: z.string().optional(), // For doctors
  licenseNumber: z.string().optional(),  // For doctors
});

// ============================================
// HEALTH RECORD VALIDATION
// ============================================
export const HealthRecordSchema = z.object({
  userId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid user ID'),
  recordType: z.enum(['vitals', 'diagnosis', 'prescription', 'lab_test', 'vaccination']),
  date: z.date(),
  data: z.object({
    // Vitals
    temperature: z.number().min(35).max(42).optional(),
    heartRate: z.number().min(30).max(200).optional(),
    bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/).optional(),
    respiratoryRate: z.number().min(8).max(60).optional(),
    spo2: z.number().min(60).max(100).optional(),
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    // Diagnosis
    condition: z.string().optional(),
    severity: z.enum(['low', 'medium', 'high']).optional(),
    // Prescription
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      duration: z.string(),
      frequency: z.string(),
    })).optional(),
    // Lab test
    testName: z.string().optional(),
    results: z.record(z.any()).optional(),
  }),
  notes: z.string().max(500).optional(),
  doctorId: z.string().regex(/^[0-9a-f]{24}$/).optional(),
});

// ============================================
// EMERGENCY VALIDATION
// ============================================
export const EmergencySchema = z.object({
  userId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid user ID'),
  type: z.enum(['medical_emergency', 'mental_health_crisis', 'accident', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().max(500),
  }),
  description: z.string().min(10).max(1000),
  emergencyContacts: z
    .array(
      z.object({
        name: z.string().min(2).max(100),
        phone: z.string().regex(/^[+]?[0-9]{10,}$/, 'Invalid phone number'),
        relation: z.string().max(50),
      })
    )
    .optional(),
  contactedServices: z.array(z.string()).default([]),
  status: z.enum(['active', 'responded', 'resolved', 'cancelled']).default('active'),
  responderId: z.string().regex(/^[0-9a-f]{24}$/).optional(),
});

// ============================================
// APPOINTMENT VALIDATION
// ============================================
export const AppointmentSchema = z.object({
  patientId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid patient ID'),
  doctorId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid doctor ID'),
  type: z.enum(['in-clinic', 'video', 'phone']),
  scheduledAt: z.date().refine(d => d > new Date(), 'Appointment must be in future'),
  duration: z.number().min(15).max(120).default(30),
  reason: z.string().min(10).max(500),
  notes: z.string().max(500).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']).default('scheduled'),
  confirmationToken: z.string().optional(),
});

// ============================================
// NOTIFICATION VALIDATION
// ============================================
export const NotificationSchema = z.object({
  userId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid user ID'),
  type: z.enum(['appointment', 'medication', 'health_alert', 'system', 'emergency']),
  title: z.string().min(5).max(200),
  message: z.string().min(10).max(1000),
  severity: z.enum(['info', 'warning', 'critical']).default('info'),
  read: z.boolean().default(false),
  actionUrl: z.string().url().optional(),
  expiresAt: z.date().optional(),
});

// ============================================
// EXPORT TYPES
// ============================================
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type HealthRecord = z.infer<typeof HealthRecordSchema>;
export type Emergency = z.infer<typeof EmergencySchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type Notification = z.infer<typeof NotificationSchema>;

/**
 * Safe validation wrapper
 */
export function validate<T>(schema: z.ZodSchema, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}
