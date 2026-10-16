import { NextResponse } from "next/server";
import {
  analyzeImageFull,
  generateTourAudio,
} from "@/services/geminiService";
import { LanguageCode } from "@/types/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, mimeType, language } = body;
    const selectedLang: LanguageCode = language || "en";

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Image data missing" },
        { status: 400 },
      );
    }

    // Lakukan Analisis Visual + Pencarian Fakta + Penulisan Skrip dalam 1 Panggilan
    // Ini menghemat 2 token request Gemini 2.5 Flash
    const analysis = await analyzeImageFull(image, mimeType, selectedLang);

    if (analysis.landmarkName === "Unknown") {
      return NextResponse.json(
        {
          error: "We couldn't identify a landmark in this photo. Please try a clearer shot.",
        },
        { status: 422 },
      );
    }

    // Step Terakhir: TTS (Hanya ini panggilan kedua)
    const audioBase64 = await generateTourAudio(analysis.description);

    return NextResponse.json({
      landmarkName: analysis.landmarkName,
      description: analysis.description,
      groundingSource: analysis.chunks,
      audioBase64,
    });

  } catch (error: unknown) {
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Handle 429 Quota Error secara spesifik
    if (errorMessage.includes("429") || errorMessage.includes("Quota")) {
      errorMessage = "Free tier quota exceeded. Please wait a moment before trying again.";
    } 
    else if (errorMessage.includes("Safety")) {
       errorMessage = "Safety filter triggered. Try a different photo.";
    }

    console.error("API Error:", errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}