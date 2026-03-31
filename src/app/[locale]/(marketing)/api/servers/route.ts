import { NextResponse } from 'next/server';

const SERVERS = [
  {
    id: 1,
    name: 'Auto Detect',
    location: 'Nearest to you',
    url: '/api/speed',
    latitude: null,
    longitude: null,
    isActive: true,
  },
  {
    id: 2,
    name: 'Local Server',
    location: 'Your Network',
    url: '/api/speed',
    latitude: null,
    longitude: null,
    isActive: true,
  },
  {
    id: 3,
    name: 'Cloudflare Edge',
    location: 'Global CDN',
    url: 'https://speed.cloudflare.com',
    latitude: null,
    longitude: null,
    isActive: true,
  },
];

export async function GET() {
  return NextResponse.json(SERVERS);
}
