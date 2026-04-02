import { getConnectionInfo } from '@speedtest/core';

export async function getConnectionInfoHandler() {
  const info = await getConnectionInfo();

  return {
    ip: info.ip,
    isp: info.isp,
    city: info.city,
    region: info.region,
    country: info.country,
    latitude: info.latitude,
    longitude: info.longitude,
  };
}
