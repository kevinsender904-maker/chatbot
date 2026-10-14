export const semanticSynonyms: Record<string, string[]> = {
  'fever': ['temperature', 'hot', 'warm'],
  'headache': ['migraine', 'head pain', 'head pressure'],
  'cold': ['flu', 'chill'],
  'cough': ['respiratory infection', 'hack'],
  'stomach pain': ['abdominal pain', 'belly ache', 'stomachache', 'tummy ache'],
  'nausea': ['queasy', 'sick to stomach'],
  'fatigue': ['tired', 'exhausted', 'weak', 'lethargy'],
  'breathing difficulty': ['shortness of breath', 'dyspnea', 'hard to breathe']
};

// Precompute lookup table for O(1) synonym expansion
const synonymLookup = new Map<string, string[]>();

for (const [key, synonyms] of Object.entries(semanticSynonyms)) {
  const allRelated = [key, ...synonyms];
  allRelated.forEach(term => {
    synonymLookup.set(term, allRelated);
  });
}

export function expandSymptoms(symptoms: string[]): string[] {
  const expanded = new Set<string>();
  
  for (const symptom of symptoms) {
    expanded.add(symptom);
    const related = synonymLookup.get(symptom);
    if (related) {
      related.forEach(syn => expanded.add(syn));
    }
  }
  
  return Array.from(expanded);
}
