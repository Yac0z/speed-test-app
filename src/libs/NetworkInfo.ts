export type ConnectionType = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';

interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
  rtt?: number;
  downlinkMax?: number;
}

export type NetworkInfo = {
  effectiveType: ConnectionType;
  downlink: number | null;
  saveData: boolean;
  rtt: number | null;
  downlinkMax: number | null;
  supported: boolean;
};

function getNetworkInfo(): NetworkInfo {
  const nav = navigator as Navigator & { connection?: NetworkInformation };
  const connection = nav.connection;

  if (!connection) {
    return {
      effectiveType: 'unknown',
      downlink: null,
      saveData: false,
      rtt: null,
      downlinkMax: null,
      supported: false,
    };
  }

  const effectiveType = connection.effectiveType as ConnectionType;
  const downlink = connection.downlink ?? null;
  const saveData = connection.saveData ?? false;
  const rtt = connection.rtt ?? null;
  const downlinkMax = connection.downlinkMax ?? null;

  return {
    effectiveType,
    downlink,
    saveData,
    rtt,
    downlinkMax,
    supported: true,
  };
}

export const getConnectionInfo = (): NetworkInfo => {
  if (typeof window === 'undefined') {
    return {
      effectiveType: 'unknown',
      downlink: null,
      saveData: false,
      rtt: null,
      downlinkMax: null,
      supported: false,
    };
  }

  return getNetworkInfo();
};

export function formatConnectionType(type: ConnectionType): string {
  const labels: Record<ConnectionType, string> = {
    '4g': '4G / LTE',
    '3g': '3G',
    '2g': '2G',
    'slow-2g': '2G (Slow)',
    'unknown': 'Unknown',
  };
  return labels[type];
}

export function formatDownlinkSpeed(mbps: number | null): string {
  if (mbps === null) return '—';
  if (mbps < 1) return `${(mbps * 1000).toFixed(0)} Kbps`;
  return `${mbps.toFixed(1)} Mbps`;
}