import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const VENICE_API_KEY = process.env.VENICE_API_KEY;
    const VENICE_BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';

    const systemPrompt = `You are ગુજુ (Guju), a friendly and encouraging Gujarati language tutor for children aged 4-12. 
You use the Natural Approach / Comprehensible Input method — keep things simple, visual, and fun.

RULES:
1. Always respond in a mix of Gujarati and English (provide both languages)
2. Use simple words appropriate for the child's level
3. Be encouraging, enthusiastic, and playful — use emojis
4. When teaching new words, always provide: Gujarati script, romanization, and English meaning
5. Use stories, examples, and cultural references from Gujarat (festivals, food, places)
6. Keep responses short — under 100 words
7. If the child makes a mistake, gently correct by repeating the right way
8. Teach about Gujarati culture: Navratri, Uttarayan, Dhokla, Garba, Rani ki Vav, etc.`;

    const res = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'zai-org-glm-5-1',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(context || []).map((m: {role: string; content: string}) => ({ role: m.role, content: m.content })),
          { role: 'user', content: message },
        ],
        temperature: 0.8,
        max_completion_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Chat failed: ${res.status}`, details: errText }, { status: res.status });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 'માફ કરજો, હું સમજી શક્યો નહીં 🤔';
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
