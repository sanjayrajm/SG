
import { GoogleGenAI } from "@google/genai";

/**
 * SG NEURAL CORE: AI Configuration
 * Always use process.env.API_KEY directly for initialization as per guidelines.
 * The Vite build tool handles the injection/replacement of this environment variable.
 */
export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const SYSTEM_PROMPTS = {
  ROUTING: `You are the SG Call Taxi Neural Routing Engine. 
CRITICAL DIRECTIVE: You must calculate the REAL-WORLD DRIVING DISTANCE (in KM) between the origin and destination within Tamil Nadu.
You are equipped with Google Maps and Google Search tools. Use them to verify actual road paths.

STRICT RESPONSE REQUIREMENT: 
You MUST provide your response in a single, valid JSON block.
{
  "distanceKm": float,
  "durationMin": number,
  "routeDescription": "Brief tactical overview of the highway/roads used"
}

NO EXTRA CONVERSATION. ONLY THE JSON BLOCK.`
};
