import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://ip-api.com/json/?fields=status,message,country,regionName,city,isp,org,as,query',
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'ISP lookup failed' }, { status: 502 });
    }

    const data = await response.json();

    if (data.status === 'success') {
      return NextResponse.json({
        ip: data.query,
        org: data.org ?? data.isp,
        city: data.city,
        region: data.regionName,
        country: data.country,
      });
    }

    return NextResponse.json({ error: 'Lookup failed' }, { status: 502 });
  } catch {
    return NextResponse.json({ error: 'ISP lookup unavailable' }, { status: 503 });
  }
}
