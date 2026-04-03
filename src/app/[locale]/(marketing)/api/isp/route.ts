import { NextResponse } from 'next/server';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? '';
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '';
}

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);

    if (!clientIp) {
      return NextResponse.json(
        { error: 'Unable to detect IP' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://ipapi.co/${clientIp}/json/`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'SpeedTestApp/1.0' },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Lookup failed' }, { status: 502 });
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: 'Lookup failed' }, { status: 502 });
    }

    return NextResponse.json({
      ip: data.ip ?? clientIp,
      org: data.org ?? data.isp ?? 'Unknown ISP',
      city: data.city ?? 'Unknown',
      region: data.region ?? '',
      country: data.country_name ?? data.country ?? 'Unknown',
      latitude: data.latitude,
      longitude: data.longitude,
    });
  } catch {
    return NextResponse.json(
      { error: 'ISP lookup unavailable' },
      { status: 503 }
    );
  }
}
