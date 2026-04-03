import type { SpeedTestResult } from '@speedtest/core';
import { describe, it, expect } from 'vitest';
import {
  formatTable,
  formatJson,
  formatCsv,
  formatHistoryTable,
  formatCompareTable,
} from './formatters.js';

const mockResult: SpeedTestResult = {
  download: 245.32,
  upload: 89.71,
  ping: 12.45,
  jitter: 2.13,
  timestamp: '2026-04-01T10:30:00.000Z',
};

describe('Formatters', () => {
  describe('formatTable', () => {
    it('formats a single result as a table', () => {
      const output = formatTable(mockResult);
      expect(output).toContain('Metric');
      expect(output).toContain('Result');
      expect(output).toContain('245.32');
      expect(output).toContain('89.71');
      expect(output).toContain('12.45');
      expect(output).toContain('2.13');
    });
  });

  describe('formatJson', () => {
    it('formats a single result as JSON', () => {
      const output = formatJson(mockResult);
      const parsed = JSON.parse(output);
      expect(parsed.download).toBe(245.32);
      expect(parsed.upload).toBe(89.71);
      expect(parsed.ping).toBe(12.45);
      expect(parsed.jitter).toBe(2.13);
      expect(parsed.timestamp).toBe('2026-04-01T10:30:00.000Z');
    });

    it('formats multiple results as JSON array', () => {
      const results: SpeedTestResult[] = [
        mockResult,
        { ...mockResult, download: 200, timestamp: '2026-03-31T10:30:00.000Z' },
      ];
      const output = formatJson(results);
      const parsed = JSON.parse(output);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });
  });

  describe('formatCsv', () => {
    it('formats a single result as CSV', () => {
      const output = formatCsv(mockResult);
      expect(output).toContain(
        'timestamp,download_mbps,upload_mbps,ping_ms,jitter_ms'
      );
      expect(output).toContain(
        '2026-04-01T10:30:00.000Z,245.32,89.71,12.45,2.13'
      );
    });

    it('formats multiple results as CSV', () => {
      const results: SpeedTestResult[] = [
        mockResult,
        { ...mockResult, download: 200, timestamp: '2026-03-31T10:30:00.000Z' },
      ];
      const output = formatCsv(results);
      const lines = output.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe(
        'timestamp,download_mbps,upload_mbps,ping_ms,jitter_ms'
      );
    });
  });

  describe('formatHistoryTable', () => {
    it('formats history as a table', () => {
      const results: SpeedTestResult[] = [mockResult];
      const output = formatHistoryTable(results);
      expect(output).toContain('#');
      expect(output).toContain('Date');
      expect(output).toContain('Download');
      expect(output).toContain('Upload');
      expect(output).toContain('Ping');
      expect(output).toContain('Jitter');
      expect(output).toContain('1');
    });

    it('returns message when no results', () => {
      const output = formatHistoryTable([]);
      expect(output).toContain('No saved results found');
    });

    it('formats multiple history entries', () => {
      const results: SpeedTestResult[] = [
        mockResult,
        { ...mockResult, download: 200, timestamp: '2026-03-31T10:30:00.000Z' },
      ];
      const output = formatHistoryTable(results);
      expect(output).toContain('1');
      expect(output).toContain('2');
    });
  });

  describe('formatCompareTable', () => {
    it('formats comparison between current and average', () => {
      const avg: SpeedTestResult = {
        download: 230.1,
        upload: 92.4,
        ping: 14.2,
        jitter: 2.5,
        timestamp: '2026-04-01T00:00:00.000Z',
      };
      const output = formatCompareTable(mockResult, avg);
      expect(output).toContain('Metric');
      expect(output).toContain('Current');
      expect(output).toContain('Average');
      expect(output).toContain('Change');
      expect(output).toContain('245.32');
      expect(output).toContain('230.10');
    });

    it('shows positive change for improvement', () => {
      const avg: SpeedTestResult = {
        download: 200,
        upload: 100,
        ping: 15,
        jitter: 3,
        timestamp: '2026-04-01T00:00:00.000Z',
      };
      const output = formatCompareTable(mockResult, avg);
      expect(output).toContain('+');
    });

    it('shows negative change for decrease', () => {
      const avg: SpeedTestResult = {
        download: 300,
        upload: 100,
        ping: 10,
        jitter: 1,
        timestamp: '2026-04-01T00:00:00.000Z',
      };
      const output = formatCompareTable(mockResult, avg);
      expect(output).toContain('-');
    });
  });
});
