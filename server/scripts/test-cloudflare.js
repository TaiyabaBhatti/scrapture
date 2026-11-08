// Run:  npm run test:cf   (from the server folder or the project root with --prefix)
// Checks your Cloudflare keys: writes cf-test.jpg and prints a sample idea title.
import 'dotenv/config';
import fs from 'fs';
import { configured, makeVisual, makeIdea } from '../src/providers/cloudflare.js';
import { buildIdeaPrompt } from '../src/prompts.js';

if (!configured()) {
  console.error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in server/.env');
  process.exit(1);
}
try {
  console.log('1/2 Drawing a test picture with FLUX...');
  const { image } = await makeVisual({
    visualPrompt: 'A plain glass bottle on a wooden table, wrapped in colourful Pakistani truck-art style floral paint and rope.',
    mode: 'object',
    style: 'truckart',
  });
  fs.writeFileSync('cf-test.jpg', Buffer.from(image.split(',')[1], 'base64'));
  console.log('   OK: saved server/cf-test.jpg. Open it to see the picture.');

  console.log('2/2 Asking Llama 4 Scout for an idea (no photo)...');
  const tiny = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const idea = await makeIdea({
    buffer: tiny,
    mimeType: 'image/png',
    prompt: buildIdeaPrompt({ mode: 'object', context: 'an empty glass bottle', style: 'boho', budget: 0, lang: 'en' }),
  });
  console.log('   OK: idea title =', idea.title);
  console.log('Cloudflare is working.');
} catch (e) {
  console.error('FAILED:', e.message);
  process.exit(1);
}
