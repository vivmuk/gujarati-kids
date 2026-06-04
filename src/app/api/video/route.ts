import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const VENICE_MODEL = 'grok-imagine-reference-to-video';
const VIDEO_DURATION = '5s';
const ASPECT_RATIO = '1:1';
const RESOLUTION = '480p';
const POLL_INTERVAL_MS = 10_000;
const MAX_POLL_MS = 120_000;

function getBaseUrl(): string {
  return process.env.VENICE_BASE_URL || 'https://api.venice.ai/api/v1';
}

function getApiKey(): string {
  const key = process.env.VENICE_API_KEY;
  if (!key) throw new Error('VENICE_API_KEY is not configured');
  return key;
}

async function venicePost(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, prompt } = await req.json();

    if (!imageUrl?.trim()) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    // ── Step 1: Quote ──────────────────────────────────────────────
    const quoteRes = await venicePost('/video/quote', {
      model: VENICE_MODEL,
      duration: VIDEO_DURATION,
      aspect_ratio: ASPECT_RATIO,
    });

    if (!quoteRes.ok) {
      const errText = await quoteRes.text();
      return NextResponse.json(
        { error: 'Video quote failed', details: errText },
        { status: quoteRes.status },
      );
    }

    const quoteData = await quoteRes.json();
    console.log('[video] Quote received:', JSON.stringify(quoteData));

    // ── Step 2: Queue ──────────────────────────────────────────────
    const queueRes = await venicePost('/video/queue', {
      model: VENICE_MODEL,
      duration: VIDEO_DURATION,
      aspect_ratio: ASPECT_RATIO,
      resolution: RESOLUTION,
      reference_image_urls: [imageUrl],
      prompt,
    });

    if (!queueRes.ok) {
      const errText = await queueRes.text();
      return NextResponse.json(
        { error: 'Video queue failed', details: errText },
        { status: queueRes.status },
      );
    }

    const queueData = await queueRes.json();
    const queueId = queueData.queue_id ?? queueData.id;

    if (!queueId) {
      return NextResponse.json(
        { error: 'No queue_id returned from video queue', details: queueData },
        { status: 502 },
      );
    }

    console.log(`[video] Queued with id: ${queueId}`);

    // ── Step 3: Poll /video/retrieve ────────────────────────────────
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLL_MS) {
      const retrieveRes = await venicePost('/video/retrieve', {
        model: VENICE_MODEL,
        queue_id: queueId,
      });

      if (!retrieveRes.ok) {
        const errText = await retrieveRes.text();
        console.error(`[video] Retrieve error (${retrieveRes.status}): ${errText}`);
        // Transient errors – wait and retry
        await sleep(POLL_INTERVAL_MS);
        continue;
      }

      const contentType = retrieveRes.headers.get('content-type') || '';

      // Binary MP4 → video is ready
      if (contentType.includes('video/') || contentType.includes('octet-stream')) {
        const videoBuffer = Buffer.from(await retrieveRes.arrayBuffer());
        console.log(`[video] Completed – ${videoBuffer.length} bytes`);

        // ── Step 4: Complete (fire-and-forget) ────────────────────
        venicePost('/video/complete', {
          model: VENICE_MODEL,
          queue_id: queueId,
        }).catch((e) => console.error('[video] Complete call failed:', e));

        return new NextResponse(videoBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': String(videoBuffer.length),
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }

      // JSON response – still processing
      const statusData = await retrieveRes.json();
      const status =
        statusData.status ??
        statusData.request_status ??
        statusData.state;

      console.log(`[video] Poll status: ${status}`);

      if (status === 'FAILED' || status === 'ERROR' || status === 'REJECTED') {
        // Cleanup on failure
        venicePost('/video/complete', {
          model: VENICE_MODEL,
          queue_id: queueId,
        }).catch(() => {});

        return NextResponse.json(
          { error: 'Video generation failed', details: statusData },
          { status: 502 },
        );
      }

      // Still PROCESSING / PENDING – wait and retry
      await sleep(POLL_INTERVAL_MS);
    }

    // ── Timeout ─────────────────────────────────────────────────────
    console.error(`[video] Timed out after ${MAX_POLL_MS}ms for queue_id: ${queueId}`);

    venicePost('/video/complete', {
      model: VENICE_MODEL,
      queue_id: queueId,
    }).catch(() => {});

    return NextResponse.json(
      { error: 'Video generation timed out', queue_id: queueId },
      { status: 504 },
    );
  } catch (error) {
    console.error('[video] Unhandled error:', error);

    if (error instanceof Error && error.message === 'VENICE_API_KEY is not configured') {
      return NextResponse.json({ error: 'Server misconfiguration: missing API key' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Video generation failed' }, { status: 500 });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
