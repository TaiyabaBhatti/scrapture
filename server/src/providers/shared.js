const BAD = 'The AI answered in a strange format. Please try again.';
const list = (v) => (Array.isArray(v) ? v : []);

// Accepts a JSON string (maybe wrapped in text/fences) or an object and returns a clean idea
export function parseIdea(raw) {
  let idea = raw;
  if (typeof raw === 'string') {
    const s = raw.replace(/```json|```/g, '').trim();
    const a = s.indexOf('{');
    const b = s.lastIndexOf('}');
    try {
      idea = JSON.parse(a >= 0 && b > a ? s.slice(a, b + 1) : s);
    } catch {
      throw new Error(BAD);
    }
  }
  if (!idea || typeof idea !== 'object' || !idea.title) throw new Error(BAD);

  idea.steps = list(idea.steps).map(String);
  idea.haveMaterials = list(idea.haveMaterials).map(String);
  idea.toBuy = list(idea.toBuy).map((b) =>
    typeof b === 'string' ? { item: b, pricePKR: 0 } : { item: String(b.item || ''), pricePKR: Number(b.pricePKR) || 0 }
  );
  idea.timeMinutes = Number(idea.timeMinutes) || 0;
  idea.estimatedCostPKR = Number(idea.estimatedCostPKR) || 0;
  idea.visualPrompt = String(idea.visualPrompt || idea.summary || idea.title);
  return idea;
}
