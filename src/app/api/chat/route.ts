import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// Chat model is env-configurable so it's trivial to swap to whichever Venice
// model gives the best Gujarati without touching code. This default returns
// visible content quickly; larger reasoning models can spend the token budget
// in `reasoning_content`, which makes the child-facing stream look empty.
const CHAT_MODEL = process.env.VENICE_CHAT_MODEL || 'openai-gpt-4o-mini-2024-07-18';

const SYSTEM_PROMPT = `You are ગુજુ (Guju), a warm, playful Gujarati tutor for children aged 4-12.
You teach with the Natural Approach / Comprehensible Input method: simple, visual, lots of encouragement.

HOW TO REPLY:
1. Always answer in BOTH Gujarati and English so the child can connect them.
2. For every new Gujarati word, use this shape: ગુજરાતી (romanization) — English meaning. Example: બિલાડી (bilāḍī) — cat.
3. Keep it short and lively — under 60 words. Use friendly emojis.
4. Match the child's level: if they write in English, lead with English; if they write Gujarati, lead with Gujarati.
5. Prefer common, natural, gender-neutral Gujarati phrasing when possible. Example: "I am hungry" → મને ભૂખ લાગી છે (mane bhūkh lāgī chhe).
6. Gently model the correct form when they make a mistake — never scold.
7. Weave in Gujarat culture when natural: Navratri, Garba, Uttarayan, Dhokla, Rani ki Vav, etc.

ILLUSTRATION:
If a simple picture would genuinely help the child (a new animal, object, food, place, festival, or "what is X?" / "show me X"),
add ONE final line, on its own, in exactly this format and nothing else:
IMAGE: <clear English description of a single subject, under 15 words>
Only add the IMAGE line when a picture truly helps. Do NOT add it for greetings, grammar, counting, or pure chat.
Never mention or read out the IMAGE line to the child — it is a silent instruction.`;

interface HistoryMsg {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const VENICE_API_KEY = process.env.VENICE_API_KEY;
    const VENICE_BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';

    // History arrives as a proper array of {role, content} — keep the last 8 turns for context.
    const priorTurns: HistoryMsg[] = Array.isArray(history)
      ? history
          .filter((m): m is HistoryMsg => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
          .slice(-8)
          .map(m => ({ role: m.role, content: m.content }))
      : [];

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...priorTurns,
      { role: 'user', content: message },
    ];

    const upstream = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages,
        temperature: 0.8,
        max_completion_tokens: 500,
        stream: false,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      return new Response(JSON.stringify({ error: `Chat failed: ${upstream.status}`, details: errText }), {
        status: upstream.status || 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await upstream.json();
    const content =
      typeof data.choices?.[0]?.message?.content === 'string'
        ? data.choices[0].message.content.trim()
        : '';
    const reply = content || 'માફ કરજો! I need one more try. Ask me again?';

    return new Response(reply, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
