# Project Overview

## Purpose
The AI Powered Chatbot for Health Care Assistance is designed to provide quick, accessible, and reliable basic health guidance. It serves as an intelligent virtual assistant that uses AI and Natural Language Processing to understand user queries, analyze symptoms, and provide general health information.

## Features
- **Symptom Analysis Engine**: Extracts and processes medical symptoms from user natural language input.
- **Medical Knowledge Retrieval**: Semantic matching against a custom medical knowledge base.
- **Health Trend Analyzer**: Detects worsening, improving, or stable health conditions over conversation turns.
- **Emergency Detection**: Automatically detects critical keywords requiring immediate professional help.
- **Risk Assessment**: Classifies patient health risks as Low, Moderate, High, or Critical.
- **Conversation Memory**: Maintains context of the user's ongoing health situation.
- **Bilingual Support**: Automatically detects and responds in English and Urdu.
- **Safety Guardrails**: Implements non-prescriptive, informative-only AI guardrails.

## Architecture
The system employs a client-server architecture:
- **Presentation Layer**: React and TailwindCSS for a responsive conversational UI.
- **Application Layer**: Node.js/Express integrating with the Gemini API and custom Medical Intelligence modules.
- **Data/Knowledge Layer**: Static Medical Knowledge Base and Conversation Memory states.

## Technologies Used
- **Frontend**: React (TypeScript), TailwindCSS, React Router, Vite, Lucide Icons
- **Backend**: Express.js, Node.js
- **AI Core**: Google Gemini API (`gemini-3.1-pro-preview`)
- **Deployment**: Node Environment compatible (Vercel, Railway, Render)

## Medical Intelligence Flow
1. **User Input** -> **Language Detection** & **Normalization**
2. **Symptom Extraction** -> **Health Trend Analysis**
3. **Emergency Detection** -> **Risk Assessment**
4. **Knowledge Retrieval** -> **Semantic Matching**
5. **Doctor Response Formatting** -> **Gemini AI Generation** -> **User Output**
