// Provider selection: the .env file decides who does what.
//   TEXT_PROVIDER  = gemini | cloudflare   (understands the photo, writes the idea)   default: gemini
//   IMAGE_PROVIDER = cloudflare | gemini | none   (draws the picture)
//                    default: cloudflare if its keys exist, otherwise gemini
import * as gemini from './gemini.js';
import * as cloudflare from './cloudflare.js';

export const textProviderName = () => (process.env.TEXT_PROVIDER || 'gemini').toLowerCase();
export const imageProviderName = () => {
  const p = (process.env.IMAGE_PROVIDER || '').toLowerCase();
  if (p) return p;
  return cloudflare.configured() ? 'cloudflare' : 'gemini';
};

const pick = (name) => (name === 'cloudflare' ? cloudflare : gemini);

export const makeIdea = (args) => pick(textProviderName()).makeIdea(args);

export async function makeVisual(args) {
  const name = imageProviderName();
  if (name === 'none') throw new Error('Picture generation is switched off (IMAGE_PROVIDER=none)');
  return pick(name).makeVisual(args);
}
