# ArogyaAI — Phase 3: Database Architecture

## Overview

Phase 3 implements a scalable, production-grade MongoDB database architecture using Mongoose ODM. This phase provides the complete data layer for ArogyaAI with models for users, health records, emergencies, appointments, and notifications.

**Status**: ✅ Complete & Ready for Integration

## Delivered

### Database Architecture
- **MongoDB Atlas**: Scalable cloud MongoDB with connection pooling (5-10 concurrent connections)
- **Mongoose ODM**: Type-safe schema validation and data modeling
- **Connection Pooling**: Serverless-ready connection caching for optimal performance
- **TTL Indexes**: Automatic data cleanup for compliance and storage optimization

### Models (5 Total)

#### 1. **User Model** (`models/User.ts`)
- Role-based access: patient, doctor, emergency responder, admin
- Password hashing: bcryptjs with 10 salt rounds
- Virtual age calculation from DOB
- Indexes: email (unique), role, createdAt, licenseNumber
- Methods: `comparePassword()`, custom statics for role-based queries

#### 2. **HealthRecord Model** (`models/HealthRecord.ts`)
- Record types: vitals, diagnosis, prescription, lab_test, vaccination
- Vitals: temperature, heart rate, BP, respiratory rate, SpO2, weight, height
- Diagnosis: condition, severity, detailed notes
- Prescriptions: medications with dosage, duration, frequency
- Lab tests: arbitrary result data
- Virtual BMI calculation
- TTL cleanup: Auto-delete after 2 years (configurable)
- Indexes: userId + date, recordType, doctorId, date range queries
- Statics: `findByUser()`, `findLatestVitals()`, `findByDateRange()`

#### 3. **Emergency Model** (`models/Emergency.ts`)
- Types: medical_emergency, mental_health_crisis, accident, other
- Severity levels: low, medium, high, critical
- **Geospatial indexing**: 2dsphere for location-based queries
- Auto-assign nearby responders via `findNearby(lat, lng, maxDistance)`
- Status tracking: active → responded → resolved
- Responder assignment with notes
- Indexes: userId+status, severity+status, geospatial, createdAt

#### 4. **Appointment Model** (`models/Appointment.ts`)
- Types: in-clinic, video, phone
- Confirmation system: auto-generated tokens
- No-show tracking: auto-mark past appointments
- Status: scheduled → completed/cancelled/no-show
- Validation: appointments must be scheduled for future dates
- Methods: `confirmAppointment()`, `cancel()`, `isUpcoming()`, `isPast()`
- Statics: `findByPatient()`, `findByDoctor()`, `findUpcoming()`, `markNoShows()`

#### 5. **Notification Model** (`models/Notification.ts`)
- Types: appointment, medication, health_alert, system, emergency
- Severity: info, warning, critical
- Automatic TTL: 30-day default expiration (configurable)
- Read status tracking with `readAt` timestamp
- Action links for deep navigation
- Metadata for flexible extensibility
- Methods: `markAsRead()`, `markAsUnread()`, `isExpired()`
- Statics: unread queries, type filters, critical notifications

### Validation Layer (`utils/validators.ts`)
- **Zod schemas** for runtime validation
- Type inference: Full TypeScript support via `z.infer<>`
- Schemas for all models: User, HealthRecord, Emergency, Appointment, Notification
- Safe validation wrapper: `validate(schema, data)` returns `{ success, data?, error? }`

### Database Utilities (`utils/db.ts`)
Reusable async functions:
- User: `createUser()`, `findUserByEmail()`, `findUserById()`, `getActiveUsersByRole()`
- HealthRecord: `createHealthRecord()`, `getUserHealthHistory()`, `getLatestVitals()`, `getHealthRecordsByDateRange()`
- Emergency: `createEmergency()`, `getActiveEmergencies()`, `findEmergenciesNearby()`, `getCriticalEmergencies()`, `updateEmergencyStatus()`
- Appointment: `createAppointment()`, `getPatientAppointments()`, `getDoctorAppointments()`, `getUpcomingAppointments()`, `confirmAppointment()`, `cancelAppointment()`, `markNoShowAppointments()`
- Notification: `createNotification()`, `getUnreadNotifications()`, `getNotificationsByType()`, `getCriticalNotifications()`, `markNotificationAsRead()`, `markAllNotificationsAsRead()`, `deleteOldNotifications()`
- Analytics: `getDashboardStats()`, `getUserHealthSummary()`, `generateMonthlyHealthReport()`

