
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ModelTraits } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to retry API calls specifically on 429 (Rate Limit) errors.
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const isRateLimit = 
      errorMsg.includes('429') || 
      error?.status === 429 || 
      errorMsg.toLowerCase().includes('too many requests') ||
      errorMsg.includes('Resource has been exhausted');
    
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit (429). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const fileToPart = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    return { mimeType: mimeMatch[1], data: arr[1] };
}

const dataUrlToPart = (dataUrl: string) => {
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
}

const handleApiResponse = (response: GenerateContentResponse): string => {
    for (const candidate of response.candidates ?? []) {
        for (const part of candidate.content?.parts ?? []) {
            if (part.inlineData) {
                const { mimeType, data } = part.inlineData;
                return `data:${mimeType};base64,${data}`;
            }
        }
    }
    const textFeedback = response.text;
    throw new Error(textFeedback || "The AI model did not return an image.");
};

export const generateModelImage = async (userImage: File): Promise<string> => {
    const userImagePart = await fileToPart(userImage);
    const prompt = "High-end fashion photography. Professional model pose. Neutral studio background. Clean, photorealistic output.";
    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [userImagePart, { text: prompt }] }
        });
        return handleApiResponse(response);
    });
};

export const customizeModelImage = async (baseImageUrl: string, traits: ModelTraits): Promise<string> => {
    const baseImagePart = dataUrlToPart(baseImageUrl);
    const prompt = `Adjust the model in the image to have the following characteristics: Skin Tone: ${traits.skinTone}, Hair Color: ${traits.hairColor}, Body Type: ${traits.bodyType}. Maintain original facial structure and pose exactly. Photorealistic fashion studio style.`;
    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [baseImagePart, { text: prompt }] }
        });
        return handleApiResponse(response);
    });
};

export const generateVirtualTryOnImage = async (modelImageUrl: string, garmentImage: File): Promise<string> => {
    const modelImagePart = dataUrlToPart(modelImageUrl);
    const garmentImagePart = await fileToPart(garmentImage);
    const prompt = "Photorealistic virtual try-on. Completely replace current clothing with the provided garment. Maintain model's skin, hair, and pose perfectly. High fashion look.";
    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [modelImagePart, garmentImagePart, { text: prompt }] }
        });
        return handleApiResponse(response);
    });
};

export const editImageWithPrompt = async (baseImageUrl: string, editPrompt: string): Promise<string> => {
    const baseImagePart = dataUrlToPart(baseImageUrl);
    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [baseImagePart, { text: editPrompt }] }
        });
        return handleApiResponse(response);
    });
};

export const generateImageWithPro = async (prompt: string, size: "1K" | "2K" | "4K", aspectRatio: string): Promise<string> => {
    return withRetry(async () => {
        const aiPro = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await aiPro.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    imageSize: size,
                    aspectRatio: aspectRatio as any
                }
            }
        });
        return handleApiResponse(response);
    });
};

export const chatWithGemini = async (message: string, isFastMode: boolean) => {
    const model = isFastMode ? 'gemini-2.5-flash-lite-latest' : 'gemini-3-pro-preview';
    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [{ text: message }] },
        });
        return response.text;
    });
};

export const upscaleImage = async (baseImageUrl: string): Promise<string> => {
    return withRetry(async () => {
        const aiPro = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePart = dataUrlToPart(baseImageUrl);
        const response = await aiPro.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [imagePart, { text: "High fidelity 4K upscale. Maintain every detail." }] },
            config: { imageConfig: { imageSize: "4K", aspectRatio: "1:1" } }
        });
        return handleApiResponse(response);
    });
};
