# Viva Guide

This guide prepares you for your final academic defense. 

## Key Explanations

### Architecture Explanation
The application uses a 3-tier architecture. 
1. **Frontend**: React handles real-time medical chat UI.
2. **Backend**: Express routes requests, protects the API key, and executes the **Medical Intelligence Layer**.
3. **Data/AI Provider**: Local Medical Knowledge Base JSON and Google Gemini.

### AI Workflow Explanation
We don't simply forward text to Gemini. The Backend intercepts the text:
1. Normalizes words (Urdu -> English equivalents)
2. Extracts clinical symptoms using heuristic matching
3. Scans for emergencies
4. Queries a local knowledge base to ground the AI
5. Formats a strict "Doctor Framework" context prompt.
6. The enriched prompt forces Gemini to follow structured output logic.

### Why Google Gemini Was Used
Gemini provides exceptional multi-lingual reasoning (perfect for English/Urdu), strict adherence to large system instructions (Doctor Context), and fast streaming inference.

## Common Viva Questions (Sample of 30)
1. **What is the primary objective of this chatbot?** -> To provide fast, reliable, basic health guidance using NLP without replacing professional doctors.
2. **What architecture does the project use?** -> Three-tier client-server architecture with an intelligent RAG (Retrieval-Augmented Generation) pipeline.
3. **How do you handle medical emergencies?** -> Pipelined `emergencyDetector.ts` scans for words like "chest pain" and immediately flags the AI and GUI.
4. **Is user data saved?** -> Currently, analytics are tracked anonymously in memory, but no persistent PII is stored.
5. **How did you achieve multilingual support?** -> `languageDetector.ts` and `medicalNormalizer.ts` detect Urdu (romanized) and translate it into base English symptoms before retrieval.
6. **What is Semantic Matching in your project?** -> Grouping synonyms (like "stomachache" and "abdominal pain") so exact keyword matches aren't required.
7. **Explain the Risk Assessment logic.** -> It combines symptom count, condition severity, history trend, and emergency status to classify risk.
8. **What technologies did you use for the frontend?** -> React, TypeScript, TailwindCSS.
9. **What technologies did you use for the backend?** -> Node.js, Express, ESBuild, Gemini SDK.
**(And 21 more related to your project scope and medical safety protocols...)**

## Future Enhancements
- Fine-tuning a private, HIPAA-compliant LLM.
- Persistent database for longitudinal patient profiles.
- Image recognition for skin rashes.
