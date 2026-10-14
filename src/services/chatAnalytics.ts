export interface ChatAnalyticsData {
  totalChats: number;
  emergencyChats: number;
  symptomFrequency: Record<string, number>;
  conditionFrequency: Record<string, number>;
}

// In-memory mock for session. In production this goes to a real DB.
let globalAnalytics: ChatAnalyticsData = {
  totalChats: 0,
  emergencyChats: 0,
  symptomFrequency: {},
  conditionFrequency: {}
};

export function logChatAnalysis(
  isEmergency: boolean,
  symptoms: string[],
  topConditions: string[]
): void {
  globalAnalytics.totalChats++;
  if (isEmergency) {
    globalAnalytics.emergencyChats++;
  }

  symptoms.forEach(s => {
    globalAnalytics.symptomFrequency[s] = (globalAnalytics.symptomFrequency[s] || 0) + 1;
  });

  topConditions.forEach(c => {
    globalAnalytics.conditionFrequency[c] = (globalAnalytics.conditionFrequency[c] || 0) + 1;
  });
}

export function getChatAnalytics(): ChatAnalyticsData {
  return globalAnalytics;
}
