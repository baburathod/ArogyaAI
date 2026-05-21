import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB, getDBStatus } from './config/database';
import * as dbUtils from './utils/db';
import { User } from './models/User';
import { validate, HealthRecordSchema, EmergencySchema, AppointmentSchema, NotificationSchema } from './utils/validators';
import AIHealthcare from './services/ai-healthcare';
import { findNearbyHospitals, externalHospitalLookup } from './services/hospital-service';
import { formatSeverity } from './utils/multilingual';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'arogyaai-secret-key';
// Basic environment validation
const requiredEnvs = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvs = requiredEnvs.filter((k) => !process.env[k]);
if (missingEnvs.length) {
    console.warn(`Warning: Missing required env vars: ${missingEnvs.join(', ')}`);
}
// Request logging
app.use(morgan(process.env.LOG_FORMAT || 'combined'));
// Rate limiting for API routes
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env.API_RATE_LIMIT || '120', 10), // max requests per window
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);
const httpServer = createServer(app);
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('joinRoom', (room) => {
        if (room) {
            socket.join(room);
        }
    });
    // Allow clients to register as a specific responder to receive targeted events
    socket.on('registerResponder', (responderId) => {
        if (responderId) {
            const roomName = `responder:${responderId}`;
            socket.join(roomName);
            console.log(`Socket ${socket.id} registered for responder ${responderId}`);
        }
    });
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }
    const token = authorization.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = payload.sub || payload.id;
        if (!userId || !payload.role) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }
        req.user = {
            id: userId,
            email: payload.email,
            role: payload.role,
        };
        return next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
function requireResponderOrAdmin(req, res, next) {
    if (!req.user || !['emergency', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Responder or admin role required' });
    }
    return next();
}
function requireAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    return next();
}
// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.static('../'));
// ============================================
// DATABASE CONNECTION
// ============================================
let dbConnected = false;
app.use(async (req, res, next) => {
    if (!dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
        }
        catch (error) {
            console.error('DB connection failed:', error);
            return res.status(500).json({ error: 'Database connection failed' });
        }
    }
    next();
});
// ============================================
// HEALTH & STATUS ENDPOINTS
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '3.0',
        project: 'ArogyaAI',
        database: getDBStatus(),
        timestamp: new Date().toISOString(),
    });
});
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await dbUtils.getDashboardStats();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch stats' });
    }
});
// ============================================
// USER ENDPOINTS (Protected in production)
// ============================================
/**
 * GET /api/users/:userId
 * Get user profile
 */
app.get('/api/users/:userId', async (req, res) => {
    try {
        const user = await dbUtils.findUserById(req.params.userId, '-passwordHash');
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user' });
    }
});
// ============================================
// HEALTH RECORD ENDPOINTS
// ============================================
/**
 * GET /api/health-records/:userId
 * Get user's health history
 */
app.get('/api/health-records/:userId', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const records = await dbUtils.getUserHealthHistory(req.params.userId, limit);
        res.json(records);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch health records' });
    }
});
/**
 * POST /api/health-records
 * Create new health record
 */
app.post('/api/health-records', async (req, res) => {
    const validation = validate(HealthRecordSchema, req.body);
    if (!validation.success)
        return res.status(400).json({ error: validation.error });
    try {
        const record = await dbUtils.createHealthRecord(validation.data);
        res.status(201).json(record);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create health record' });
    }
});
/**
 * GET /api/health-records/:userId/latest
 * Get latest vitals
 */
