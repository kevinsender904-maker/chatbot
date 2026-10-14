import { detectEmergency } from './emergencyDetector';

export enum SeverityLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Emergency = 'Emergency'
}

const cache = new Map<string, string[]>();

export function extractSymptoms(text: string): string[] {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  if (cache.has(lowerText)) {
    return cache.get(lowerText) || [];
  }
  
  const possibleSymptoms = [
    'fever', 'headache', 'pain', 'cough', 'sneeze', 'nausea', 'vomit', 'dizzy', 'fatigue',
    'chest pain', 'breathing difficulty', 'stroke', 'unconscious', 'seizure', 'severe bleeding', 'suicidal',
    'rash', 'itch', 'diarrhea', 'stomach', 'sweat', 'chills', 'thirst', 'dry mouth', 'vision', 'weight loss',
    'hunger', 'urination', 'congestion', 'runny nose', 'sore throat', 'cramps', 'bloating'
  ];
  
  const extracted: string[] = [];
  
  for (const symptom of possibleSymptoms) {
    if (lowerText.includes(symptom)) {
      extracted.push(symptom);
    }
  }
  
  // Keep cache size constrained to recent 100 items to avoid memory leaks
  if (cache.size > 100) cache.clear();
  cache.set(lowerText, extracted);
  
  return extracted;
}

export function classifySeverity(symptoms: string[]): SeverityLevel {
  const symptomString = symptoms.join(' ');
  if (detectEmergency(symptomString)) {
    return SeverityLevel.Emergency;
  }
  
  const highSeverity = ['pain', 'vomit', 'diarrhea', 'severe', 'vision'];
  const mediumSeverity = ['fever', 'headache', 'dizzy', 'fatigue', 'nausea'];
  
  let isHigh = false;
  let isMedium = false;
  
  for (const s of symptoms) {
    if (highSeverity.some(hs => s.includes(hs))) isHigh = true;
    if (mediumSeverity.some(ms => s.includes(ms))) isMedium = true;
  }
  
  if (isHigh) return SeverityLevel.High;
  if (isMedium) return SeverityLevel.Medium;
  return SeverityLevel.Low;
}
