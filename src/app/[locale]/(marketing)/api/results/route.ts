import {
  getResults,
  saveResult,
  deleteAllResults,
} from '@/utils/SpeedTestStorage';

export async function GET() {
  const results = getResults();
  return Response.json(results);
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
    'download' in record &&
    typeof record.download === 'number' &&
    record.download >= 0 &&
    record.download <= 10_000
      ? record.download
      : 0;
  const upload =
    'upload' in record &&
    typeof record.upload === 'number' &&
    record.upload >= 0 &&
    record.upload <= 10_000
      ? record.upload
      : 0;
  const ping =
    'ping' in record &&
    typeof record.ping === 'number' &&
    record.ping >= 0 &&
    record.ping <= 10_000
      ? record.ping
      : 0;
  const jitter =
    'jitter' in record &&
    typeof record.jitter === 'number' &&
    record.jitter >= 0 &&
    record.jitter <= 5000
      ? record.jitter
      : 0;

  const saved = saveResult({ download, upload, ping, jitter });
  return Response.json(saved);
}

export async function DELETE() {
  deleteAllResults();
  return Response.json({ deleted: true });
}
