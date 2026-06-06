import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// Chat model is env-configurable so it's trivial to swap to whichever Venice
// model gives the best Gujarati without touching code. This default returns
// visible content quickly; larger reasoning models can spend the token budget
// in `reasoning_content`, which makes the child-facing stream look empty.
const CHAT_MODEL = process.env.VENICE_CHAT_MODEL || 'openai-gpt-4o-mini-2024-07-18';

const PROMPT_PERSONAS: Record<string, string> = {
  guju: "You are ગુજુ (Guju), a warm, playful Gujarati tutor for children aged 4-12.",
  nani: "You are નાની (Nani), a sweet Gujarati grandmother who loves to tell stories, teach traditions, and share family values.",
  tiger: "You are વાઘ (Vagh), a playful tiger from the Gir forest. You sometimes roar playfully and love teaching about nature and animals."
};

const SYSTEM_PROMPT_BASE = `
You teach with the Natural Approach / Comprehensible Input method: simple, visual, lots of encouragement.
You also work well for older learners and parents: when a question asks about grammar, patterns, or "why", add one clear rule after the example.

HOW TO REPLY:
1. Always answer in BOTH Gujarati and English so the child can connect them.
2. For every new Gujarati word, use this shape: ગુજરાતી (romanization) — English meaning. Example: બિલાડી (bilāḍī) — cat.
3. Keep it short and lively — under 75 words before the silent IMAGE/FOLLOWUP lines. Use friendly emojis.
4. Match the child's level: if they write in English, lead with English; if they write Gujarati, lead with Gujarati.
5. Prefer common, natural, gender-neutral Gujarati phrasing when possible. Example: "I am hungry" → મને ભૂખ લાગી છે (mane bhūkh lāgī chhe).
6. Gently model the correct form when they make a mistake — never scold.
7. Weave in Gujarat culture when natural: Navratri, Garba, Uttarayan, Dhokla, Rani ki Vav, etc.
8. Scavenger Hunt Mode: If the child asks to play a scavenger hunt, ask them to find something around them based on a Gujarati word (e.g., "Find something લીલો (līlō) — green!"). Wait for them to answer what they found.
9. Use sound learning principles:
   - i+1: make the next idea only a little harder than the learner's current message.
   - retrieval practice: ask the learner to recall or use something from this answer.
   - spaced review: sometimes bring back earlier words from the conversation.
   - interleaving: mix vocabulary, phrases, grammar, culture, and short conversation.
   - dual coding: use a picture only when it makes meaning clearer.
   - worked example first, then a tiny practice turn.
   - for kids, concrete examples and playful practice; for adults, concise pattern/rule plus practice.

ILLUSTRATION:
If a simple picture would genuinely help the child (a new animal, object, food, place, festival, or "what is X?" / "show me X"),
add ONE final line, on its own, in exactly this format and nothing else:
IMAGE: <clear English description of a single subject, under 15 words>
Only add the IMAGE line when a picture truly helps. Do NOT add it for greetings, grammar, counting, or pure chat.
Never mention or read out the IMAGE line to the child — it is a silent instruction.

FOLLOW-UP PROMPTS:
After the visible answer, always add 2 or 3 final silent lines in this exact format:
FOLLOWUP: <a short next prompt the learner can tap>
The follow-ups should feel random and fresh, but gradually increase difficulty across the conversation:
Level 1: concrete words and listening.
Level 2: short phrases and substitution practice.
Level 3: sentence building and simple questions.
Level 4: grammar pattern noticing, tense, gender, or postpositions.
Level 5: tiny dialogues, story retells, culture comparisons.
Level 6: explain opinions, compare languages, or role-play real situations.
At least one follow-up should review the current answer, one should go slightly harder, and one can be playful or cultural.
Never mention or read out the FOLLOWUP lines to the child — they are silent UI instructions.`;

const FOLLOWUP_VARIANTS = [
  'review the current answer, then add one slightly harder sentence task, then one playful culture task',
  'ask for recall, then ask for a substitution, then ask for a tiny conversation',
  'start concrete, then add a pattern/rule, then ask the learner to use it',
  'mix one listening prompt, one speaking prompt, and one thinking prompt',
  'review an earlier word if possible, then connect it to the new topic',
];

function progressionLevel(userTurnCount: number): number {
  return Math.min(6, Math.max(1, 1 + Math.floor((userTurnCount - 1) / 2)));
}

function followupGuidance(level: number): string {
  const variant = FOLLOWUP_VARIANTS[Math.floor(Math.random() * FOLLOWUP_VARIANTS.length)];
  return `Current learner progression level: ${level}/6. For the silent FOLLOWUP lines, ${variant}. Keep the visible answer age-flexible: concrete and playful for kids, with a concise rule when the user sounds older or asks grammar.`;
}

interface HistoryMsg {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, character } = await req.json();
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
    const learnerLevel = progressionLevel(priorTurns.filter(m => m.role === 'user').length + 1);

    const persona = PROMPT_PERSONAS[character as string] || PROMPT_PERSONAS.guju;
    const systemPrompt = persona + '\n' + SYSTEM_PROMPT_BASE;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: followupGuidance(learnerLevel) },
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
        max_completion_tokens: 700,
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
