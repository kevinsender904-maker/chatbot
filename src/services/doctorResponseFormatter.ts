export function formatMedicalContext(
  latestMessageContent: string,
  allSymptoms: string[],
  severity: string,
  emergencyDetected: boolean,
  matchedConditions: any[],
  confidenceLevel: string,
  language: string,
  patientSummary: string,
  healthTrendText: string,
  riskAssessmentLevel: string,
  riskReasons: string[]
): string {
  let context = `--- MEDICAL INTELLIGENCE LAYER CONTEXT ---\n`;
  context += `User Message: "${latestMessageContent}"\n`;
  context += `Detected Language: ${language}\n`;
  context += `Extracted Symptoms: ${allSymptoms.length > 0 ? allSymptoms.join(", ") : "None explicitly detected"}\n`;
  context += `Calculated Severity Level: ${severity}\n`;
  context += `Health Trend: ${healthTrendText}\n`;
  context += `Risk Assessment Level: ${riskAssessmentLevel}\n`;
  context += `Emergency Status: ${emergencyDetected ? "CRITICAL - SERIOUS EMERGENCY SYMPTOMS DETECTED" : "No acute emergency detected"}\n\n`;

  if (matchedConditions.length > 0) {
    context += `Matched Conditions from Knowledge Base (Top 5):\n`;
    matchedConditions.forEach((match) => {
      const c = match.condition;
      context += `\n* ${c.conditionName}\n`;
      if (match.matchReasons) {
        context += `  - Match Reason: ${match.matchReasons.join(" ")}\n`;
      }
      context += `  - Description: ${c.description}\n`;
      context += `  - Recommended Home Care: ${c.homeCare}\n`;
      context += `  - Preventive Advice: ${c.prevention}\n`;
      context += `  - Warning Signs: ${c.warningSigns}\n`;
    });
  } else {
    context += `Knowledge Base Matches: No direct matches found in local KB.\n`;
  }

  context += `\n--- MEDICAL SAFETY GUARDRAILS ---\n`;
  context += `1. THIS IS NOT A DIAGNOSIS: You MUST explicitly include the clear disclaimer: "This is not a diagnosis" in your condition suggestions section.\n`;
  context += `2. If emergency or serious symptoms are detected, you MUST open with an unmistakable urgent warning to seek immediate professional medical help (dial 911 or local emergency services).\n`;
  context += `3. If the user asks to prescribe medicine, exact dosage, or controlled drugs: You MUST refuse the prescription and strongly recommend seeing a healthcare professional.\n`;

  if (confidenceLevel.toLowerCase().includes("low")) {
    context += `4. Since confidence is low, you MUST state clearly: "This assessment has limited confidence and should not be considered medical advice."\n`;
  }

  if (riskAssessmentLevel.includes("High") || riskAssessmentLevel.includes("Critical")) {
    context += `5. Since the Risk Assessment is ${riskAssessmentLevel}, you MUST include a strong doctor consultation warning.\n`;
  }

  context += `\n--- DOCTOR RESPONSE FRAMEWORK (MANDATORY FORMAT) ---\n`;
  context += `You MUST output your response following this EXACT markdown structure. DO NOT deviate. Avoid omitting any sections. Please respond to the user in ${language}.\n\n`;

  if (emergencyDetected) {
    context += `**🚨 URGENT MEDICAL EMERGENCY WARNING: SEEK IMMEDIATE PROFESSIONAL HELP 🚨**\n` +
      `Serious acute symptoms were detected. Please call 911 (or your local emergency services) or proceed to the nearest emergency department immediately. Do NOT delay seeking care.\n\n`;
  }

  context += `## Patient Summary\n${patientSummary}\n\n`;
  context += `## Health Trend Analysis\n(Explain ${healthTrendText})\n\n`;
  context += `## Risk Assessment\n(Risk Level: ${riskAssessmentLevel}. Factors: ${riskReasons.join(", ")})\n\n`;
  context += `## Health Assessment\n(Provide your objective assessment of the reported symptoms)\n\n`;
  context += `## Possible Condition(s)\n> ⚠️ **Medical Disclaimer: This is not a diagnosis.** The conditions listed below are potential considerations based on the symptoms provided, intended solely for educational and informational purposes. An official diagnosis requires direct evaluation by a licensed healthcare provider.\n\n(List possible conditions based on context or your knowledge)\n\n`;
  context += `## Explanation\n(Explain the conditions and potential physiological causes)\n\n`;
  context += `## Recommended Home Care\n(Provide general supportive home care advice, based on the knowledge base when available)\n\n`;
  context += `## Preventive Advice\n(Lifestyle and preventive measures to avoid recurrence or complications)\n\n`;
  context += `## Warning Signs\n(Red flags that indicate condition worsening)\n\n`;
  context += `## When To See A Doctor\n(Clear guidance on seeking professional medical evaluation)\n\n`;
  context += `## Confidence Analysis\n(State the Confidence Level: ${confidenceLevel} and briefly explain why based on symptoms provided)\n`;

  return context;
}
