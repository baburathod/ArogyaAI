import HealthcareAI from './gemini';
import { HealthRecord, Notification, Emergency } from '../models';
import mongoose from 'mongoose';

/**
 * Healthcare AI Utilities
 * Integrate Gemini AI with database operations
 */

export const AIHealthcare = {
  /**
   * Process symptom analysis and save to database
   */
  processSymptomsWithAI: async (input: {
    userId: string | mongoose.Types.ObjectId;
    symptoms: string;
    duration?: string;
    severity?: number;
    medicalHistory?: string;
    currentMedications?: string;
    language?: 'en' | 'hi' | 'te';
  }) => {
    try {
      // Get AI analysis
      const analysis = await HealthcareAI.analyzeSymptoms({
        symptoms: input.symptoms,
        duration: input.duration,
        severity: input.severity,
        medicalHistory: input.medicalHistory,
        currentMedications: input.currentMedications,
        language: input.language,
      });

      // Save to health records
      const healthRecord = await HealthRecord.create({
        userId: input.userId,
        recordType: 'diagnosis',
        date: new Date(),
        data: {
          condition: analysis.possibleConditions[0]?.name || 'Symptom Analysis',
          severity: analysis.riskLevel,
          analysis: analysis.analysis,
          possibleConditions: analysis.possibleConditions,
          recommendations: analysis.recommendations,
        },
        notes: `AI Analysis: ${analysis.riskLevel} risk level. Emergency Warning: ${analysis.emergencyWarning}`,
      });

      // Create notifications if needed
      if (analysis.emergencyWarning) {
        await Notification.create({
          userId: input.userId,
          type: 'health_alert',
          title: '🚨 Emergency Warning',
          message: `Emergency indicators detected: ${analysis.emergencySignals.join(', ')}. Seek immediate medical attention.`,
          severity: 'critical',
          read: false,
        });
      } else if (analysis.riskLevel === 'high') {
        await Notification.create({
          userId: input.userId,
          type: 'health_alert',
          title: '⚠️ High Risk Alert',
          message: `Your symptoms indicate a high-risk condition. Please consult a doctor.`,
          severity: 'warning',
          read: false,
        });
      }

      return {
        success: true,
        analysis,
        recordId: healthRecord._id,
        notificationSent: analysis.emergencyWarning || analysis.riskLevel === 'high',
      };
    } catch (error) {
      throw new Error(`Symptom processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Process body region analysis and save to database
   */
  processBodyRegionWithAI: async (input: {
    userId: string | mongoose.Types.ObjectId;
    region: string;
    symptoms: string;
    duration?: string;
    severity?: number;
    medicalHistory?: string;
    currentMedications?: string;
    language?: 'en' | 'hi' | 'te';
  }) => {
    try {
      const analysis = await HealthcareAI.analyzeSymptoms({
        symptoms: input.symptoms,
        region: input.region,
        duration: input.duration,
        severity: input.severity,
        medicalHistory: input.medicalHistory,
        currentMedications: input.currentMedications,
        language: input.language,
      });

      const healthRecord = await HealthRecord.create({
        userId: input.userId,
        recordType: 'body-map',
        date: new Date(),
        data: {
          bodyRegion: input.region,
          condition: analysis.possibleConditions[0]?.name || `${input.region} discomfort`,
          severity: analysis.riskLevel,
          analysis: analysis.analysis,
          possibleConditions: analysis.possibleConditions,
          recommendations: analysis.recommendations,
        },
        notes: `AI body map analysis for ${input.region}. Risk: ${analysis.riskLevel}. Emergency: ${analysis.emergencyWarning}`,
      });

      if (analysis.emergencyWarning) {
        await Notification.create({
          userId: input.userId,
          type: 'health_alert',
          title: '🚨 Emergency Warning',
          message: `Emergency indicators detected in the ${input.region}: ${analysis.emergencySignals.join(', ')}. Seek immediate medical attention.`,
          severity: 'critical',
          read: false,
        });
      } else if (analysis.riskLevel === 'high') {
        await Notification.create({
          userId: input.userId,
          type: 'health_alert',
          title: '⚠️ High Risk Alert',
          message: `Your ${input.region} symptoms indicate a high-risk condition. Please consult a doctor.`,
          severity: 'warning',
          read: false,
        });
      }

      return {
        success: true,
        analysis,
        recordId: healthRecord._id,
        notificationSent: analysis.emergencyWarning || analysis.riskLevel === 'high',
      };
    } catch (error) {
      throw new Error(`Body region processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Process emergency detection and create alert
   */
  processEmergencyDetection: async (input: {
    userId: string | mongoose.Types.ObjectId;
    symptoms: string;
    severity?: number;
    vitalSigns?: {
      temperature?: number;
      heartRate?: number;
      bloodPressure?: string;
      respiratoryRate?: number;
    };
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    language?: 'en' | 'hi' | 'te';
  }) => {
    try {
      // Get emergency detection
      const emergency = await HealthcareAI.detectEmergency({
        symptoms: input.symptoms,
        severity: input.severity,
        vitalSigns: input.vitalSigns,
        language: input.language,
      });

      if (emergency.isEmergency) {
        // Create emergency record
        const emergencyRecord = await Emergency.create({
          userId: input.userId,
          type: 'medical_emergency',
          severity: emergency.severity,
          location: {
            latitude: input.location?.latitude || 0,
            longitude: input.location?.longitude || 0,
            address: input.location?.address || 'Location not provided',
          },
          description: `${input.symptoms}. Indicators: ${emergency.indicators.join(', ')}`,
          contactedServices: [],
          status: 'active',
        });

        // Create critical notification
        await Notification.create({
          userId: input.userId,
          type: 'emergency',
          title: '🚨 Emergency Alert - Immediate Action Required',
          message: `${emergency.immediateActions[0]} Emergency Services: ${emergency.emergencyServices}`,
          severity: 'critical',
          read: false,
        });

        return {
          success: true,
          isEmergency: true,
          emergency,
          emergencyId: emergencyRecord._id,
          actions: emergency.immediateActions,
        };
      }

      return {
        success: true,
        isEmergency: false,
        emergency,
      };
    } catch (error) {
      throw new Error(`Emergency detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Generate health risk assessment and save
   */
  generateHealthRiskAssessment: async (input: {
    userId: string | mongoose.Types.ObjectId;
    age?: number;
    symptoms: string;
    severity?: number;
    medicalHistory?: string;
    vitalSigns?: {
      temperature?: number;
      heartRate?: number;
      bloodPressure?: string;
      spo2?: number;
    };
  }) => {
    try {
      const riskAssessment = await HealthcareAI.calculateRiskScore({
        age: input.age,
        symptoms: input.symptoms,
        severity: input.severity,
        medicalHistory: input.medicalHistory,
        vitalSigns: input.vitalSigns,
      });

      // Save risk assessment to health records
      const healthRecord = await HealthRecord.create({
        userId: input.userId,
        recordType: 'diagnosis',
        date: new Date(),
        data: {
          condition: 'Health Risk Assessment',
          severity: riskAssessment.riskLevel,
          riskScore: riskAssessment.riskScore,
          riskFactors: riskAssessment.factors,
          recommendations: riskAssessment.recommendations,
        },
        notes: `Automated Risk Assessment - Score: ${riskAssessment.riskScore}/100`,
      });

      // Create notification based on risk level
      if (riskAssessment.riskLevel === 'critical') {
        await Notification.create({
          userId: input.userId,
          type: 'health_alert',
          title: '🚨 Critical Health Risk Detected',
          message: `Risk score: ${riskAssessment.riskScore}/100. Immediate medical consultation needed.`,
          severity: 'critical',
          read: false,
        });
      } else if (riskAssessment.riskLevel === 'high') {
        await Notification.create({
          userId: input.userId,
          type: 'health_alert',
          title: '⚠️ High Health Risk',
          message: `Risk score: ${riskAssessment.riskScore}/100. Schedule a doctor's appointment soon.`,
          severity: 'warning',
          read: false,
        });
      }

      return {
        success: true,
        riskAssessment,
        recordId: healthRecord._id,
      };
    } catch (error) {
      throw new Error(`Risk assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Chat with healthcare assistant
   */
  askHealthcareAssistant: async (input: {
    userId: string | mongoose.Types.ObjectId;
    query: string;
    language: 'en' | 'hi' | 'te';
    context?: string;
  }) => {
    try {
      const response = await HealthcareAI.getMultilingualResponse({
        query: input.query,
        language: input.language,
        context: input.context,
      });

      await Notification.create({
        userId: input.userId,
        type: 'system',
        title: 'ArogyaAI Assistant Answer',
        message: response.response.length > 180 ? `${response.response.slice(0, 180)}...` : response.response,
        severity: 'info',
        actionUrl: '/ai',
        actionLabel: 'View assistant response',
        metadata: {
          query: input.query,
          language: input.language,
          responseSnippet: response.response.slice(0, 180),
        },
      });

      return {
        success: true,
        response: response.response,
        disclaimer: response.disclaimer,
        language: response.language,
      };
    } catch (error) {
      throw new Error(`Assistant query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get medication recommendations and save
   */
  getMedicationRecommendations: async (input: {
    userId: string | mongoose.Types.ObjectId;
    condition: string;
    symptoms: string;
    age?: number;
    allergies?: string;
    language?: 'en' | 'hi' | 'te';
  }) => {
    try {
      const recommendations = await HealthcareAI.getMedicationAdvice({
        condition: input.condition,
        symptoms: input.symptoms,
        age: input.age,
        allergies: input.allergies,
        language: input.language,
      });

      // Save to health records
      const healthRecord = await HealthRecord.create({
        userId: input.userId,
        recordType: 'prescription',
        date: new Date(),
        data: {
          condition: input.condition,
          medications: recommendations.commonMedications.map((med) => ({
            name: med.name,
            dosage: med.usage,
            frequency: 'As per medical advice',
            duration: 'Consult doctor',
          })),
          recommendations: recommendations.lifestyleRecommendations,
        },
        notes: `AI Generated Medication Recommendations. ${recommendations.commonMedications.map((m) => `Cautions: ${m.cautions.join(', ')}`).join(' ')}`,
      });

      return {
        success: true,
        recommendations,
        recordId: healthRecord._id,
      };
    } catch (error) {
      throw new Error(`Medication recommendations failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Generate wellness report for user
   */
  generateWellnessReport: async (userId: string | mongoose.Types.ObjectId) => {
    try {
      const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

      // Get recent health records
      const recentRecords = await HealthRecord.find({ userId: userIdObj }).sort({ date: -1 }).limit(20);

      // Get risk assessment if available
      const latestRiskAssessment = recentRecords.find((r) => (r.data as any).riskScore);

      // Get active notifications
      const activeNotifications = await Notification.find({ userId: userIdObj, read: false, severity: 'warning' });

      return {
        lastAnalysis: recentRecords[0]?.date,
        totalRecords: recentRecords.length,
        latestRiskScore: latestRiskAssessment ? (latestRiskAssessment.data as any).riskScore : 'N/A',
        riskLevel: latestRiskAssessment?.data.severity || 'Unknown',
        pendingAlerts: activeNotifications.length,
        recentConditions: recentRecords
          .filter((r) => r.data.condition)
          .slice(0, 5)
          .map((r) => r.data.condition),
      };
    } catch (error) {
      throw new Error(`Wellness report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Bulk AI analysis for population health (admin feature)
   */
  generatePopulationHealthInsights: async () => {
    try {
      // Get recent health data across all users
      const recentAnalyses = await HealthRecord.find({
        recordType: 'diagnosis',
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      }).limit(1000);

      // Aggregate by condition
      const conditionCounts: Record<string, number> = {};
      recentAnalyses.forEach((record) => {
        const condition = record.data.condition || 'Unknown';
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      });

      // Get critical emergencies
      const recentEmergencies = await Emergency.find({
        status: 'active',
        severity: 'critical',
      });

      return {
        period: 'Last 30 days',
        totalAnalyses: recentAnalyses.length,
        topConditions: Object.entries(conditionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10),
        criticalCases: recentEmergencies.length,
        highRiskUsers: recentAnalyses.filter((r) => r.data.severity === 'high').length,
      };
    } catch (error) {
      throw new Error(`Population insights generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

export default AIHealthcare;
