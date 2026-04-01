import { NextResponse } from 'next/server';

// Pre-generate random buffer once (64KB)
const BUFFER_SIZE = 64 * 1024;
const randomBuffer = new Uint8Array(BUFFER_SIZE);
crypto.getRandomValues(randomBuffer);

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedSize = Number.parseInt(searchParams.get('size') ?? '25000000', 10);
  if (Number.isNaN(requestedSize)) {
    return NextResponse.json({ error: 'Invalid size parameter' }, { status: 400 });
  }
  const size = Math.min(requestedSize, 100 * 1024 * 1024); // Cap at 100MB

  // Use a pull-based ReadableStream that yields chunks efficiently
  let sent = 0;
  const body = new ReadableStream({
    pull(controller) {
      const remaining = size - sent;
      if (remaining <= 0) {
        controller.close();
        return;
      }
      const chunkSize = Math.min(BUFFER_SIZE, remaining);
      controller.enqueue(randomBuffer.slice(0, chunkSize));
      sent += chunkSize;
    },
  });

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': size.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
