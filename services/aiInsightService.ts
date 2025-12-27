
import { getAI } from "../aiConfig";

/**
 * SG NEURAL CORE: Tactical Insight Service
 * Fetches AI-generated intelligence about specific mission nodes (locations/temples).
 */
export const getTempleInsight = async (templeName: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Provide 3 tactical travel tips for visiting ${templeName} in Kanchipuram. 
  Focus on: Best time to visit to avoid crowds, dress code strictness, and nearby parking ease. 
  Keep it brief and professional. Mention if it's a Paadal Petra Sivalayam or Divyadesam.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    if (!response || !response.text) {
      throw new Error("Neural Core: Empty response from insight engine.");
    }

    return response.text;
  } catch (error) {
    console.error("SG Neural Insight Error:", error);
    // Graceful fallback for UI continuity
    return "Mission Intel: Location coordinates synchronized. Proceed with standard pilgrimage protocols. Contact local dispatch for real-time crowd updates.";
  }
};
