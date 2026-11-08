const LANGS = {
  en: 'English',
  ur: 'Urdu, written in Urdu script (اردو)',
  roman: 'Roman Urdu (Urdu written in English letters)',
};

export const STYLES = {
  truckart: 'Pakistani truck art: bold flowers, mirror-work shimmer, bright chevrons, calligraphy-like borders',
  ajrak: 'Sindhi ajrak block-print patterns in indigo, crimson and white',
  boho: 'warm boho look with jute, macrame, dried grass and earthy tones',
  minimal: 'clean minimal look, neutral palette, a single accent colour',
  mughal: 'Mughal-inspired: arches, jali patterns, gold accents, deep jewel tones',
  festive: 'festive Eid / Ramadan / 14 August style: fairy lights, fanoos lanterns, bunting (jhandiyan)',
  kids: 'playful kids-room look with pastel colours and cut-out shapes',
};

export function buildIdeaPrompt({ mode, context, style, budget, lang, avoid }) {
  const subject =
    mode === 'space'
      ? 'an empty or plain corner / area of a room'
      : 'a leftover object or scrap material';
  return `You are Scrapture, a hands-on craft and home-decor coach for people in Pakistan.
The photo shows ${subject}. Extra context from the user: "${context || 'none'}".
Preferred look: ${STYLES[style] || STYLES.boho}.
Budget for anything that must be bought: Rs ${budget} (Pakistani rupees). ${
    budget === 0 ? 'Buy NOTHING: use only what a typical Pakistani household already has.' : ''
  }
${avoid ? `Do NOT suggest this idea again: "${avoid}". Give a clearly different one.` : ''}

Give ONE directed idea (not a list of options). The person does all the making by hand, so be specific, safe and realistic.
Prefer materials that are cheap and common in Pakistan: old dupattas and fabric scraps, chai/ghee tins, jam and achar jars, rassi/jute rope, courier-box cardboard, newspaper, poster colours, glue gun or Fevicol, sheesha mirror pieces, lace, buttons, wool.
For a room corner, design the whole corner (what to make, hang or place) using scraps where possible; keep furniture changes small.
Write every text field in ${LANGS[lang] || LANGS.en}, except "visualPrompt", which must always be English.

Return ONLY valid JSON (no markdown fences) with exactly this shape:
{
  "title": string (max 6 words),
  "summary": string (1-2 sentences),
  "difficulty": "easy" | "medium" | "hard",
  "timeMinutes": number,
  "estimatedCostPKR": number (must not exceed the budget),
  "haveMaterials": [string],
  "toBuy": [{ "item": string, "pricePKR": number }],
  "steps": [string] (4 to 8 short steps),
  "tip": string,
  "visualPrompt": string
}
"visualPrompt" = one detailed English paragraph (max 900 characters) describing the finished scene: first the original object or space exactly as in the photo (shape, size, colour, material, surroundings), then what the DIY changes (colours, patterns, placement). It must make sense on its own, because some image models only receive this text and not the photo.
If the photo is unclear or shows nothing usable, still return the JSON with a best guess and say in "tip" what photo would work better.`;
}

export function buildEditPrompt({ visualPrompt, mode, style }) {
  const keep =
    mode === 'space'
      ? 'the same room, walls, floor, door, camera angle and lighting'
      : 'the same object shape, camera angle and background lighting';
  return `Edit this photo into a realistic picture of the finished handmade result. Keep ${keep}; only add what the DIY changes.
Result: ${visualPrompt}
Look: ${STYLES[style] || STYLES.boho}.
Photorealistic, achievable by hand with simple materials. No text, no watermark, no people.`;
}

// For text-to-image models (e.g. FLUX): they never see the photo, so the prompt must stand alone
export function buildScenePrompt({ visualPrompt, mode, style }) {
  const shot = mode === 'space' ? 'Wide interior photo of a room corner.' : 'Close-up photo of a handmade decorated object.';
  return `${shot} ${visualPrompt} Look: ${STYLES[style] || STYLES.boho}. Natural daylight, realistic, achievable by hand with simple materials. No text, no watermark, no people.`.slice(0, 2000);
}
