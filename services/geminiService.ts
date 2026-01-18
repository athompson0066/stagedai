
import { GoogleGenAI, Type } from "@google/genai";
import { PropertyGoal, BuyerPersona, StagingStyle, PropertyType, StyleRecommendation } from "../types";

// Note: process.env.API_KEY is pre-configured in this environment.
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // Attempt 1: Direct fetch
    return await tryFetch(url);
  } catch (directError) {
    console.warn("Direct fetch failed (likely CORS). Attempting proxy fallback...", directError);
    try {
      // Attempt 2: CORS Proxy fallback
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      return await tryFetch(proxyUrl);
    } catch (proxyError) {
      console.error("Proxy fetch also failed:", proxyError);
      throw new Error("Could not retrieve image from this URL. The source site might be blocking external access.");
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
    
    Return a JSON array of objects with 'style' (must be one of: ${Object.values(StagingStyle).join(', ')}) and 'rationale' (a brief explanation of why this style fits this specific persona and goal).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
      { style: StagingStyle.SCANDINAVIAN, rationale: "Maximizes light and space, perfect for modern buyers." }
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
  platforms?: string[]
): Promise<string> => {
  const ai = getAIClient();
  
  const prompt = `
    ACT AS A VIRTUAL REAL ESTATE STAGING CREW:
    1. Room Analysis Agent: Analyze the space, lighting, and architecture.
    2. Buyer Persona Strategist: Tailor the furniture and decor for a ${persona}.
    3. Style Expert: Apply a ${style} aesthetic.
    4. Strategy Agent: Target ${goal}.
    5. Quality Control Agent: Ensure photorealism.

    CONTEXT:
    - Property Type: ${propertyType}
    - Market Level: ${position || 'Mid-range'}
    - Desired Tone: ${tone || 'Warm & Inviting'}
    - Target Usage: ${platforms?.join(', ') || 'General Listing'}
    ${notes ? `- User Notes: ${notes}` : ""}

    INSTRUCTIONS:
    - Virtually stage the attached empty room with high-quality, photorealistic furniture.
    - Match the ${style} style perfectly.
    - Ensure lighting, reflections, and shadows are 100% consistent with the original room.
    - DO NOT change walls, floors, or windows unless they are clearly unfinished.
    - DO NOT add people or pets.
    - Output only the updated photorealistic staged image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: 'image/jpeg',
            },
          },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data returned from AI");
  } catch (error) {
    console.error("Gemini staging error:", error);
    throw error;
  }
};

export const getSalesCrewResponse = async (userMessage: string, chatHistory: any[]): Promise<string> => {
  const ai = getAIClient();
  const systemInstruction = `
    You are the "StagedAI Sales Crew", a collaborative team of 3 elite real estate sales agents.
    
    AGENTS INVOLVED:
    1. Alex (Sales Strategist): Focused on ROI, market trends, and how staging increases sale price.
    2. Sarah (Customer Success): Friendly, focused on technical ease of use and property types.
    3. Marcus (Closer): Dynamic, focused on getting the user to start their first project now.

    YOUR MISSION:
    - Respond to the user's inquiry as a short dialogue between these 3 agents.
    - Be persuasive but helpful.
    - If the user asks about price, mention the $29 Starter tier.
    - Always end with Marcus encouraging them to click "Launch Studio".
    
    FORMAT:
    Alex: [Strategic point]
    Sarah: [Helpful/Supportive point]
    Marcus: [Closing point/Call to Action]
    
    Keep the total response under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });
    return response.text || "Alex: We're ready to help. Sarah: Just let us know your goals. Marcus: Let's get started now!";
  } catch (error) {
    console.error("Sales Crew Error:", error);
    return "Marcus: We're experiencing heavy volume, but the short answer is: Staging works. Ready to launch your first room?";
  }
};
