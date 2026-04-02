/** Fetches connection information from ipapi.co geolocation service. */

import { type ConnectionInfo } from './types.js';

/** Response shape from ipapi.co/json/. */
type IpApiResponse = {
  ip: string;
  org: string;
  city: string;
  region: string;
  country_name: string;
  latitude: number;
  longitude: number;
};

/**
 * Fetches current connection information from ipapi.co.
 *
 * @returns Promise resolving to connection details
 * @throws {Error} If the request fails or returns invalid data
 *
 * @example
 * ```typescript
 * const info = await getConnectionInfo();
 * console.log(`${info.isp} in ${info.city}, ${info.country}`);
 * ```
 */
export async function getConnectionInfo(): Promise<ConnectionInfo> {
  const response = await fetch('https://ipapi.co/json/');

  if (!response.ok) {
    throw new Error(`Failed to fetch connection info: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as IpApiResponse;

  if (!data.ip) {
    throw new Error('Invalid response from ipapi.co: missing IP address');
  }

  return {
    ip: data.ip,
    isp: data.org ?? 'Unknown',
    city: data.city ?? 'Unknown',
    region: data.region ?? 'Unknown',
    country: data.country_name ?? 'Unknown',
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
  };
}
