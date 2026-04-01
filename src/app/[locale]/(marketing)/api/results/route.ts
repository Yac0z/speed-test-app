import { db } from '@/libs/DB';
import { speedTestResults } from '@/models/Schema';

export async function GET() {
  try {
    const results = await db
      .select()
      .from(speedTestResults)
      .orderBy(speedTestResults.timestamp)
      .limit(100);
    return Response.json(results);
  } catch {
    return Response.json([]);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const download =
    'download' in record && typeof record.download === 'number' && record.download >= 0 && record.download <= 10_000
      ? record.download
      : 0;
  const upload =
    'upload' in record && typeof record.upload === 'number' && record.upload >= 0 && record.upload <= 10_000
      ? record.upload
      : 0;
  const ping =
    'ping' in record && typeof record.ping === 'number' && record.ping >= 0 && record.ping <= 10_000
      ? record.ping
      : 0;
  const jitter =
    'jitter' in record && typeof record.jitter === 'number' && record.jitter >= 0 && record.jitter <= 5_000
      ? record.jitter
      : 0;

  try {
    const result = await db
      .insert(speedTestResults)
      .values({
        downloadMbps: download,
        uploadMbps: upload,
        pingMs: ping,
        jitterMs: jitter,
      })
      .returning();
    return Response.json(result[0]);
  } catch {
    return Response.json({ saved: false }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(speedTestResults);
    return Response.json({ deleted: true });
  } catch {
    return Response.json({ deleted: false }, { status: 500 });
  }
}
