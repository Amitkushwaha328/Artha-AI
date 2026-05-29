import { getProfile } from '../db/queries';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(
  messages: { role: string; content: string }[],
  system: string,
): Promise<string> {
  const profile = await getProfile();
  // We're reusing the claude_key field from DB to store the Gemini key for now
  const key = profile?.claude_key ?? '';

  if (!key) {
    return '[Add your Gemini API key in Settings to enable AI features]';
  }

  // Map messages to Gemini format
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' || msg.role === 'bot' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const res = await fetch(`${API_URL}?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: system }]
        }
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error: ${err}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response';
  } catch (e: any) {
    console.error('Gemini error:', e.message);
    return 'AI temporarily unavailable. Please try again.';
  }
}

// ── AI COACH ─────────────────────────────────────────────────────
const COACH_SYSTEM = `You are Artha's financial coach.
You are warm, calm, and non-judgmental.
RULES:
- Never say 'you should have', 'bad decision', or 'mistake'
- Only discuss what is possible from RIGHT NOW forward
- If user seems anxious, acknowledge feelings FIRST
- Keep responses under 100 words (this is a mobile app)
- You are NOT a SEBI advisor — never give specific stock picks
- Speak in plain English — no jargon`;

export async function coachChat(
  messages: { role: 'user' | 'bot'; text: string }[],
  financialContext: {
    safeToSpend:  number;
    dangerDay?:   number;
    spentSoFar:   number;
    topCategory?: string;
  }
) {
  const ctxPrefix = `
[User's current financial snapshot:
Safe to spend: ₹${financialContext.safeToSpend}
Spent this month: ₹${financialContext.spentSoFar}
${financialContext.dangerDay ? `Danger window: Day ${financialContext.dangerDay}` : 'No danger window'}
Top category: ${financialContext.topCategory ?? 'Unknown'}]
`;

  const augmented = [
    { role: 'user', content: ctxPrefix },
    ...messages.map(m => ({ role: m.role, content: m.text })),
  ];

  return callGemini(augmented, COACH_SYSTEM);
}

// ── JUGAAD TIPS ──────────────────────────────────────────────────
export async function getJugaadTips(context: {
  city: string;
  categories: { category: string; total: number }[];
}) {
  const system = `You are a frugal Indian financial advisor.
  Give hyper-local, actionable money-saving tips.
  Respond ONLY with valid JSON array, no markdown, no explanation.
  Format: [{"tip":string, "saving":number, "category":string, "difficulty":"easy"|"medium"}]
  Give exactly 5 tips.`;

  const spend = context.categories
    .map(c => `${c.category}: ₹${c.total}`)
    .join(', ');

  const prompt = `User in ${context.city}.
  Monthly spend: ${spend}.
  Give 5 Jugaad tips. Focus on telecom, food delivery, subscriptions.`;

  const raw = await callGemini([{role:'user', content:prompt}], system);

  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as JugaadTip[];
  } catch {
    return getDefaultJugaadTips();
  }
}

// ── DOOM SPENDING ANALYSIS ────────────────────────────────────────
export async function analyzeDoom(context: {
  count: number; total: number; merchants: string[];
}) {
  const system = `You are a compassionate financial therapist.
  Explain doom spending using neuroscience in 2 sentences.
  Never blame. Be like a wise, understanding older sibling.`;

  const prompt = `${context.count} purchases under ₹800 in 48hrs.
  Total ₹${context.total}. From: ${context.merchants.join(', ')}. Explain what the brain is doing. 2 sentences only.`;

  return callGemini([{role:'user', content:prompt}], system);
}

// ── FALLBACK JUGAAD TIPS (no API needed) ─────────────────────────
function getDefaultJugaadTips(): JugaadTip[] {
  return [
    { tip: 'Switch Jio postpaid ₹999 to prepaid ₹719 — same 2GB/day data',
      saving: 280, category: 'telecom', difficulty: 'easy' },
    { tip: 'Order from Swiggy via ONDC app Magicpin — same restaurants, lower fees',
      saving: 300, category: 'food', difficulty: 'easy' },
    { tip: 'Use HDFC Millennia card for Zomato/Amazon: 5% cashback',
      saving: 500, category: 'credit', difficulty: 'medium' },
    { tip: 'Check for unused UPI Autopay mandates in your payments app',
      saving: 400, category: 'subscription', difficulty: 'easy' },
    { tip: 'DMart Ready weekly basket is ~14% cheaper than quick-commerce',
      saving: 600, category: 'groceries', difficulty: 'easy' },
  ];
}

export interface JugaadTip {
  tip:        string;
  saving:     number;
  category:   string;
  difficulty: 'easy' | 'medium';
}