### Seeding Script (`scripts/seed.ts`)
```bash
npm run seed
```
- Initializes 4 test users (patient, doctor, responder, admin)
- Creates 3 sample health records (vitals, diagnosis, prescription)
- Schedules 2 future appointments
- Generates 4 notifications across roles
- Test credentials for immediate development

### Backend Integration (`src/server.ts`)
Express routes with MongoDB integration:
- ✅ `GET /api/health` — Status check with DB connection status
- ✅ `GET /api/stats` — Dashboard statistics
- ✅ `GET /api/users/:userId` — User profile retrieval
- ✅ `GET/POST /api/health-records` — Health history management
- ✅ `GET /api/health-records/:userId/latest` — Latest vitals
- ✅ `POST/GET /api/emergencies` — Emergency management
- ✅ `GET /api/emergencies/nearby` — Geospatial emergency search
- ✅ `GET /api/emergencies/critical` — Critical alert filtering
- ✅ `GET/POST /api/appointments` — Appointment scheduling
- ✅ `PUT /api/appointments/:id/confirm` — Confirmation workflow
- ✅ `GET/POST/PUT /api/notifications` — Notification delivery
- ✅ `POST /api/diagnose` — AI diagnosis + auto-save to HealthRecords

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts              # MongoDB connection with pooling
│   ├── models/
│   │   ├── User.ts                  # User schema + methods
│   │   ├── HealthRecord.ts          # Health data with TTL
│   │   ├── Emergency.ts             # Emergency + geospatial
│   │   ├── Appointment.ts           # Appointments + confirmation
│   │   ├── Notification.ts          # Notifications + TTL
│   │   └── index.ts                 # Central model export
│   ├── utils/
│   │   ├── validators.ts            # Zod validation schemas
│   │   └── db.ts                    # Reusable database functions
│   ├── scripts/
│   │   └── seed.ts                  # Test data population
│   └── server.ts                    # Express API with DB integration
├── package.json                     # Dependencies (Mongoose, Zod, bcryptjs, etc.)
├── tsconfig.json                    # TypeScript configuration
├── .env.example                     # Environment variables template
└── README.md                        # This file
```

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure MongoDB Atlas

1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create database user with username/password
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/arogya`
5. Create `.env` file (copy from `.env.example`):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arogya?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
ANTHROPIC_API_KEY=your_key
```

### 3. Initialize Database
```bash
npm run seed
```

Outputs:
```
✓ Created 4 users
✓ Created 3 health records
✓ Created 2 appointments
✓ Created 4 notifications

🔑 Test Credentials:
  Patient:    rajesh@arogya.ai / PatientPass123!
  Doctor:     priya@arogya.ai / DoctorPass123!
  Responder:  amit@arogya.ai / ResponderPass123!
  Admin:      anitha@arogya.ai / AdminPass123!
```

### 4. Start Backend
```bash
npm run dev      # Development with hot reload
npm run build    # TypeScript compilation
npm start        # Production mode
```

## Database Schema Quick Reference

### User
```typescript
{
  name: string;
  email: string;
  passwordHash: string; // bcryptjs hashed
  role: 'patient' | 'doctor' | 'emergency' | 'admin';
  phone?: string;
  dateOfBirth?: Date;
  specialization?: string;    // for doctors
  licenseNumber?: string;     // for doctors
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### HealthRecord
```typescript
{
  userId: ObjectId;
  recordType: 'vitals' | 'diagnosis' | 'prescription' | 'lab_test' | 'vaccination';
  date: Date;
  data: {
    temperature?: number;      // Celsius
    heartRate?: number;        // bpm
    bloodPressure?: string;    // "120/80"
    respiratoryRate?: number;  // breaths/min
    spo2?: number;            // 0-100%
    weight?: number;          // kg
    height?: number;          // m
    condition?: string;        // Diagnosis only
    severity?: 'low' | 'medium' | 'high';
    medications?: Array<{name, dosage, frequency, duration}>;
    testName?: string;         // Lab test name
    results?: Record<string, any>;
  };
  notes?: string;
  doctorId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Emergency
```typescript
{
  userId: ObjectId;
  type: 'medical_emergency' | 'mental_health_crisis' | 'accident' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    coordinates?: [number, number]; // [lng, lat] for geospatial
  };
  description: string;
  contactedServices: string[];
  status: 'active' | 'responded' | 'resolved' | 'cancelled';
  responderId?: ObjectId;
  responderNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Appointment
```typescript
{
  patientId: ObjectId;
  doctorId: ObjectId;
  type: 'in-clinic' | 'video' | 'phone';
  scheduledAt: Date;
  duration: number;           // minutes, default 30
  reason: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  confirmationToken: string;
  isConfirmed: boolean;
  confirmedAt?: Date;
  cancelledReason?: string;
  cancelledBy?: 'patient' | 'doctor' | 'system';
  meetingUrl?: string;        // for video appointments
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification
```typescript
{
  userId: ObjectId;
  type: 'appointment' | 'medication' | 'health_alert' | 'system' | 'emergency';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;           // Default: 30 days
  createdAt: Date;
  updatedAt: Date;
}
```

## API Examples

### Create Health Record
```bash
curl -X POST http://localhost:3000/api/health-records \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "recordType": "vitals",
    "date": "2026-05-20",
    "data": {
      "temperature": 98.6,
      "heartRate": 72,
      "bloodPressure": "120/80",
      "spo2": 98
    }
  }'
