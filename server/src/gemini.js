import { GoogleGenAI } from '@google/genai';

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
  const raw = (res.text || '').replace(/```json|```/g, '').trim();
  let idea;
  try {
    idea = JSON.parse(raw);
  } catch {
    throw new Error('The AI answered in a strange format. Please try again.');
  }
  idea.steps = Array.isArray(idea.steps) ? idea.steps : [];
  idea.toBuy = Array.isArray(idea.toBuy) ? idea.toBuy : [];
  idea.haveMaterials = Array.isArray(idea.haveMaterials) ? idea.haveMaterials : [];
  return idea;
}

export async function makeVisual({ buffer, mimeType, prompt }) {
  const res = await ai().models.generateContent({
    model: IMAGE_MODEL(),
    contents: [{ role: 'user', parts: [{ text: prompt }, imagePart(buffer, mimeType)] }],
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  });
  const parts = res.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) throw new Error('The AI could not draw a picture this time. Try again.');
  return `data:${img.inlineData.mimeType || 'image/png'};base64,${img.inlineData.data}`;
}
