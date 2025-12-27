
import { getAI } from "../aiConfig";

/**
 * SG NEURAL IMAGERY: Vehicle Visual Synthesis
 * Generates professional, tactical-themed images for the fleet.
 */
export const generateVehicleImage = async (vehicleType: string, models: string[]) => {
  const ai = getAI();
  const modelName = models[0] || vehicleType;
  
  // Tactical prompt engineering for consistent branding
  const prompt = `A professional, high-end studio photograph of a clean, modern white ${modelName} taxi car. 
  The car should be the central focus on a dark, futuristic paved road with subtle neon yellow ambient lighting. 
  Cinematic lighting, 8k resolution, photorealistic, sleek automotive photography style. 
  No people, no clutter, minimalistic tactical aesthetic.`;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
      },
    });

    if (response && response.generatedImages && response.generatedImages.length > 0) {
      const firstImage = response.generatedImages[0];
      if (firstImage && firstImage.image && firstImage.image.imageBytes) {
        return `data:image/png;base64,${firstImage.image.imageBytes}`;
      }
    }
    throw new Error("No image data returned from Imagen");
  } catch (error) {
    console.error("SG Neural Imagery: Synthesis failed", error);
    return null;
  }
};
