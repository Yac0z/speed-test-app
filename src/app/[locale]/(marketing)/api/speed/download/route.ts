import { NextResponse } from 'next/server';

// Pre-generate a small random buffer to avoid CPU bottleneck per request
const BUFFER_SIZE = 64 * 1024; // 64KB
const randomBuffer = new Uint8Array(BUFFER_SIZE);
crypto.getRandomValues(randomBuffer);

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedSize = Number.parseInt(searchParams.get('size') ?? '5242880', 10);
  const size = Math.min(requestedSize, 50 * 1024 * 1024); // Cap at 50MB

  // Stream the pre-generated buffer repeated to reach requested size
  const body = new ReadableStream({
    start(controller) {
      let sent = 0;
      while (sent < size) {
        const remaining = size - sent;
        const chunkSize = Math.min(BUFFER_SIZE, remaining);
        controller.enqueue(randomBuffer.slice(0, chunkSize));
        sent += chunkSize;
      }
      controller.close();
    },
  });

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': size.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
