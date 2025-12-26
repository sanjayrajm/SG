
import { getAI, SYSTEM_PROMPTS } from "../aiConfig";

export interface RouteIntel {
  isError: boolean;
  distanceKm: number;
  durationMin: number;
  routeDescription: string;
  sources: Array<{ title?: string; uri?: string }>;
}

export const getTacticalRouteIntel = async (
  pickup: string, 
  drop: string, 
  userLocation?: { lat: number; lng: number }
): Promise<RouteIntel> => {
  const ai = getAI();
  try {
    // Maps grounding is strictly supported only on Gemini 2.5 series.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `MISSION: Analyze driving route from "${pickup}" to "${drop}" in Tamil Nadu. 
      CONTEXT: Provide real-time road distance (KM), estimated duration (MIN), and a brief tactical route description.
      ${userLocation ? `GEOLOCATION_BIAS: User is currently at ${userLocation.lat}, ${userLocation.lng}` : ''}`,
      config: {
        systemInstruction: SYSTEM_PROMPTS.ROUTING,
        tools: [
          { googleSearch: {} },
          { googleMaps: {} }
        ],
        toolConfig: userLocation ? {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng
            }
          }
        } : undefined
      }
    });

    const textOutput = response.text;
    if (!textOutput) throw new Error("Empty neural response received");
    
    const cleanJson = (raw: string) => {
      let cleaned = raw.trim();
      if (cleaned.includes('{')) {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}') + 1;
        cleaned = cleaned.substring(start, end);
      }
      return cleaned;
    };

    let parsedData = { distanceKm: 10, durationMin: 25, routeDescription: "Optimized Neural Path" };
    try {
      parsedData = JSON.parse(cleanJson(textOutput));
    } catch (e) {
      console.warn("JSON Parse failed, falling back to regex extraction", e);
      const distMatch = textOutput.match(/(\d+(\.\d+)?)\s*KM/i);
      const durMatch = textOutput.match(/(\d+)\s*MIN/i);
      if (distMatch) parsedData.distanceKm = parseFloat(distMatch[1]);
      if (durMatch) parsedData.durationMin = parseInt(durMatch[1]);
    }
    
    const sources: Array<{ title?: string; uri?: string }> = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach(chunk => {
        if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        if (chunk.maps) sources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
      });
    }

    return {
      isError: false,
      distanceKm: parsedData.distanceKm || 10,
      durationMin: parsedData.durationMin || 25,
      routeDescription: parsedData.routeDescription || "Path calculated via Neural Grounding",
      sources: sources
    };
  } catch (error) {
    console.error("Neural Link Failed:", error);
    return { 
      isError: true, 
      distanceKm: 0, 
      durationMin: 0, 
      routeDescription: "Safe Fallback Path Engaged",
      sources: []
    };
  }
};
