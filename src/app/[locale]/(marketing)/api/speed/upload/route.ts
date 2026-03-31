import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Consume the request body to measure upload speed
  const contentLength = request.headers.get('content-length');

  if (contentLength) {
    // Read and discard the body
    const reader = request.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
