
import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeAudioWithAI(description: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a world-class audio engineer. A user has uploaded audio described as: "${description}". 
      Provide a brief (2-sentence) professional analysis of what "Studio Enhancement" should focus on for this type of file.
      Format: JSON with fields: noiseProfile (string), suggestion (string), technicalFix (string).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            noiseProfile: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            technicalFix: { type: Type.STRING }
          },
          required: ["noiseProfile", "suggestion", "technicalFix"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      noiseProfile: "Unknown background interference",
      suggestion: "Standard studio cleanup recommended",
      technicalFix: "Multi-band compression and 80Hz HPF"
    };
  }
}
