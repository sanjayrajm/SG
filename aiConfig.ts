
import { GoogleGenAI } from "@google/genai";

/**
 * SG NEURAL CORE: AI Configuration
 * Always use process.env.API_KEY directly for initialization as per guidelines.
 * The Vite build tool handles the injection/replacement of this environment variable.
 */
export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const SYSTEM_PROMPTS = {
  ROUTING: `You are the SG Call Taxi Neural Routing Engine. 
DIRECTIVE: Calculate the ROAD DRIVING DISTANCE (in KM) between two locations in Tamil Nadu, India.
Always prioritize actual road paths over straight-line distances.

RESPONSE FORMAT:
{
  "distanceKm": float,
  "durationMin": number,
  "routeDescription": "string"
}

If you cannot find exact data, provide your best professional estimate based on geographical knowledge.`
};
