import { MedicalCondition, knowledgeBase } from '../data/medicalKnowledgeBase';
import { expandSymptoms } from './semanticMatcher';
import { SeverityLevel } from './symptomAnalyzer';

export interface RetrievedKnowledge {
  condition: MedicalCondition;
  score: number;
  matchReasons: string[];
}

export function searchConditions(
  symptoms: string[],
  historicalSymptoms: string[],
  severity: SeverityLevel
): RetrievedKnowledge[] {
  const expandedSymptoms = expandSymptoms(symptoms);
  const allSymptoms = Array.from(new Set([...expandedSymptoms, ...historicalSymptoms]));
  
  if (allSymptoms.length === 0) return [];

  const results: RetrievedKnowledge[] = [];

  for (const condition of knowledgeBase) {
    let score = 0;
    const matchReasons: string[] = [];
    
    // Symptom Overlap
    let overlapCount = 0;
    for (const sys of allSymptoms) {
      if (condition.symptoms.some(cs => cs.includes(sys) || sys.includes(cs))) {
        overlapCount++;
        score += 10;
      }
    }
    
    if (overlapCount > 0) {
      matchReasons.push(`Matched ${overlapCount} detected symptom(s).`);
    }

    // Keyword Overlap in description/name
    const conditionText = (condition.conditionName + ' ' + condition.description).toLowerCase();
    let keywordCount = 0;
    for (const sys of allSymptoms) {
      if (conditionText.includes(sys.toLowerCase())) {
        keywordCount++;
        score += 5;
      }
    }
    
    if (keywordCount > 0) {
      matchReasons.push(`Matched ${keywordCount} concept(s) in medical description.`);
    }

    // Severity Check Logic (Mocked - we assign +5 if high severity matched a condition that typically warns of severe issues)
    if (severity === SeverityLevel.High || severity === SeverityLevel.Medium) {
      if (condition.warningSigns.toLowerCase().includes('severe') || condition.warningSigns.toLowerCase().includes('high')) {
        score += 5;
        matchReasons.push('Aligns with the current high severity presentation.');
      }
    }

    if (score > 0) {
      results.push({ condition, score, matchReasons });
    }
  }

  return results;
}

export function rankConditions(retrieved: RetrievedKnowledge[]): RetrievedKnowledge[] {
  return retrieved.sort((a, b) => b.score - a.score);
}

export function retrieveRelevantKnowledge(
  currentSymptoms: string[],
  historicalSymptoms: string[],
  severity: SeverityLevel
): RetrievedKnowledge[] {
  const searched = searchConditions(currentSymptoms, historicalSymptoms, severity);
  const ranked = rankConditions(searched);
  return ranked.slice(0, 5); // Return Top 5
}
