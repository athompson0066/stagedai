import { GoogleGenAI, Type } from "@google/genai";
import { PropertyGoal, BuyerPersona, StagingStyle, PropertyType, StyleRecommendation } from "../types.ts";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing from process.env. Staging will likely fail.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

/**
 * Robust image fetching with CORS proxy fallback
 */
export const fetchImageFromUrl = async (url: string): Promise<string> => {
  const tryFetch = async (targetUrl: string): Promise<string> => {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  try {
    return await tryFetch(url);
  } catch (directError) {
    console.warn("Direct fetch failed. Attempting proxy fallback...", directError);
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      return await tryFetch(proxyUrl);
    } catch (proxyError) {
      console.error("Proxy fetch failed:", proxyError);
      throw new Error("Could not retrieve image from this URL.");
    }
  }
};

export const getStyleRecommendations = async (
  goal: PropertyGoal,
  propertyType: PropertyType,
  persona: BuyerPersona
): Promise<StyleRecommendation[]> => {
  const ai = getAIClient();
  const prompt = `
    As a real estate marketing expert, suggest exactly 2 interior design staging styles for the following:
    - Property Goal: ${goal}
    - Property Type: ${propertyType}
    - Target Buyer Persona: ${persona}
    
    Return a JSON array of objects with 'style' (must be one of: ${Object.values(StagingStyle).join(', ')}) and 'rationale'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              style: { type: Type.STRING },
              rationale: { type: Type.STRING },
            },
            required: ['style', 'rationale']
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Style recommendation error:", error);
    return [
      { style: StagingStyle.MODERN, rationale: "Universally appealing and clean for listings." },
      { style: StagingStyle.SCANDINAVIAN, rationale: "Maximizes light and space." }
    ];
  }
};

export const stageRoom = async (
  base64Image: string,
  goal: PropertyGoal,
  propertyType: PropertyType,
  persona: BuyerPersona,
  style: StagingStyle,
  notes?: string,
  position?: string,
  tone?: string,
  platforms?: string[],
  isDeepCleanRequired?: boolean
): Promise<string> => {
  const ai = getAIClient();
  
  // Extract real MIME type from base64 string
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-z]+);base64,/);
  const detectedMimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
  const rawData = base64Image.split(',')[1] || base64Image;

  const prompt = `
    ACT AS A VIRTUAL REAL ESTATE STAGING CREW:
    1. Deep Clean Specialist: ${isDeepCleanRequired ? 'URGENT: Remove all trash, debris, and existing clutter. Make the room SPOTLESS.' : 'Standard cleaning.'}
    2. Room Analysis Agent: Analyze the space and lighting.
    3. Buyer Persona Strategist: Tailor for a ${persona}.
    4. Style Expert: Apply a ${style} aesthetic.
    5. Strategy Agent: Target ${goal}.

    USER REQUESTS:
    ${notes || "Follow standard staging protocols."}

    INSTRUCTIONS:
    Virtually stage the attached room with photorealistic furniture matching the ${style} style. Ensure consistent lighting. Output only the updated photorealistic staged image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: rawData,
              mimeType: detectedMimeType,
            },
          },
          { text: prompt },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      console.error("Gemini Response candidate missing content:", response);
      throw new Error("Invalid response from AI model.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data returned from AI. The prompt may have been blocked or the image was too complex.");
  } catch (error: any) {
    console.error("Gemini staging service error details:", error);
    throw new Error(error.message || "Failed to stage room.");
  }
};

export const getSalesCrewResponse = async (userMessage: string, chatHistory: any[]): Promise<string> => {
  const ai = getAIClient();
  const systemInstruction = `
    You are the "StagedAI Sales Crew". Respond as a dialogue between Alex, Sarah, and Marcus. 
    Alex (Strategy), Sarah (Support), Marcus (Closer). Keep it under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
      config: { systemInstruction, temperature: 0.8 }
    });
    return response.text || "Marcus: Let's get started now!";
  } catch (error) {
    console.error("Sales Crew Error:", error);
    return "Marcus: We're ready when you are. Launch the studio to see for yourself!";
  }
};