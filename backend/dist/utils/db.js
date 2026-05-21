import mongoose from 'mongoose';
import { User } from '../models/User';
import { HealthRecord } from '../models/HealthRecord';
import { Emergency } from '../models/Emergency';
import { Appointment } from '../models/Appointment';
import { Notification } from '../models/Notification';
/**
 * Database Utilities - Reusable functions for common operations
 */
// ============================================
// USER UTILITIES
// ============================================
/**
 * Create a new user with validation
 */
export async function createUser(userData) {
    const user = new User(userData);
    return user.save();
}
/**
 * Find user by email
 */
export async function findUserByEmail(email) {
    return User.findByEmail(email.toLowerCase());
}
/**
 * Find user by ID with optional field selection
 */
export async function findUserById(id, select) {
    return User.findById(id).select(select || '');
}
/**
 * Get all active users by role
 */
export async function getActiveUsersByRole(role) {
    const users = await User.findActiveByRole(role);
    return users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    }));
}
// ============================================
// HEALTH RECORD UTILITIES
// ============================================
/**
 * Create health record
 */
export async function createHealthRecord(recordData) {
    const record = new HealthRecord(recordData);
    return record.save();
}
/**
 * Get user's health history
 */
export async function getUserHealthHistory(userId, limit = 50) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return HealthRecord.findByUser(objectId, limit);
}
/**
 * Get latest vitals for user
 */
export async function getLatestVitals(userId) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return HealthRecord.findLatestVitals(objectId);
}
/**
 * Get health records within date range
 */
export async function getHealthRecordsByDateRange(userId, startDate, endDate) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return HealthRecord.findByDateRange(objectId, startDate, endDate);
}
// ============================================
// EMERGENCY UTILITIES
// ============================================
/**
 * Create emergency alert
 */
export async function createEmergency(emergencyData) {
    const emergency = new Emergency(emergencyData);
    return emergency.save();
}
/**
 * Get active emergencies for user
 */
export async function getActiveEmergencies(userId) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return Emergency.findActiveByUser(objectId);
}
/**
 * Find emergencies near location (geospatial)
 */
export async function findEmergenciesNearby(latitude, longitude, maxDistanceKm = 5) {
    return Emergency.findNearby(longitude, latitude, maxDistanceKm * 1000);
}
/**
 * Get all critical emergencies
 */
export async function getCriticalEmergencies() {
    return Emergency.findCritical();
}
/**
 * Update emergency status
 */
export async function updateEmergencyStatus(emergencyId, status, responderId, notes) {
    const update = { status };
    if (responderId)
        update.responderId = responderId;
    if (notes)
        update.responderNotes = notes;
    if (status === 'resolved')
        update.resolvedAt = new Date();
    return Emergency.findByIdAndUpdate(emergencyId, update, { new: true });
}
export async function assignResponderToEmergency(emergencyId, responderId) {
    const update = {
        responderId,
        status: 'responded',
        updatedAt: new Date(),
    };
    return Emergency.findByIdAndUpdate(emergencyId, update, { new: true });
}
/**
 * Get all active emergencies
 */
export async function getCurrentActiveEmergencies() {
    return Emergency.find({ status: 'active' }).sort({ createdAt: -1 });
}
/**
 * Emergency analytics and counts
 */
export async function getEmergencyAnalytics() {
    const activeEmergencies = await Emergency.find({ status: 'active' });
    const analytics = {
        activeCount: activeEmergencies.length,
        criticalCount: activeEmergencies.filter((emergency) => emergency.severity === 'critical').length,
        highCount: activeEmergencies.filter((emergency) => emergency.severity === 'high').length,
        mediumCount: activeEmergencies.filter((emergency) => emergency.severity === 'medium').length,
        lowCount: activeEmergencies.filter((emergency) => emergency.severity === 'low').length,
        respondedCount: await Emergency.countDocuments({ status: 'responded' }),
        resolvedCount: await Emergency.countDocuments({ status: 'resolved' }),
    };
    return analytics;
}
// ============================================
// APPOINTMENT UTILITIES
// ============================================
/**
 * Create appointment
 */
