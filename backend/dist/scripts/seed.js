import { connectDB, disconnectDB } from '../config/database';
import { User } from '../models/User';
import { HealthRecord } from '../models/HealthRecord';
import { Appointment } from '../models/Appointment';
import { Notification } from '../models/Notification';
/**
 * Seed Database with Test Data
 * Run: npm run seed
 */
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seed...');
        await connectDB();
        // Clear existing data (optional)
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await HealthRecord.deleteMany({});
        await Appointment.deleteMany({});
        await Notification.deleteMany({});
        // ============================================
        // CREATE USERS
        // ============================================
        console.log('👥 Creating users...');
        const users = await User.insertMany([
            {
                name: 'Rajesh Kumar',
                email: 'rajesh@arogya.ai',
                passwordHash: 'PatientPass123!',
                role: 'patient',
                phone: '+919876543210',
                dateOfBirth: new Date('1990-05-15'),
                isActive: true,
            },
            {
                name: 'Dr. Priya Sharma',
                email: 'priya@arogya.ai',
                passwordHash: 'DoctorPass123!',
                role: 'doctor',
                phone: '+919876543211',
                specialization: 'General Medicine',
                licenseNumber: 'MCI/2020/12345',
                isActive: true,
            },
            {
                name: 'Amit Singh',
                email: 'amit@arogya.ai',
                passwordHash: 'ResponderPass123!',
                role: 'emergency',
                phone: '+919876543212',
                isActive: true,
            },
            {
                name: 'Dr. Anitha Reddy',
                email: 'anitha@arogya.ai',
                passwordHash: 'AdminPass123!',
                role: 'admin',
                phone: '+919876543213',
                isActive: true,
            },
        ]);
        console.log(`✓ Created ${users.length} users`);
        // ============================================
        // CREATE HEALTH RECORDS
        // ============================================
        console.log('📊 Creating health records...');
        const healthRecords = await HealthRecord.insertMany([
            {
                userId: users[0]._id,
                recordType: 'vitals',
                date: new Date(),
                data: {
                    temperature: 98.6,
                    heartRate: 72,
                    bloodPressure: '120/80',
                    respiratoryRate: 16,
                    spo2: 98,
                    weight: 70,
                    height: 1.75,
                },
                notes: 'Regular checkup - all normal',
                doctorId: users[1]._id,
            },
            {
                userId: users[0]._id,
                recordType: 'diagnosis',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                data: {
                    condition: 'Common Cold',
                    severity: 'low',
                },
                notes: 'Mild symptoms, advised rest and hydration',
                doctorId: users[1]._id,
            },
            {
                userId: users[0]._id,
                recordType: 'prescription',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                data: {
                    medications: [
                        {
                            name: 'Paracetamol',
                            dosage: '500mg',
                            frequency: 'Twice daily',
                            duration: '5 days',
                        },
                        {
                            name: 'Cough Syrup',
                            dosage: '10ml',
                            frequency: 'Three times daily',
                            duration: '7 days',
                        },
                    ],
                },
                doctorId: users[1]._id,
            },
        ]);
        console.log(`✓ Created ${healthRecords.length} health records`);
        // ============================================
        // CREATE APPOINTMENTS
        // ============================================
        console.log('📅 Creating appointments...');
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        futureDate.setHours(14, 30, 0, 0);
        const appointments = await Appointment.insertMany([
            {
                patientId: users[0]._id,
                doctorId: users[1]._id,
                type: 'video',
                scheduledAt: futureDate,
                duration: 30,
                reason: 'Follow-up consultation for common cold',
                notes: 'Send recent vitals before appointment',
                isConfirmed: true,
                confirmedAt: new Date(),
                status: 'scheduled',
            },
            {
                patientId: users[0]._id,
                doctorId: users[1]._id,
                type: 'in-clinic',
                scheduledAt: new Date(futureDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                duration: 45,
                reason: 'General health checkup',
                status: 'scheduled',
            },
        ]);
        console.log(`✓ Created ${appointments.length} appointments`);
        // ============================================
        // CREATE NOTIFICATIONS
        // ============================================
        console.log('🔔 Creating notifications...');
        const notifications = await Notification.insertMany([
            {
                userId: users[0]._id,
                type: 'appointment',
                title: 'Upcoming Appointment Reminder',
                message: `Your appointment with Dr. Priya Sharma is scheduled for ${futureDate.toLocaleDateString()} at ${futureDate.toLocaleTimeString()}`,
                severity: 'warning',
                actionUrl: '/dashboard/appointments',
                actionLabel: 'View Appointment',
            },
            {
                userId: users[0]._id,
                type: 'medication',
                title: 'Medication Reminder',
                message: 'Remember to take your prescribed medications on schedule',
                severity: 'info',
                actionUrl: '/dashboard/medications',
                actionLabel: 'View Medications',
            },
            {
                userId: users[0]._id,
                type: 'health_alert',
                title: 'Routine Health Checkup Due',
                message: 'It has been 3 months since your last health checkup. Schedule one now.',
                severity: 'info',
                read: false,
            },
            {
                userId: users[1]._id,
                type: 'system',
                title: 'New Patient Queue',
                message: 'You have 3 new patients waiting for consultation',
                severity: 'warning',
                read: false,
            },
        ]);
        console.log(`✓ Created ${notifications.length} notifications`);
        // ============================================
        // SUMMARY
        // ============================================
        console.log('\n✅ Database seeding completed!\n');
        console.log('📊 Summary:');
        console.log(`  - Users: ${users.length}`);
        console.log(`  - Health Records: ${healthRecords.length}`);
        console.log(`  - Appointments: ${appointments.length}`);
        console.log(`  - Notifications: ${notifications.length}`);
        console.log('\n🔑 Test Credentials:');
        console.log('  Patient:    rajesh@arogya.ai / PatientPass123!');
        console.log('  Doctor:     priya@arogya.ai / DoctorPass123!');
        console.log('  Responder:  amit@arogya.ai / ResponderPass123!');
        console.log('  Admin:      anitha@arogya.ai / AdminPass123!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
    finally {
        await disconnectDB();
    }
}
// Run seed
seedDatabase();
