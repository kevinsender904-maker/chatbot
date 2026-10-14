/**
 * Emergency & Serious Symptom Detection Service
 * Identifies high-acuity medical emergencies and triggers immediate guidance
 * with explicit warnings to seek professional emergency medical assistance.
 */

export interface EmergencyActionItem {
  title: string;
  description: string;
}

export interface EmergencyHotline {
  name: string;
  number: string;
  description: string;
  type: "call" | "sms";
}

export interface EmergencyDetails {
  isEmergency: boolean;
  detectedKeywords: string[];
  severity: "critical" | "high";
  warningTitle: string;
  professionalHelpWarning: string;
  emergencyActions: string[];
  hotlines: EmergencyHotline[];
}

export const EMERGENCY_KEYWORDS: string[] = [
  // Cardiac / Thoracic
  "chest pain",
  "chest pressure",
  "tightness in chest",
  "heart attack",
  "crushing chest",
  "radiating arm pain",
  // Respiratory
  "breathing difficulty",
  "difficulty breathing",
  "shortness of breath",
  "cannot breathe",
  "can't breathe",
  "choking",
  "gasping for air",
  "severe asthma",
  "blue lips",
  // Neurological / Stroke
  "stroke",
  "face drooping",
  "facial drooping",
  "arm weakness",
  "slurred speech",
  "sudden numbness",
  "sudden paralysis",
  "thunderclap headache",
  "worst headache of my life",
  // Consciousness & Seizure
  "unconscious",
  "passed out",
  "blacked out",
  "loss of consciousness",
  "unresponsive",
  "fainted and not waking",
  "seizure",
  "convulsions",
  // Bleeding & Trauma
  "severe bleeding",
  "uncontrolled bleeding",
  "coughing blood",
  "vomiting blood",
  "internal bleeding",
  // Allergic / Anaphylaxis
  "anaphylaxis",
  "throat swelling",
  "throat closing",
  "severe allergic reaction",
  // Psychiatric crisis
  "suicidal",
  "suicidal thoughts",
  "want to end my life",
  "kill myself",
  "self harm",
  "overdose",
  "poisoning"
];

export function detectEmergency(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

export function analyzeEmergency(text: string): EmergencyDetails | null {
  if (!text) return null;
  const lowerText = text.toLowerCase();
  const detected = EMERGENCY_KEYWORDS.filter((keyword) => lowerText.includes(keyword));

  if (detected.length === 0) return null;

  const isPsychCrisis = detected.some((k) =>
    ["suicidal", "suicidal thoughts", "want to end my life", "kill myself", "self harm"].includes(k)
  );

  const hotlines: EmergencyHotline[] = [
    {
      name: "Emergency Services",
      number: "911",
      description: "For immediate life-threatening physical emergencies and ambulance dispatch.",
      type: "call",
    },
  ];

  if (isPsychCrisis) {
    hotlines.unshift({
      name: "Suicide & Crisis Lifeline",
      number: "988",
      description: "Free, confidential 24/7 support for people in suicidal crisis or mental health distress.",
      type: "call",
    });
  }

  return {
    isEmergency: true,
    detectedKeywords: detected,
    severity: isPsychCrisis ? "critical" : "critical",
    warningTitle: "Immediate Medical Emergency Guidance",
    professionalHelpWarning:
      "WARNING: Serious medical symptoms detected. Do NOT rely on an AI consultation for emergencies. Seek immediate professional medical help or call emergency services immediately.",
    emergencyActions: [
      "Dial 911 (or your local emergency services) immediately.",
      "If you are alone, unlock your front door so emergency responders can enter.",
      "Do NOT attempt to drive yourself to the emergency department if you feel dizzy or faint; wait for paramedics.",
      "Stay calm and sit or lie in a comfortable, safe position.",
    ],
    hotlines,
  };
}
