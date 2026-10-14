export interface MedicalCondition {
  conditionName: string;
  symptoms: string[];
  description: string;
  homeCare: string;
  prevention: string;
  warningSigns: string;
}

export const knowledgeBase: MedicalCondition[] = [
  {
    conditionName: "Fever",
    symptoms: ["fever", "chills", "sweat", "fatigue"],
    description: "A temporary increase in your body temperature, often due to an illness.",
    homeCare: "Rest, drink plenty of fluids, and consider over-the-counter fever reducers if uncomfortable.",
    prevention: "Wash hands frequently and avoid close contact with sick individuals.",
    warningSigns: "Temperature over 103 F, severe headache, unusual skin rash, mental confusion."
  },
  {
    conditionName: "Flu",
    symptoms: ["fever", "chills", "muscle aches", "cough", "congestion", "runny nose", "headache", "fatigue", "pain"],
    description: "A common viral infection that can be deadly, especially in high-risk groups.",
    homeCare: "Rest, hydration, and over-the-counter medication.",
    prevention: "Annual flu vaccine, wash hands, avoid sick people.",
    warningSigns: "Difficulty breathing, persistent chest pain, seizures, severe weakness."
  },
  {
    conditionName: "Common Cold",
    symptoms: ["runny nose", "sore throat", "cough", "congestion", "mild headache", "sneezing", "sneeze"],
    description: "A viral infection of your nose and throat (upper respiratory tract).",
    homeCare: "Get plenty of rest, drink fluids, use saline drops.",
    prevention: "Wash your hands thoroughly and often, avoid sharing cups or utensils.",
    warningSigns: "High fever, severe sinus pain, significantly swollen glands."
  },
  {
    conditionName: "Headache",
    symptoms: ["headache", "head pain", "pressure"],
    description: "A continuous pain in the head.",
    homeCare: "Rest in a quiet, dark room. Apply a hot or cold compress to your head or neck.",
    prevention: "Manage stress, get enough sleep, stay hydrated.",
    warningSigns: "Sudden, severe headache, headache with fever, stiff neck, confusion."
  },
  {
    conditionName: "Migraine",
    symptoms: ["headache", "nausea", "vomiting", "vomit", "sensitivity to light", "vision", "dizzy", "pain"],
    description: "A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound.",
    homeCare: "Rest in a dark and quiet room. Use prescribed migraine medications.",
    prevention: "Avoid known triggers (certain foods, stress, lack of sleep).",
    warningSigns: "Thunderclap headache, neurological symptoms like weakness or vision loss."
  },
  {
    conditionName: "Stomach Pain",
    symptoms: ["stomach", "pain", "cramps", "nausea", "bloating"],
    description: "Pain spreading anywhere from the chest to the pelvic region.",
    homeCare: "Eat smaller meals, avoid spicy foods, drink clear fluids.",
    prevention: "Maintain a healthy diet, stay hydrated, manage stress.",
    warningSigns: "Severe pain that worsens, bloody stools, persistent vomiting."
  },
  {
    conditionName: "Diarrhea",
    symptoms: ["diarrhea", "loose stools", "cramps", "nausea"],
    description: "Loose, watery and possibly more frequent bowel movements.",
    homeCare: "Drink plenty of water and electrolyte solutions. Eat bland foods.",
    prevention: "Wash hands, ensure food safety, avoid tap water in high-risk areas.",
    warningSigns: "Symptoms lasting more than 2 days, dehydration, severe abdominal pain, bloody stools."
  },
  {
    conditionName: "Dehydration",
    symptoms: ["thirst", "dry mouth", "fatigue", "dizzy", "dark urine"],
    description: "Occurs when you use or lose more fluid than you take in, and your body doesn't have enough water.",
    homeCare: "Drink water and oral rehydration solutions.",
    prevention: "Drink plenty of fluids daily, especially in hot weather or when exercising.",
    warningSigns: "Extreme thirst, lack of urination, confusion, dizziness that doesn't resolve."
  },
  {
    conditionName: "Hypertension",
    symptoms: ["headache", "shortness of breath", "nosebleeds", "dizzy", "chest pain"],
    description: "High blood pressure is a common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems.",
    homeCare: "Reduce sodium intake, exercise regularly, manage stress.",
    prevention: "Maintain a healthy weight, eat a heart-healthy diet, limit alcohol.",
    warningSigns: "Severe headache, chest pain, vision changes."
  },
  {
    conditionName: "Diabetes",
    symptoms: ["hunger", "urination", "weight loss", "thirst", "fatigue", "vision"],
    description: "A disease that occurs when your blood glucose, also called blood sugar, is too high.",
    homeCare: "Monitor blood sugar levels, take prescribed medications.",
    prevention: "Eat healthy, exercise regularly, maintain a healthy weight.",
    warningSigns: "Very high or very low blood sugar levels, confusion, loss of consciousness."
  },
  {
    conditionName: "Skin Rash",
    symptoms: ["rash", "itch", "redness", "bumps"],
    description: "A noticeable change in the texture or color of your skin.",
    homeCare: "Avoid scratching, use mild soaps, apply soothing lotions like calamine.",
    prevention: "Avoid known allergens, moisturize skin.",
    warningSigns: "Rash covers the body, fever, sudden spread, signs of infection like pus."
  },
  {
    conditionName: "Allergy",
    symptoms: ["sneeze", "itch", "runny nose", "rash", "cough"],
    description: "An immune system reaction to a foreign substance that's not typically harmful to your body.",
    homeCare: "Avoid the allergen, use over-the-counter antihistamines.",
    prevention: "Identify and avoid triggers, keep indoor air clean.",
    warningSigns: "Difficulty breathing, swelling of the face/throat/tongue, anaphylaxis."
  }
];