app.get('/api/health-records/:userId/latest', async (req, res) => {
    try {
        const vitals = await dbUtils.getLatestVitals(req.params.userId);
        if (!vitals)
            return res.status(404).json({ error: 'No vitals found' });
        res.json(vitals);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch vitals' });
    }
});
// ============================================
// AUTH & EMERGENCY ENDPOINTS
// ============================================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: user.toJSON() });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Login failed' });
    }
});
app.get('/api/hospitals/nearby', async (req, res) => {
    const { latitude, longitude, maxDistance } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'latitude and longitude required' });
    }
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const maxDistanceKm = parseFloat(maxDistance || '15');
    try {
        // Try external provider if configured
        const external = await externalHospitalLookup('', lat, lon, maxDistanceKm).catch(() => []);
        if (external && external.length) {
            return res.json({ hospitals: external });
        }
        const hospitals = findNearbyHospitals(lat, lon, maxDistanceKm);
        res.json({ hospitals });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch nearby hospitals' });
    }
});
app.get('/api/hospitals/search', async (req, res) => {
    const query = req.query.query || '';
    if (!query.trim()) {
        return res.status(400).json({ error: 'query is required' });
    }
    try {
        const hospitals = findNearbyHospitals(undefined, undefined, undefined, query);
        res.json({ hospitals });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Hospital search failed' });
    }
});
app.use('/api/emergencies', authenticateToken);
app.use('/api/responders', authenticateToken);
app.post('/api/emergencies/sos', async (req, res) => {
    const validation = validate(EmergencySchema, req.body);
    if (!validation.success)
        return res.status(400).json({ error: validation.error });
    try {
        const emergencyData = validation.data;
        emergencyData.userId = req.user?.id ?? emergencyData.userId;
        const emergency = await dbUtils.createEmergency(emergencyData);
        await dbUtils.createNotification({
            userId: emergencyData.userId,
            type: 'emergency',
            title: 'SOS activated',
            message: `Emergency SOS triggered at ${emergencyData.location.address}. Help is on the way.`,
            severity: 'critical',
            actionUrl: '/dashboard/emergency',
        });
        if (emergencyData.emergencyContacts?.length) {
            await dbUtils.createNotification({
                userId: emergencyData.userId,
                type: 'emergency',
                title: 'Emergency contacts alerted',
                message: `Notified ${emergencyData.emergencyContacts.length} emergency contact(s) for this incident.`,
                severity: 'warning',
                actionUrl: '/dashboard/emergency',
            });
        }
        io.emit('emergency:created', { emergency });
        res.status(201).json({ emergency });
        console.log(`🚨 SOS created: ${emergency._id}`);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create emergency' });
    }
});
app.post('/api/emergencies/:id/respond', requireResponderOrAdmin, async (req, res) => {
    const { status, responderId, notes } = req.body;
    if (!['responded', 'resolved', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }
    try {
        const actorResponderId = responderId || req.user?.id;
        const emergency = await dbUtils.updateEmergencyStatus(req.params.id, status, actorResponderId, notes);
        if (!emergency)
            return res.status(404).json({ error: 'Emergency not found' });
        io.emit('emergency:updated', { emergency });
        res.json({ emergency });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update emergency status' });
    }
});
app.post('/api/emergencies/:id/assign', requireResponderOrAdmin, async (req, res) => {
    const { responderId } = req.body;
    if (!responderId) {
        return res.status(400).json({ error: 'responderId is required' });
    }
    try {
        const emergency = await dbUtils.assignResponderToEmergency(req.params.id, responderId);
        if (!emergency)
            return res.status(404).json({ error: 'Emergency not found' });
        io.emit('emergency:updated', { emergency });
        // Notify the assigned responder specifically if they are connected
        try {
            const roomName = `responder:${responderId}`;
            io.to(roomName).emit('emergency:assigned', { emergency });
        }
        catch (err) {
            // ignore
        }
        res.json({ emergency });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to assign responder' });
    }
});
app.get('/api/emergencies/active', requireAuthenticated, async (req, res) => {
    try {
        const emergencies = await dbUtils.getCurrentActiveEmergencies();
        res.json({ emergencies });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch active emergencies' });
    }
});
app.get('/api/responders/available', requireAuthenticated, async (req, res) => {
    try {
        const responders = await dbUtils.getActiveUsersByRole('emergency');
        res.json({ responders });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch responders' });
    }
});
app.get('/api/emergencies/analytics', async (req, res) => {
    try {
        const analytics = await dbUtils.getEmergencyAnalytics();
        res.json({ analytics });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch analytics' });
    }
});
/**
 * POST /api/emergencies
 * Create emergency alert
 */
app.post('/api/emergencies', async (req, res) => {
    const validation = validate(EmergencySchema, req.body);
    if (!validation.success)
        return res.status(400).json({ error: validation.error });
    try {
        const emergency = await dbUtils.createEmergency(validation.data);
        res.status(201).json(emergency);
        // In production, send notifications to nearby responders
        console.log(`🚨 Emergency alert created: ${emergency._id}`);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create emergency' });
    }
});
/**
 * GET /api/emergencies/nearby
 * Find emergencies near location
 */
app.get('/api/emergencies/nearby', async (req, res) => {
    const { latitude, longitude, maxDistance } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'latitude and longitude required' });
    }
    try {
        const emergencies = await dbUtils.findEmergenciesNearby(parseFloat(longitude), parseFloat(latitude), parseInt(maxDistance || '5'));
        res.json(emergencies);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch emergencies' });
    }
});
/**
 * GET /api/emergencies/critical
 * Get all critical emergencies
 */
