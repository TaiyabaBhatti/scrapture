import { GoogleGenAI } from '@google/genai';
import { buildEditPrompt } from '../prompts.js';
import { parseIdea } from './shared.js';

let client;
const ai = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing on the server');
  return (client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));
};

const TEXT_MODEL = () => process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
const IMAGE_MODEL = () => process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

const imagePart = (buffer, mimeType) => ({
  inlineData: { mimeType, data: buffer.toString('base64') },
});

export async function makeIdea({ buffer, mimeType, prompt }) {
  const res = await ai().models.generateContent({
    model: TEXT_MODEL(),
    contents: [{ role: 'user', parts: [imagePart(buffer, mimeType), { text: prompt }] }],
    config: { responseMimeType: 'application/json', temperature: 1 },
  });
  return parseIdea(res.text || '');
}

// Gemini EDITS the user's photo, so the result lines up with the original (edited: true)
export async function makeVisual({ buffer, mimeType, visualPrompt, mode, style }) {
  const prompt = buildEditPrompt({ visualPrompt, mode, style });
  const res = await ai().models.generateContent({
    model: IMAGE_MODEL(),
    contents: [{ role: 'user', parts: [{ text: prompt }, imagePart(buffer, mimeType)] }],
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  });
  const parts = res.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) throw new Error('The AI could not draw a picture this time. Try again.');
  return { image: `data:${img.inlineData.mimeType || 'image/png'};base64,${img.inlineData.data}`, edited: true };
}
