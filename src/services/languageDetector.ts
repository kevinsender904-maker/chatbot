export function detectLanguage(text: string): string {
  const urduKeywords = ['mera', 'mujhe', 'bukhar', 'dard', 'hai', 'kia', 'karun', 'dawakhana', 'sar', 'khansi', 'zukam', 'pet', 'saans', 'takleef', 'se'];
  const lowerText = text.toLowerCase();
  
  let urduMatchCount = 0;
  for (const keyword of urduKeywords) {
    if (lowerText.includes(keyword)) {
      urduMatchCount++;
    }
  }
  
  if (urduMatchCount >= 2) {
    return 'Urdu';
  }
  
  return 'English';
}

export function getPreferredLanguage(text: string): string {
  return detectLanguage(text);
}