export async function createAppointment(appointmentData) {
    const appointment = new Appointment(appointmentData);
    return appointment.save();
}
/**
 * Get patient's appointments
 */
export async function getPatientAppointments(patientId, status) {
    const objectId = typeof patientId === 'string' ? new mongoose.Types.ObjectId(patientId) : patientId;
    return Appointment.findByPatient(objectId, status);
}
/**
 * Get doctor's appointments
 */
export async function getDoctorAppointments(doctorId, status) {
    const objectId = typeof doctorId === 'string' ? new mongoose.Types.ObjectId(doctorId) : doctorId;
    return Appointment.findByDoctor(objectId, status);
}
/**
 * Get upcoming appointments across all users
 */
export async function getUpcomingAppointments(limit = 10) {
    return Appointment.findUpcoming(limit);
}
/**
 * Confirm appointment
 */
export async function confirmAppointment(appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment)
        throw new Error('Appointment not found');
    await appointment.confirmAppointment();
    return appointment;
}
/**
 * Cancel appointment
 */
export async function cancelAppointment(appointmentId, reason, cancelledBy = 'system') {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment)
        throw new Error('Appointment not found');
    await appointment.cancel(reason, cancelledBy);
    return appointment;
}
/**
 * Auto-mark no-shows
 */
export async function markNoShowAppointments() {
    return Appointment.markNoShows();
}
// ============================================
// NOTIFICATION UTILITIES
// ============================================
/**
 * Create notification
 */
export async function createNotification(notificationData) {
    const notification = new Notification(notificationData);
    return notification.save();
}
/**
 * Get unread notifications
 */
export async function getUnreadNotifications(userId) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return Notification.findUnread(objectId);
}
/**
 * Get notifications by type
 */
export async function getNotificationsByType(userId, type) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return Notification.findByType(objectId, type);
}
/**
 * Get critical notifications
 */
export async function getCriticalNotifications(userId) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return Notification.findCritical(objectId);
}
/**
 * Count unread notifications
 */
export async function countUnreadNotifications(userId) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return Notification.countUnread(objectId);
}
/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification)
        throw new Error('Notification not found');
    await notification.markAsRead();
    return notification;
}
/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    return Notification.markAllAsRead(objectId);
}
/**
 * Delete old notifications
 */
export async function deleteOldNotifications(daysOld = 90) {
    return Notification.deleteOldNotifications(daysOld);
}
// ============================================
// BULK & AGGREGATE UTILITIES
// ============================================
/**
 * Get dashboard stats for admin
 */
export async function getDashboardStats() {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    const patientCount = await User.countDocuments({ role: 'patient' });
    const emergencyCount = await Emergency.countDocuments({ status: 'active' });
    const appointmentCount = await Appointment.countDocuments({ status: 'scheduled' });
    return {
        totalUsers,
        activeUsers,
        byRole: { doctors: doctorCount, patients: patientCount },
        activeEmergencies: emergencyCount,
        upcomingAppointments: appointmentCount,
    };
}
/**
 * Get user's health summary
 */
export async function getUserHealthSummary(userId) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const latestVitals = await getLatestVitals(objectId);
    const recentRecords = await getUserHealthHistory(objectId, 10);
    const appointmentCount = await Appointment.countDocuments({
        patientId: objectId,
        status: 'scheduled',
    });
    return {
        latestVitals,
        recentRecords,
        upcomingAppointments: appointmentCount,
    };
}
/**
 * Generate monthly health report
 */
export async function generateMonthlyHealthReport(userId, month, year) {
    const objectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const records = await getHealthRecordsByDateRange(objectId, startDate, endDate);
    const appointments = await Appointment.find({
        patientId: objectId,
        scheduledAt: { $gte: startDate, $lte: endDate },
    });
    return {
        month,
        year,
        totalRecords: records.length,
        recordsByType: {},
        completedAppointments: appointments.filter((a) => a.status === 'completed').length,
        records,
        appointments,
    };
}
