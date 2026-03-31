'use client';

import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import type {
  IChartApi,
  ISeriesApi,
  LineData,
  UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';

type SpeedResult = {
  id: number;
  timestamp: string;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
};

type SpeedChartProps = {
  results: SpeedResult[];
};

function buildChartData(
  results: SpeedResult[],
  valueKey: 'downloadMbps' | 'uploadMbps'
): LineData<UTCTimestamp>[] {
  const data: LineData<UTCTimestamp>[] = [];
  for (const r of results) {
    const timestampSeconds = Math.floor(new Date(r.timestamp).getTime() / 1000);
    data.push({
      time: timestampSeconds as unknown as UTCTimestamp,
      value: r[valueKey],
    });
  }
  data.sort((a, b) => {
    const aTime = typeof a.time === 'number' ? a.time : 0;
    const bTime = typeof b.time === 'number' ? b.time : 0;
    return aTime - bTime;
  });
  return data;
}

export function SpeedChart(props: SpeedChartProps) {
  const { results } = props;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'>[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
    });

    chartRef.current = chart;

    const downloadSeries = chart.addSeries(LineSeries, {
      color: '#22c55e',
      lineWidth: 2,
      title: 'Download',
    });

    const uploadSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: 'Upload',
    });

    seriesRef.current = [downloadSeries, uploadSeries];

    const downloadData = buildChartData(results, 'downloadMbps');
    const uploadData = buildChartData(results, 'uploadMbps');

    downloadSeries.setData(downloadData);
    uploadSeries.setData(uploadData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [results]);

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-white">Speed Trends</h3>
      <div ref={chartContainerRef} className="rounded-lg" />
    </div>
  );
}
