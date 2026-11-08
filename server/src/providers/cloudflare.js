import { buildScenePrompt } from '../prompts.js';
import { parseIdea } from './shared.js';

const TEXT_MODEL = () => process.env.CF_TEXT_MODEL || '@cf/meta/llama-4-scout-17b-16e-instruct';
const IMAGE_MODEL = () => process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';

export const configured = () => Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN);

async function run(model, body) {
  if (!configured()) throw new Error('Cloudflare keys are missing on the server (CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN)');
  const base = process.env.CLOUDFLARE_API_BASE || 'https://api.cloudflare.com/client/v4';
  const res = await fetch(`${base}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    const msg = data?.errors?.map((e) => e.message).join('; ') || `error ${res.status}`;
    const err = new Error(`Cloudflare: ${msg}`);
    err.status = res.status;
    throw err;
  }
  return data.result;
}

// Llama 4 Scout looks at the photo and writes the idea as JSON
export async function makeIdea({ buffer, mimeType, prompt }) {
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${buffer.toString('base64')}` } },
      ],
    },
  ];
  const read = (r) => r?.response ?? r?.choices?.[0]?.message?.content ?? r;
  try {
    // max_tokens must be raised: the default (256) cuts the JSON off
    return parseIdea(read(await run(TEXT_MODEL(), { messages, max_tokens: 2048, temperature: 0.9, response_format: { type: 'json_object' } })));
  } catch {
    return parseIdea(read(await run(TEXT_MODEL(), { messages, max_tokens: 2048, temperature: 0.9 })));
  }
}

// FLUX.1 schnell is text-to-image: it CANNOT edit the user's photo, so this is a concept picture (edited: false)
export async function makeVisual({ visualPrompt, mode, style }) {
  const prompt = buildScenePrompt({ visualPrompt, mode, style });
  const result = await run(IMAGE_MODEL(), { prompt, steps: 4 });
  if (!result?.image) throw new Error('The AI could not draw a picture this time. Try again.');
  return { image: `data:image/jpeg;base64,${result.image}`, edited: false };
}
