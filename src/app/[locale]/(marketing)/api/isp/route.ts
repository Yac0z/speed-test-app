import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      cache: 'no-store',
      headers: { 'User-Agent': 'SpeedTestApp/1.0' },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'ISP lookup failed' }, { status: 502 });
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: 'Lookup failed' }, { status: 502 });
    }

    return NextResponse.json({
      ip: data.ip,
      org: data.org ?? data.isp ?? 'Unknown ISP',
      city: data.city,
      region: data.region,
      country: data.country_name ?? data.country,
    });
  } catch {
    return NextResponse.json({ error: 'ISP lookup unavailable' }, { status: 503 });
  }
}
