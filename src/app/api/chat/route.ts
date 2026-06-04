import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const STYLE_PREFIX =
  '1990s Indian school textbook illustration style, hand-drawn watercolor look, warm earthy tones, simple clean lines, flat perspective, educational diagram aesthetic, muted colors on off-white paper background:';

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
8. Teach about Gujarati culture: Navratri, Uttarayan, Dhokla, Garba, Rani ki Vav, etc.

ILLUSTRATION RULES:
You decide when a picture would help the child learn. Set "needs_illustration" to true when:
- The child asks "what is X?" or "show me X" or asks for a new word/concept
- You're introducing a new animal, object, place, or cultural item
- A visual would make the concept clearer (e.g., describing a festival, food, animal)

Set "needs_illustration" to false when:
- The child is just chatting, greeting, or asking a grammar question
- The conversation is about pronunciation, counting, or abstract concepts
- You've already illustrated this concept recently

When needs_illustration is true, write a SHORT image_prompt (under 20 words) describing ONE clear subject for an educational illustration. Example: "a cute cartoon cow standing in a green field, simple labeled diagram"`;

    // Ask the LLM for structured JSON so we can decide whether to render an image
    const chatRes = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'minimax-m3',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(context || []).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
          { role: 'user', content: message },
        ],
        temperature: 0.8,
        max_completion_tokens: 1024,
        response_format: { type: 'json_object' },
      }),
    });

    if (!chatRes.ok) {
      const errText = await chatRes.text();
      return NextResponse.json({ error: `Chat failed: ${chatRes.status}`, details: errText }, { status: chatRes.status });
    }

    const chatData = await chatRes.json();
    const raw = chatData.choices?.[0]?.message?.content || '{}';

    // Parse the structured reply
    let reply = '';
    let imagePrompt: string | null = null;
    try {
      const parsed = JSON.parse(raw);
      reply = parsed.reply || parsed.message || parsed.text || raw;
      if (parsed.needs_illustration && parsed.image_prompt) {
        imagePrompt = String(parsed.image_prompt).slice(0, 200);
      }
    } catch {
      // Fallback: not JSON, treat as plain text reply
      reply = raw;
    }

    // If the LLM wants an illustration, generate it via grok-imagine in 90s textbook style
    let image: string | null = null;
    if (imagePrompt) {
      try {
        const imgRes = await fetch(`${VENICE_BASE_URL}/image/generate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${VENICE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-imagine-image',
            prompt: `${STYLE_PREFIX} ${imagePrompt}`,
            aspect_ratio: '1:1',
            format: 'webp',
            return_binary: false,
            safe_mode: true,
          }),
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          image = imgData.images?.[0] || null;
        }
      } catch (err) {
        // Image generation failure shouldn't break the chat — just skip the image
        console.error('Chat illustration failed:', err);
      }
    }

    return NextResponse.json({ reply, image });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