```

### Create Emergency (Geospatial)
```bash
curl -X POST http://localhost:3000/api/emergencies \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "type": "medical_emergency",
    "severity": "high",
    "location": {
      "latitude": 28.6139,
      "longitude": 77.2090,
      "address": "Delhi, India"
    },
    "description": "Patient experiencing chest pain"
  }'
```

### Find Nearby Emergencies
```bash
curl "http://localhost:3000/api/emergencies/nearby?latitude=28.6139&longitude=77.2090&maxDistance=5"
```

### Get User Health Summary
```bash
curl http://localhost:3000/api/health-records/user_id
curl http://localhost:3000/api/health-records/user_id/latest
```

## Advanced Features

### Geospatial Queries
Emergency model supports location-based searches:
```javascript
// Find all active emergencies within 5km
await findEmergenciesNearby(77.2090, 28.6139, 5);
```

### TTL (Time-To-Live) Indexes
- Notifications auto-delete after 30 days
- Health records auto-delete after 2 years (for storage compliance)
- Configured via MongoDB TTL index

### Validation Schemas
All inputs validated before saving:
```javascript
const result = validate(HealthRecordSchema, userData);
if (result.success) {
  // data is type-safe and validated
  const record = await createHealthRecord(result.data);
}
```

### Connection Pooling
MongoDB driver manages 5-10 concurrent connections automatically. For serverless:
```javascript
// Connection reused via cachedConnection variable
const conn = await connectDB(); // Returns cached connection on subsequent calls
```

## Next Steps (Phase 4)

- [ ] API Authentication: JWT middleware for route protection
- [ ] Real-time Notifications: WebSocket integration for live updates
- [ ] File Upload: Medical document storage on S3
- [ ] Advanced Search: Full-text search on diagnoses and medications
- [ ] Analytics Dashboard: Aggregate health metrics by region/population
- [ ] Email/SMS Notifications: Twilio integration for alerts
- [ ] Multi-language Support: i18n for frontend + notifications

## Troubleshooting

**"Cannot connect to MongoDB"**
- Check MONGODB_URI in .env
- Verify MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for dev)
- Ensure username/password are correct

**"Validation failed"**
- Check error message from Zod validator
- Review schema in validators.ts
- Ensure all required fields provided

**"Port already in use"**
- Change PORT in .env
- Kill existing process: `lsof -i :3000`

## Performance Notes

- **Indexes**: All models have optimized indexes for query performance
- **Connection Pooling**: 5-10 concurrent connections for serverless scalability
- **TTL Cleanup**: Automatic data retention policies for compliance
- **Query Pagination**: Implement in frontend to limit results
- **Caching**: Future: Add Redis for frequently accessed queries

## Compliance & Security

- ✅ Password hashing: bcryptjs with 10 rounds
- ✅ Data validation: Zod schema validation on all inputs
- ✅ TTL policies: Auto-delete sensitive data per retention rules
- ⚠️ TODO: JWT authentication middleware
- ⚠️ TODO: Rate limiting on API routes
- ⚠️ TODO: HIPAA-compliant audit logging

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection string | `mongodb+srv://...` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` \| `production` |
| `ANTHROPIC_API_KEY` | Claude API key | `sk-...` |
| `JWT_SECRET` | JWT signing key | (generate random string) |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:3000` |