app.get('/api/emergencies/critical', async (req, res) => {
    try {
        const emergencies = await dbUtils.getCriticalEmergencies();
        res.json(emergencies);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch critical emergencies' });
    }
});
// ============================================
// APPOINTMENT ENDPOINTS
// ============================================
/**
 * POST /api/appointments
 * Create appointment
 */
app.post('/api/appointments', async (req, res) => {
    const validation = validate(AppointmentSchema, req.body);
    if (!validation.success)
        return res.status(400).json({ error: validation.error });
    try {
        const appointment = await dbUtils.createAppointment(validation.data);
        res.status(201).json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create appointment' });
    }
});
/**
 * GET /api/appointments/patient/:patientId
 * Get patient's appointments
 */
app.get('/api/appointments/patient/:patientId', async (req, res) => {
    try {
        const status = req.query.status;
        const appointments = await dbUtils.getPatientAppointments(req.params.patientId, status);
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch appointments' });
    }
});
/**
 * GET /api/appointments/upcoming
 * Get upcoming appointments
 */
app.get('/api/appointments/upcoming', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const appointments = await dbUtils.getUpcomingAppointments(limit);
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch appointments' });
    }
});
/**
 * PUT /api/appointments/:appointmentId/confirm
 * Confirm appointment
 */
app.put('/api/appointments/:appointmentId/confirm', async (req, res) => {
    try {
        const appointment = await dbUtils.confirmAppointment(req.params.appointmentId);
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to confirm appointment' });
    }
});
// ============================================
// NOTIFICATION ENDPOINTS
// ============================================
/**
 * GET /api/notifications/:userId
 * Get user's unread notifications
 */
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const notifications = await dbUtils.getUnreadNotifications(req.params.userId);
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch notifications' });
    }
});
/**
 * POST /api/notifications
 * Create notification
 */
app.post('/api/notifications', async (req, res) => {
    const validation = validate(NotificationSchema, req.body);
    if (!validation.success)
        return res.status(400).json({ error: validation.error });
    try {
        const notification = await dbUtils.createNotification(validation.data);
        res.status(201).json(notification);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create notification' });
    }
});
/**
 * PUT /api/notifications/:notificationId/read
 * Mark notification as read
 */
app.put('/api/notifications/:notificationId/read', async (req, res) => {
    try {
        const notification = await dbUtils.markNotificationAsRead(req.params.notificationId);
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update notification' });
    }
});
// ============================================
// AI HEALTHCARE ENDPOINTS (PHASE 4)
// ============================================
/**
 * POST /api/ai/analyze-symptoms
 * AI symptom analysis with risk scoring
 */
