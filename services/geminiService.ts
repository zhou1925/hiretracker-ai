import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

// Always initialize with the direct process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIAnalysis = async (jobRole: string, company: string, descriptionOrNotes: string, masterResume?: string): Promise<AIAnalysis> => {
  const contents = [
    `Analyze this job application for ${jobRole} at ${company}. Notes/Details: ${descriptionOrNotes}`,
  ];

  if (masterResume) {
    contents.push(`Compare this job against the following Master Resume and calculate a Match Score (0-100) and identify missing keywords: ${masterResume}`);
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents.join("\n\n"),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          interviewTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          followUpDraft: { type: Type.STRING },
          matchScore: { type: Type.NUMBER, description: "Percentage match between resume and job." },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific skills or terms found in job but missing from resume." }
        },
        required: ["summary", "interviewTips", "followUpDraft"]
      }
    }
  });

  try {
    // Access the text property directly on the response object
    return JSON.parse(response.text || '{}') as AIAnalysis;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("AI analysis failed.");
  }
};

export const getCompanyResearch = async (company: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find recent news, company culture insights, and the core mission of ${company}. Provide a structured report.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    // Extract search grounding metadata to list source URLs in the UI
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};