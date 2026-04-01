import { NextResponse } from 'next/server';

/**
 * Cloudflare Edge speed test endpoints
 * Uses Cloudflare's globally distributed edge network for accurate measurements
 */

// Cloudflare speed test endpoints (closest edge automatically selected)
const CF_SPEED_TEST = {
  download: 'https://speed.cloudflare.com/__down',
  upload: 'https://speed.cloudflare.com/__up',
  ping: 'https://speed.cloudflare.com/cdn-cgi/trace',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Number.parseInt(searchParams.get('size') ?? '1000000', 10);
  const clampedSize = Math.min(Math.max(size, 1000), 100_000_000);

  try {
    const response = await fetch(
      `${CF_SPEED_TEST.download}?bytes=${clampedSize}`,
      {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Cloudflare edge unavailable' },
        { status: 502 }
      );
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Cloudflare edge unavailable' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.arrayBuffer();

    const response = await fetch(CF_SPEED_TEST.upload, {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Cloudflare edge unavailable' },
        { status: 502 }
      );
    }

    return NextResponse.json({ received: true, bytes: body.byteLength });
  } catch {
    return NextResponse.json(
      { error: 'Cloudflare edge unavailable' },
      { status: 503 }
    );
  }
}