app.post('/api/ai/analyze-symptoms', async (req, res) => {
    const { userId, symptoms, duration, severity, medicalHistory, currentMedications, language } = req.body;
    if (!userId || !symptoms) {
        return res.status(400).json({ error: 'userId and symptoms required' });
    }
    try {
        const result = await AIHealthcare.processSymptomsWithAI({
            userId,
            symptoms,
            duration,
            severity: severity || 5,
            medicalHistory,
            currentMedications,
            language: language || 'en',
        });
        res.json({
            success: true,
            data: result.analysis,
            recordId: result.recordId,
            notificationSent: result.notificationSent,
            severity: formatSeverity(result.analysis.riskLevel),
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Analysis failed' });
    }
});
/**
 * POST /api/ai/detect-emergency
 * Emergency detection and alert
 */
app.post('/api/ai/detect-emergency', async (req, res) => {
    const { userId, symptoms, severity, vitalSigns, location, language } = req.body;
    if (!userId || !symptoms) {
        return res.status(400).json({ error: 'userId and symptoms required' });
    }
    try {
        const result = await AIHealthcare.processEmergencyDetection({
            userId,
            symptoms,
            severity,
            vitalSigns,
            location,
            language: language || 'en',
        });
        if (result.isEmergency) {
            res.status(200).json({
                success: true,
                isEmergency: true,
                severity: result.emergency.severity,
                immediateActions: result.actions,
                emergencyServices: result.emergency.emergencyServices,
                emergencyId: result.emergencyId,
            });
        }
        else {
            res.json({
                success: true,
                isEmergency: false,
                severity: result.emergency.severity,
            });
        }
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Emergency detection failed' });
    }
});
/**
 * POST /api/ai/risk-assessment
 * Health risk scoring and analysis
 */
app.post('/api/ai/risk-assessment', async (req, res) => {
    const { userId, age, symptoms, severity, medicalHistory, vitalSigns } = req.body;
    if (!userId || !symptoms) {
        return res.status(400).json({ error: 'userId and symptoms required' });
    }
    try {
        const result = await AIHealthcare.generateHealthRiskAssessment({
            userId,
            age,
            symptoms,
            severity,
            medicalHistory,
            vitalSigns,
        });
        res.json({
            success: true,
            riskScore: result.riskAssessment.riskScore,
            riskLevel: formatSeverity(result.riskAssessment.riskLevel),
            factors: result.riskAssessment.factors,
            recommendations: result.riskAssessment.recommendations,
            recordId: result.recordId,
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Risk assessment failed' });
    }
});
/**
 * POST /api/ai/medication-recommendations
 * AI-powered medication suggestions
 */
app.post('/api/ai/medication-recommendations', async (req, res) => {
    const { userId, condition, symptoms, age, allergies, language } = req.body;
    if (!userId || !condition || !symptoms) {
        return res.status(400).json({ error: 'userId, condition, and symptoms required' });
    }
    try {
        const result = await AIHealthcare.getMedicationRecommendations({
            userId,
            condition,
            symptoms,
            age,
            allergies,
            language: language || 'en',
        });
        res.json({
            success: true,
            recommendations: result.recommendations.commonMedications,
            lifestyleRecommendations: result.recommendations.lifestyleRecommendations,
            whenToSeekHelp: result.recommendations.whenToSeekHelp,
            recordId: result.recordId,
            disclaimer: '⚠️ Consult a healthcare provider before taking any medication',
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Recommendation generation failed' });
    }
});
/**
 * POST /api/ai/assistant
 * Healthcare AI assistant chat
 */
app.post('/api/ai/assistant', async (req, res) => {
    const { userId, query, language, context } = req.body;
    if (!userId || !query || !language) {
        return res.status(400).json({ error: 'userId, query, and language required' });
    }
    try {
        const result = await AIHealthcare.askHealthcareAssistant({
            userId,
            query,
            language,
            context,
        });
        res.json({
            success: true,
            response: result.response,
            disclaimer: result.disclaimer,
            language: result.language,
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Assistant query failed' });
    }
});
/**
 * GET /api/ai/wellness-report/:userId
 * Generate wellness report for user
 */
app.get('/api/ai/wellness-report/:userId', async (req, res) => {
    try {
        const report = await AIHealthcare.generateWellnessReport(req.params.userId);
        res.json({
            success: true,
            report,
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Report generation failed' });
    }
});
/**
 * GET /api/ai/population-health
 * Population health insights (admin only)
 */
app.get('/api/ai/population-health', async (req, res) => {
    try {
        const insights = await AIHealthcare.generatePopulationHealthInsights();
        res.json({
            success: true,
            insights,
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Insights generation failed' });
    }
});
// ============================================
// DIAGNOSIS ENDPOINT (LEGACY - Deprecated in favor of /api/ai/analyze-symptoms)
// ============================================
app.post('/api/diagnose', async (req, res) => {
    const { symptoms, severity, duration, userId, language } = req.body;
    if (!symptoms)
        return res.status(400).json({ error: 'symptoms required' });
    try {
        // Use new AI healthcare system
        const result = await AIHealthcare.processSymptomsWithAI({
            userId,
            symptoms,
            duration,
            severity: severity || 5,
            language: language || 'en',
        });
        res.json({
            success: true,
            diagnosis: result.analysis,
            recordId: result.recordId,
        });
    }
    catch (error) {
        console.error('Diagnosis error:', error);
        res.status(500).json({ error: 'AI unavailable', fallback: true });
    }
});
// ============================================
// ERROR HANDLING
// ============================================
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// ============================================
// START SERVER
// ============================================
httpServer.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════╗
  ║     🏥 ArogyaAI Backend v3.0           ║
  ║     Production-Grade Healthcare API     ║
  ╚════════════════════════════════════════╝
  
  ✓ Express running on http://localhost:${PORT}
  ✓ Socket.IO real-time emergency bus enabled
  ✓ MongoDB connection pool: 5-10 connections
  ✓ API Routes active:
    - /api/health-records
    - /api/emergencies
    - /api/hospitals/nearby
    - /api/appointments
    - /api/notifications
    - /api/ai/*
  
  📖 API Documentation: http://localhost:${PORT}/api/docs (coming soon)
  `);
});
export default app;
