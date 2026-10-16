import { GenerateContentResponse, GoogleGenAI, Part } from "@google/genai";
import { GroundingChunk, LanguageCode, SUPPORTED_LANGUAGES } from "@/types/types";
import env from "@/config/env";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

// --- UTILITIES ---

const sanitizeForTTS = (text: string): string => {
  return text.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
};

const extractAudio = (response: GenerateContentResponse) => {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  const audioPart = parts.find(
    (p: Part) =>
      typeof p?.inlineData?.mimeType === "string" &&
      p.inlineData.mimeType.includes("audio"),
  );
  if (!audioPart || !audioPart.inlineData?.data) {
    return null; 
  }
  return audioPart.inlineData.data;
};

const cleanJsonString = (text: string): string => {
  let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstOpen = clean.indexOf("{");
  const lastClose = clean.lastIndexOf("}");
  if (firstOpen !== -1 && lastClose !== -1) {
    clean = clean.substring(firstOpen, lastClose + 1);
  }
  return clean;
};

// --- CORE FUNCTION: TRIPLE FALLBACK STRATEGY ---

export const analyzeImageFull = async (
  base64Image: string,
  mimeType: string,
  languageCode: LanguageCode
): Promise<{ landmarkName: string; description: string; chunks: GroundingChunk[] }> => {
  
  const targetLanguage = SUPPORTED_LANGUAGES.find(l => l.code === languageCode)?.promptName || "English";
  
  const promptText = `
    You are an expert tour guide. Perform these steps strictly:
    1. Identify the landmark in the image. If it is NOT a landmark, set name to "Unknown".
    2. If identified, use Google Search to find verified historical/cultural facts.
    3. Based on the facts, write a short audio tour script (80-100 words) in ${targetLanguage}.
    
    IMPORTANT: Output ONLY a raw JSON string. Do not use Markdown blocks.
    Structure:
    {
      "landmarkName": "Name or Unknown",
      "isLandmark": true/false,
      "tourScript": "The script text here..."
    }
  `;

  const requestConfig = {
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: promptText },
      ],
    },
    config: {
      tools: [{ googleSearch: {} }], // Grounding aktif
    },
  };

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash"
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        ...requestConfig
      });
      
      return parseResponse(response);

    } catch (error: unknown) { // REVISI: Menggunakan unknown atau menghapus tipe eksplisit
      // Helper untuk mendapatkan pesan error yang aman
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.warn(`Model ${modelName} failed:`, errorMessage);
      
      const shouldRetry = 
        errorMessage.includes("400") || 
        errorMessage.includes("429") || 
        errorMessage.includes("quota") || 
        errorMessage.includes("503");
      
      if (!shouldRetry) break; 
    }
  }

  throw new Error("All AI models are busy or failed. Please try again later.");
};

const parseResponse = (
  response: GenerateContentResponse
): { landmarkName: string; description: string; chunks: GroundingChunk[] } => {

  let text = "{}";

  // Ambil dari parts[].text (multimodal + tools)
  const parts = response.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const textPart = parts.find(p => typeof p.text === "string");
    if (textPart?.text) {
      text = textPart.text;
    }
  }

  // Fallback ke response.text() (SDK lama / non-multimodal)
  if (text === "{}") {
    const maybeText = (response as unknown as { text?: () => string }).text;
    if (typeof maybeText === "function") {
      text = maybeText();
    }
  }

  const cleanedText = cleanJsonString(text);

  let jsonResult;
  try {
    jsonResult = JSON.parse(cleanedText);
  } catch {
    console.error("JSON Parse Error:", text);
    return { landmarkName: "Unknown", description: "", chunks: [] };
  }

  const chunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

  if (!jsonResult.isLandmark || jsonResult.landmarkName === "Unknown") {
    return { landmarkName: "Unknown", description: "", chunks: [] };
  }

  return {
    landmarkName: jsonResult.landmarkName,
    description: jsonResult.tourScript,
    chunks: chunks
  };
};

// --- TTS FUNCTION ---
export const generateTourAudio = async (script: string): Promise<string> => {
  const cleanScript = sanitizeForTTS(script);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts", 
      contents: [{ parts: [{ text: cleanScript }] }],
      config: {
        responseModalities: ["AUDIO"], 
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const audioData = extractAudio(response);
    return audioData || "";

  } catch (error) {
    // REVISI: Menghapus error log object mentah jika strict, atau cast string
    const errMessage = error instanceof Error ? error.message : "Unknown TTS Error";
    console.error("TTS Error (Quota/Network):", errMessage);
    return "";
  }
};