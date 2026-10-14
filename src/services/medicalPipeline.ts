import { extractSymptoms, classifySeverity } from "./symptomAnalyzer";
import { detectEmergency } from "./emergencyDetector";
import { formatMedicalContext } from "./doctorResponseFormatter";
import { getPreferredLanguage } from "./languageDetector";
import { normalizeMedicalTerms } from "./medicalNormalizer";
import { calculateConfidence } from "./confidenceCalculator";
import { isFollowUpQuestion, generatePatientSummary } from "./conversationMemory";
import { retrieveRelevantKnowledge } from "./knowledgeRetriever";
import { analyzeHealthTrend } from "./healthTrendAnalyzer";
import { calculateRisk } from "./riskAssessment";
import { logChatAnalysis } from "./chatAnalytics";

export const SYSTEM_INSTRUCTION = `You are HealthCare AI Assistant, an empathetic, evidence-based virtual healthcare assistant. Your primary purpose is to help users understand symptoms, general health conditions, and wellness information.

MANDATORY SAFETY PROTOCOLS:
1. CLEAR DISCLAIMER: When suggesting possible conditions, you MUST ALWAYS provide the explicit disclaimer: "This is not a medical diagnosis. These suggestions are for informational and educational purposes only. Please consult a qualified medical professional for an official diagnosis and treatment plan."
2. EMERGENCY GUIDANCE: If serious or emergency symptoms are detected (such as acute chest pain, severe shortness of breath, stroke symptoms, uncontrolled bleeding, loss of consciousness, seizures, or suicidal thoughts), you MUST immediately advise the user to contact emergency services (e.g. dial 911/112/988) and seek urgent professional medical attention.
3. NEVER PRESCRIBE: Never prescribe prescription drugs or exact medication dosages. Suggest only safe, supportive, non-pharmacological home care and recommend discussing medications with a physician or pharmacist.
4. TONE & ACCURACY: Respond empathetically, clearly, and responsibly. If uncertainty exists, acknowledge limitations and direct the user to a clinical professional.`;

export interface ChatMessageInput {
  role: string;
  content: string;
}

export interface UserProfileContext {
  name?: string;
  age_range?: string;
  language?: string;
}

export interface MedicalPipelineResult {
  formattedMessages: Array<{ role: string; parts: Array<{ text: string }> }>;
  accumulatedSymptoms: string[];
  emergency: boolean;
  severity: ReturnType<typeof classifySeverity>;
  trend: ReturnType<typeof analyzeHealthTrend>;
  risk: ReturnType<typeof calculateRisk>;
  confidence: ReturnType<typeof calculateConfidence>;
  language: string;
}

/**
 * Runs the deterministic medical intelligence analysis pipeline across conversation history.
 * Shared between Cloudflare Workers and any client/server environments without Node-only dependencies.
 */
export function processMedicalPipeline(
  messages: ChatMessageInput[],
  userProfile?: UserProfileContext
): MedicalPipelineResult {
  let allPreviousText = "";
  const historicalSymptomsArray: string[][] = [];
  const previousMessages = messages.slice(0, -1);

  previousMessages.forEach((m) => {
    if (m.role === "user") {
      allPreviousText += m.content + " ";
      historicalSymptomsArray.push(extractSymptoms(normalizeMedicalTerms(m.content)));
    }
  });

  const lastMessage = messages[messages.length - 1]?.content || "";

  const normalizedPreviousText = normalizeMedicalTerms(allPreviousText);
  const normalizedLastMessage = normalizeMedicalTerms(lastMessage);
  historicalSymptomsArray.push(extractSymptoms(normalizedLastMessage));
  const historicalFlat = historicalSymptomsArray.flat();

  // If user has a persisted language preference in profile, prioritize it unless user switched language in text
  const detectedMsgLanguage = getPreferredLanguage(lastMessage);
  const language =
    userProfile?.language && detectedMsgLanguage === "english"
      ? userProfile.language
      : detectedMsgLanguage;

  const isFollowUp = isFollowUpQuestion(normalizedLastMessage);

  // Combine memory for symptom extraction if it's a follow up
  const contextToAnalyze = isFollowUp
    ? normalizedPreviousText + " " + normalizedLastMessage
    : normalizedLastMessage;

  const accumulatedSymptoms = Array.from(new Set(extractSymptoms(contextToAnalyze)));

  const emergency = detectEmergency(contextToAnalyze);
  const severity = classifySeverity(accumulatedSymptoms);
  const matchedConditions = retrieveRelevantKnowledge(accumulatedSymptoms, historicalFlat, severity);

  // Advanced medical analysis
  const trend = analyzeHealthTrend(historicalSymptomsArray);
  const risk = calculateRisk(accumulatedSymptoms.length, severity, emergency, trend.status);
  const confidence = calculateConfidence(accumulatedSymptoms.length, matchedConditions as any, emergency);
  const patientSummary = generatePatientSummary(accumulatedSymptoms, matchedConditions as any, severity);

  logChatAnalysis(emergency, accumulatedSymptoms, matchedConditions.map((c) => c.condition.conditionName));

  const enrichedContext = formatMedicalContext(
    lastMessage,
    accumulatedSymptoms,
    severity,
    emergency,
    matchedConditions,
    confidence,
    language,
    patientSummary,
    trend.description,
    risk.level,
    risk.reasons
  );

  const formattedMessages = messages.map((m, index) => {
    if (index === messages.length - 1 && m.role === "user") {
      return {
        role: m.role,
        parts: [{ text: enrichedContext }],
      };
    }
    return {
      role: m.role,
      parts: [{ text: m.content }],
    };
  });

  return {
    formattedMessages,
    accumulatedSymptoms,
    emergency,
    severity,
    trend,
    risk,
    confidence,
    language,
  };
}
