import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY is required in .env');
}

const client = new GoogleGenerativeAI(geminiApiKey);

/**
 * Healthcare AI System using Gemini
 * Provides specialized healthcare analysis with safety guardrails
 */

export const HealthcareAI = {
  /**
   * Initialize Gemini model for healthcare
   */
  getModel: () => {
    return client.getGenerativeModel({
      model: 'gemini-pro',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
  },

  /**
   * System prompt for healthcare AI
   */
  getSystemPrompt: (language: 'en' | 'hi' | 'te' = 'en'): string => {
    const prompts = {
      en: `You are Dr. Arogya, a compassionate and knowledgeable healthcare AI assistant designed specifically for rural and urban healthcare in India. Your role is to provide evidence-based medical guidance while being sensitive to cultural contexts and resource constraints.

IMPORTANT GUIDELINES:
- Always emphasize that you are NOT a replacement for doctors - users should consult real doctors for serious conditions
- Provide empathetic, clear, and accessible explanations
- Consider Indian healthcare context: common diseases, available medicines, accessibility
- Warn about emergency situations immediately
- Be culturally sensitive and respectful
- Use simple language, avoid jargon where possible
- Provide practical, actionable health advice
- Always mention when professional consultation is needed

RESPONSE FORMAT:
- Start with acknowledgment of symptoms
- Provide analysis in structured format
- Always include emergency warning signs
- Give practical recommendations
- End with clear guidance on when to see a doctor`,

      hi: `आप डॉ. आरोग्य हैं, भारत में ग्रामीण और शहरी स्वास्थ्य सेवा के लिए विशेष रूप से डिज़ाइन किए गए एक सहानुभूतिपूर्ण और जानकार स्वास्थ्य सेवा एआई सहायक।

महत्वपूर्ण दिशानिर्देश:
- हमेशा जोर दें कि आप डॉक्टरों का विकल्प नहीं हैं
- सहानुभूतिपूर्ण और स्पष्ट व्याख्या दें
- भारतीय स्वास्थ्य सेवा संदर्भ को ध्यान में रखें
- आपातकालीन स्थितियों के बारे में तुरंत चेतावनी दें
- सांस्कृतिक रूप से संवेदनशील रहें
- सरल भाषा का उपयोग करें
- व्यावहारिक स्वास्थ्य सलाह दें`,

      te: `మీరు డాక్టర్ ఆరోగ్య, భారతదేశంలో గ్రామీణ మరియు పట్టణ ఆరోగ్య సేవ కోసం ప్రత్యేకంగా రూపొందించిన ఆరోగ్య సేవా AI సహాయకుడు.

ముఖ్య సూచనలు:
- మీరు డాక్టర్ల ప్రత్యామ్నాయం కాదని ఎల్లప్పుడు నొక్కిచెప్పండి
- సానుభూతిపూర్ణ వివరణ ఇవ్వండి
- భారతీయ ఆరోగ్య సేవ సందర్భాన్ని పరిగణించండి
- ఆపత్కరమైన పరిస్థితుల గురించి వెంటనే హెచ్చరించండి`,
    };

    return prompts[language] || prompts['en'];
  },

  /**
   * Analyze symptoms and provide healthcare recommendations
   */
  analyzeSymptoms: async (input: {
    symptoms: string;
    region?: string;
    duration?: string;
    severity?: number; // 1-10
    medicalHistory?: string;
    currentMedications?: string;
    language?: 'en' | 'hi' | 'te';
  }): Promise<{
    analysis: string;
    possibleConditions: Array<{ name: string; likelihood: 'low' | 'medium' | 'high'; reasoning: string }>;
    recommendations: string[];
    emergencyWarning: boolean;
    emergencySignals: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    followUpNeeded: boolean;
  }> => {
    const lang = input.language || 'en';
    const model = HealthcareAI.getModel();

    const prompt = `${HealthcareAI.getSystemPrompt(lang)}

Patient Information:
- Main Symptoms: ${input.symptoms}
- Body Region: ${input.region || 'Not specified'}
- Duration: ${input.duration || 'Not specified'}
- Severity (1-10): ${input.severity || 5}
- Medical History: ${input.medicalHistory || 'None provided'}
- Current Medications: ${input.currentMedications || 'None'}

Please analyze these symptoms and provide:
1. Initial assessment of the symptoms
2. List of possible conditions (with likelihood)
3. Red flags or emergency warning signs
4. Practical recommendations for home care
5. Clear guidance on when to seek professional help
6. Risk level assessment (low/medium/high/critical)

Format response as JSON with keys: analysis, possibleConditions (array with name, likelihood, reasoning), recommendations (array of strings), emergencyWarning (boolean), emergencySignals (array of strings), riskLevel, followUpNeeded (boolean)`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback parsing
      return {
        analysis: responseText,
        possibleConditions: [],
        recommendations: [],
        emergencyWarning: false,
        emergencySignals: [],
        riskLevel: 'medium' as const,
        followUpNeeded: true,
      };
    } catch (error) {
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Detect emergency indicators
   */
  detectEmergency: async (input: {
    symptoms: string;
    severity?: number;
    vitalSigns?: {
      temperature?: number;
      heartRate?: number;
      bloodPressure?: string;
      respiratoryRate?: number;
    };
    language?: 'en' | 'hi' | 'te';
  }): Promise<{
    isEmergency: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    indicators: string[];
    immediateActions: string[];
    emergencyServices: string;
  }> => {
    const lang = input.language || 'en';
    const model = HealthcareAI.getModel();

    const vitalsText = input.vitalSigns
      ? `Vital Signs:
  - Temperature: ${input.vitalSigns.temperature || 'N/A'}°C
  - Heart Rate: ${input.vitalSigns.heartRate || 'N/A'} bpm
  - Blood Pressure: ${input.vitalSigns.bloodPressure || 'N/A'}
  - Respiratory Rate: ${input.vitalSigns.respiratoryRate || 'N/A'} breaths/min`
      : 'Vital Signs: Not provided';

    const prompt = `You are an emergency triage AI. Analyze this case for emergency indicators:

Symptoms: ${input.symptoms}
Severity Level (1-10): ${input.severity || 5}
${vitalsText}

Determine:
1. Is this an emergency? (yes/no)
2. Severity level (low/medium/high/critical)
3. List all concerning indicators
4. Immediate actions the patient/caregiver should take
5. Which emergency services to contact (ambulance/ER/hotline)

Format as JSON: { isEmergency: boolean, severity: string, indicators: [], immediateActions: [], emergencyServices: string }

Respond ONLY with valid JSON, no other text.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isEmergency: parsed.isEmergency === true,
          severity: parsed.severity || 'medium',
          indicators: parsed.indicators || [],
          immediateActions: parsed.immediateActions || ['Consult a healthcare provider'],
          emergencyServices: parsed.emergencyServices || '112',
        };
      }

      return {
        isEmergency: input.severity ? input.severity > 7 : false,
        severity: (input.severity && input.severity > 7 ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical',
        indicators: [],
        immediateActions: ['Consult a healthcare provider immediately'],
        emergencyServices: '112 (Ambulance) or nearest hospital',
      };
    } catch (error) {
      throw new Error(`Emergency detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Calculate health risk score based on symptoms and vitals
   */
  calculateRiskScore: async (input: {
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
  }): Promise<{
    riskScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{ factor: string; weight: number; concern: string }>;
    recommendations: string[];
  }> => {
    const model = HealthcareAI.getModel();

    const prompt = `Calculate health risk score for:
Age: ${input.age || 'Unknown'}
Symptoms: ${input.symptoms}
Severity: ${input.severity || 5}/10
Medical History: ${input.medicalHistory || 'None'}
Vitals: Temp=${input.vitalSigns?.temperature || '?'}, HR=${input.vitalSigns?.heartRate || '?'}, BP=${input.vitalSigns?.bloodPressure || '?'}, SpO2=${input.vitalSigns?.spo2 || '?'}

Provide risk score (0-100):
- 0-30: Low risk
- 31-60: Medium risk  
- 61-80: High risk
- 81-100: Critical risk

Format as JSON: {
  riskScore: number,
  riskLevel: 'low|medium|high|critical',
  factors: [{factor: string, weight: number (0-100), concern: string}],
  recommendations: []
}

Respond ONLY with valid JSON.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Default fallback
      return {
        riskScore: 50,
        riskLevel: 'medium' as const,
        factors: [{ factor: 'Unable to assess', weight: 0, concern: 'Professional evaluation recommended' }],
        recommendations: ['Consult with a healthcare provider'],
      };
    } catch (error) {
      throw new Error(`Risk calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get multilingual healthcare response
   */
  getMultilingualResponse: async (input: {
    query: string;
    language: 'en' | 'hi' | 'te';
    context?: string;
  }): Promise<{
    response: string;
    language: string;
    disclaimer: string;
  }> => {
    const model = HealthcareAI.getModel();

    const disclaimers = {
      en: '⚠️ DISCLAIMER: This is AI-generated guidance, not a replacement for professional medical advice. Consult a licensed healthcare provider for diagnosis and treatment.',
      hi: '⚠️ अस्वीकरण: यह एआई-जनित मार्गदर्शन है, पेशेवर चिकित्सा सलाह का विकल्प नहीं है। निदान और उपचार के लिए किसी लाइसेंसप्राप्त स्वास्थ्य सेवा प्रदाता से परामर्श लें।',
      te: '⚠️ నిరాకరణ: ఇది AI-ఉత్పత్తి చేసిన నిర్దేశిక, వృत్తిపరమైన చిందం సలహా కాదు. నిర్ధారణ మరియు చికిత్సకు లైసెన్సు పొందిన ఆరోగ్య సేవా ప్రదాత సంపర్కించండి.',
    };

    const prompt = `${HealthcareAI.getSystemPrompt(input.language)}

${input.context ? `Context: ${input.context}` : ''}

Patient Query: ${input.query}

Respond in ${input.language === 'en' ? 'English' : input.language === 'hi' ? 'Hindi' : 'Telugu'} with clear, helpful healthcare guidance.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      return {
        response: responseText,
        language: input.language,
        disclaimer: disclaimers[input.language],
      };
    } catch (error) {
      throw new Error(`Response generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get medication recommendations
   */
  getMedicationAdvice: async (input: {
    condition: string;
    symptoms: string;
    age?: number;
    allergies?: string;
    language?: 'en' | 'hi' | 'te';
  }): Promise<{
    commonMedications: Array<{
      name: string;
      type: string;
      usage: string;
      cautions: string[];
    }>;
    lifestyleRecommendations: string[];
    whenToSeekHelp: string[];
  }> => {
    const lang = input.language || 'en';
    const model = HealthcareAI.getModel();

    const prompt = `For a ${input.age ? input.age + ' year old' : 'patient'} with ${input.condition}:
Symptoms: ${input.symptoms}
Allergies: ${input.allergies || 'None reported'}

Provide commonly recommended medications available in India (generic names):
- Include dosage guidance
- Common side effects
- Drug interactions to avoid

Also suggest lifestyle modifications and when to seek medical help.

Format as JSON with keys: commonMedications (array with name, type, usage, cautions), lifestyleRecommendations, whenToSeekHelp`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        commonMedications: [],
        lifestyleRecommendations: ['Consult with a healthcare provider for personalized medication'],
        whenToSeekHelp: ['Immediately if symptoms worsen'],
      };
    } catch (error) {
      throw new Error(`Medication advice failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

export default HealthcareAI;
