import { NextResponse } from 'next/server';

export function HEAD() {
  return new NextResponse(null, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export function GET() {
  return NextResponse.json({ timestamp: Date.now() });
}
