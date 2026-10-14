import { ConditionMatch } from './conditionMatcher';

export function extractConversationMemory(messages: any[]) {
  // Simple stateless extraction of previous symptoms from past messages
  // In a real application, we might store this in a database per conversation thread
  return {
    symptoms: []
  };
}

export function isFollowUpQuestion(text: string): boolean {
  const lowerText = text.toLowerCase();
  const followUpIndicators = [
    'what should i do',
    'is it serious',
    'explain more',
    'medicine',
    'help',
    'how long',
    'and also',
    'now i',
    'what medicine helps',
    'kya karun',
    'aur'
  ];
  return followUpIndicators.some(ind => lowerText.includes(ind)) || lowerText.split(' ').length <= 5;
}

export function generatePatientSummary(symptoms: string[], conditions: ConditionMatch[], severity: string): string {
  const symptomList = symptoms.length > 0 
    ? symptoms.map(s => `* ${s}`).join('\n') 
    : '* None explicitly identified';
    
  const conditionList = conditions.length > 0
    ? conditions.slice(0, 2).map(c => `* ${c.condition.conditionName}`).join('\n')
    : '* Pending evaluation';
    
  return `Recent Symptoms:\n${symptomList}\n\nMost Likely Conditions:\n${conditionList}\n\nCurrent Severity:\n* ${severity}`;
}
