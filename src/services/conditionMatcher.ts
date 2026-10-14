import { MedicalCondition, knowledgeBase } from '../data/medicalKnowledgeBase';

export interface ConditionMatch {
  condition: MedicalCondition;
  score: number;
}

export function calculateMatchScore(symptoms: string[], conditionSymptoms: string[]): number {
  if (!symptoms || symptoms.length === 0) return 0;
  
  let matchCount = 0;
  for (const s of symptoms) {
    if (conditionSymptoms.some(cs => cs.includes(s) || s.includes(cs))) {
      matchCount++;
    }
  }
  return matchCount / Math.max(symptoms.length, conditionSymptoms.length);
}

export function findMatchingConditions(symptoms: string[]): ConditionMatch[] {
  if (!symptoms || symptoms.length === 0) return [];
  
  const matches: ConditionMatch[] = [];
  
  for (const condition of knowledgeBase) {
    const score = calculateMatchScore(symptoms, condition.symptoms);
    if (score > 0) {
      matches.push({ condition, score });
    }
  }
  
  return matches.sort((a, b) => b.score - a.score);
}
