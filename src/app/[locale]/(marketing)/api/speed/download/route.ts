import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Number.parseInt(searchParams.get('size') ?? '10485760', 10); // Default 10MB

  // Generate random data for speed testing
  const buffer = new Uint8Array(Math.min(size, 50 * 1024 * 1024)); // Cap at 50MB
  crypto.getRandomValues(buffer);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
