export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

// Type used for internal app state (decoded audio)
export interface AnalysisResult {
  landmarkName: string;
  description: string;
  groundingSource: GroundingChunk[];
  audioBuffer?: AudioBuffer;
}

// Type used for API response (encoded audio)
export interface AnalysisResponse {
  landmarkName: string;
  description: string;
  groundingSource: GroundingChunk[];
  audioBase64: string;
}

export enum AppState {
  IDLE = "IDLE",
  ANALYZING = "ANALYZING", // Image recognition
  SEARCHING = "SEARCHING", // Grounding search
  SYNTHESIZING = "SYNTHESIZING", // TTS
  RESULT = "RESULT",
  ERROR = "ERROR",
}

// Interface for Window with WebKit AudioContext support
export interface ExtendedWindow extends Window {
  webkitAudioContext: typeof AudioContext;
}

export type LanguageCode = "id" | "en" | "ar" | "es" | "fr" | "ru" | "it" | "nl" | "ja";

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string; promptName: string }[] = [
  { code: "id", label: "Indonesian 🇮🇩", promptName: "Indonesian" },
  { code: "en", label: "English 🇺🇸", promptName: "English" },
  { code: "ar", label: "Arabic 🇸🇦", promptName: "Arabic" },
  { code: "es", label: "Spanish 🇪🇸", promptName: "Spanish" },
  { code: "fr", label: "French 🇫🇷", promptName: "French" },
  { code: "ru", label: "Russian 🇷🇺", promptName: "Russian" },
  { code: "it", label: "Italian 🇮🇹", promptName: "Italian" },
  { code: "nl", label: "Dutch 🇳🇱", promptName: "Dutch" },
  { code: "ja", label: "Japanese 🇯🇵", promptName: "Japanese" },
];