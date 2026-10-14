const urduToEnglishMap: Record<string, string> = {
  'bukhar': 'fever',
  'sar dard': 'headache',
  'khansi': 'cough',
  'zukam': 'common cold',
  'pet dard': 'stomach pain',
  'saans lene mein takleef': 'breathing difficulty',
  'dard': 'pain',
  'thakan': 'fatigue',
  'ulti': 'vomit',
  'matli': 'nausea',
  'chakkar': 'dizzy',
  'kharish': 'itch'
};

export function normalizeMedicalTerms(text: string): string {
  let normalized = text.toLowerCase();
  for (const [urdu, english] of Object.entries(urduToEnglishMap)) {
    const regex = new RegExp(urdu, 'gi');
    normalized = normalized.replace(regex, english);
  }
  return normalized;
}
