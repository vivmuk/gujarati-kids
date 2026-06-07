import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a Gujarati language tutor for kids. Your job is to generate a task-based mission to teach Gujarati sentence formation (Subject-Object-Verb).
You MUST return ONLY a raw, valid JSON object. Do not wrap it in markdown block quotes (\`\`\`json). Just the JSON object.

The JSON object must have this exact structure:
{
  "theme": "market", // A short theme word
  "scenarioEnglish": "You are at the market and want to buy an apple.",
  "scenarioGujarati": "તમે બજારમાં છો અને તમારે સફરજન ખરીદવું છે.",
  "actionPrompt": "Pretend to hand money to the shopkeeper!",
  "targetSentence": "મારે સફરજન જોઈએ છે",
  "targetEnglish": "I want an apple",
  "puzzleBlocks": [
    { "text": "જોઈએ છે", "type": "verb", "roman": "joie chhe" },
    { "text": "સફરજન", "type": "object", "roman": "safarjan" },
    { "text": "મારે", "type": "subject", "roman": "mare" }
  ]
}

Rules for puzzleBlocks:
- Break the target sentence into 3 to 5 logical chunks (blocks).
- Types MUST be one of: "subject", "object", "verb", "postposition", "adjective".
- The 'text' fields combined must form the targetSentence.
- DO NOT order the blocks in the correct order. They MUST be shuffled in the JSON output so the kid can solve it!

Provide a fun, kid-friendly mission!`;

export async function POST(req: NextRequest) {
  try {
    const VENICE_API_KEY = process.env.VENICE_API_KEY;
    const VENICE_BASE_URL = process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';

    if (!VENICE_API_KEY) {
      console.warn("No VENICE_API_KEY provided. Falling back to a hardcoded mission.");
      return NextResponse.json({
        theme: "fallback",
        scenarioEnglish: "You are hungry and want to eat an apple.",
        scenarioGujarati: "તમને ભૂખ લાગી છે અને તમારે સફરજન ખાવું છે.",
        actionPrompt: "Pretend to take a big bite of an apple! Crunch!",
        targetSentence: "હું સફરજન ખાઉં છું",
        targetEnglish: "I am eating an apple",
        puzzleBlocks: [
          { text: "ખાઉં છું", type: "verb", roman: "khau chhu" },
          { text: "હું", type: "subject", roman: "hu" },
          { text: "સફરજન", type: "object", roman: "safarjan" }
        ]
      });
    }

    const { difficulty } = await req.json().catch(() => ({ difficulty: 'easy' }));

    const prompt = difficulty === 'hard' 
      ? "Generate a slightly more complex mission with 4 or 5 blocks (e.g., using adjectives or postpositions like 'The big cat is sleeping' or 'I am going to school')." 
      : "Generate a simple 3-block mission (Subject-Object-Verb).";

    const response = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.VENICE_CHAT_MODEL || 'openai-gpt-4o-mini-2024-07-18',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Venice API Error:", errText);
      throw new Error(`Venice API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Strip markdown formatting if Venice still outputs it despite instructions
    if (content.startsWith('```json')) {
      content = content.substring(7);
      if (content.endsWith('```')) {
        content = content.substring(0, content.length - 3);
      }
    } else if (content.startsWith('```')) {
      content = content.substring(3);
      if (content.endsWith('```')) {
        content = content.substring(0, content.length - 3);
      }
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Failed to generate mission:", error);
    return NextResponse.json({ error: "Failed to generate mission" }, { status: 500 });
  }
}
