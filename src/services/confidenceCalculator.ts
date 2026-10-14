import { ConditionMatch } from './conditionMatcher';

export enum ConfidenceLevel {
  Low = 'Low Confidence',
  Medium = 'Medium Confidence',
  High = 'High Confidence'
}

export function calculateConfidence(
  symptomCount: number,
  matches: ConditionMatch[],
  isEmergency: boolean
): ConfidenceLevel {
  if (isEmergency) {
    return ConfidenceLevel.High;
  }
  
  if (symptomCount === 0 || matches.length === 0) {
    return ConfidenceLevel.Low;
  }
  
  const bestScore = matches[0].score;
  
  if (bestScore >= 0.6) {
    return ConfidenceLevel.High;
  } else if (bestScore >= 0.3) {
    return ConfidenceLevel.Medium;
  } else {
    return ConfidenceLevel.Low;
  }
}
