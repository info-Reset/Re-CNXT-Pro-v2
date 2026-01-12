
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLead = async (clientName: string, notes: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this CRM lead and provide a summary including potential project ideas, lead quality (1-10), and a suggested next step.
      
      Client Name: ${clientName}
      Notes: ${notes}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            leadQuality: { type: Type.NUMBER },
            suggestedProjects: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            nextAction: { type: Type.STRING }
          },
          required: ["summary", "leadQuality", "suggestedProjects", "nextAction"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

export const draftEmail = async (clientName: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a professional and persuasive email for a digital marketing/website building agency client.
      
      Client: ${clientName}
      Purpose: ${context}
      Tone: Professional but friendly and helpful.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Draft Error:", error);
    return "Error generating draft. Please try again.";
  }
};

/**
 * Uses Google Maps grounding to find local business leads
 */
export const searchProspects = async (query: string, lat?: number, lng?: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find high-potential business prospects for a digital marketing agency based on this search: "${query}". 
      List at least 5 businesses with their names, approximate address/location, and website if possible.`,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
          }
        }
      },
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Prospecting Error:", error);
    return null;
  }
};

/**
 * Generates a website mockup concept using Gemini Image Gen
 */
export const generateMockup = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A high-end, professional website hero section design for: ${prompt}. Modern UI, clean layout, 4k resolution, UI/UX design showcase.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
