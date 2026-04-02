import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const RESULTS_DIR = join(homedir(), '.speedtest-test');
const RESULTS_FILE = join(RESULTS_DIR, 'results.json');

function ensureDir() {
  if (!existsSync(RESULTS_DIR)) {
    mkdirSync(RESULTS_DIR, { recursive: true });
  }
}

function readAllResults() {
  ensureDir();
  if (!existsSync(RESULTS_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(RESULTS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllResults(results: unknown[]) {
  ensureDir();
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');
}

function cleanup() {
  if (existsSync(RESULTS_FILE)) {
    rmSync(RESULTS_FILE, { force: true });
  }
  if (existsSync(RESULTS_DIR)) {
    rmSync(RESULTS_DIR, { recursive: true, force: true });
  }
}

describe('Storage', () => {
  beforeEach(() => {
    cleanup();
    ensureDir();
  });

  afterEach(() => {
    cleanup();
  });

  describe('getResults', () => {
    it('returns empty array when no results exist', () => {
      expect(readAllResults()).toEqual([]);
    });

    it('returns all results when no limit specified', () => {
      const results = [
        { download: 100, upload: 50, ping: 10, jitter: 2, timestamp: '2026-01-01T00:00:00.000Z' },
        { download: 120, upload: 60, ping: 12, jitter: 3, timestamp: '2026-01-02T00:00:00.000Z' },
      ];
      writeAllResults(results);

      const stored = readAllResults();
      expect(stored).toHaveLength(2);
      expect(stored[0]).toEqual(results[0]);
    });
  });

  describe('saveResult', () => {
    it('saves a new result with timestamp', () => {
      const newResult = {
        download: 150.5,
        upload: 75.2,
        ping: 15.3,
        jitter: 2.1,
        timestamp: new Date().toISOString(),
      };

      const existing = readAllResults();
      existing.unshift(newResult);
      writeAllResults(existing);

      const stored = readAllResults();
      expect(stored).toHaveLength(1);
      expect(stored[0].download).toBe(150.5);
      expect(stored[0].upload).toBe(75.2);
      expect(stored[0].ping).toBe(15.3);
      expect(stored[0].jitter).toBe(2.1);
      expect(stored[0].timestamp).toBeDefined();
    });

    it('prepends new result to existing results', () => {
      const existing = [
        { download: 100, upload: 50, ping: 10, jitter: 2, timestamp: '2026-01-01T00:00:00.000Z' },
      ];
      writeAllResults(existing);

      const newResult = {
        download: 120,
        upload: 60,
        ping: 12,
        jitter: 3,
        timestamp: '2026-01-02T00:00:00.000Z',
      };

      const all = readAllResults();
      all.unshift(newResult);
      writeAllResults(all);

      const stored = readAllResults();
      expect(stored).toHaveLength(2);
      expect(stored[0].download).toBe(120);
      expect(stored[1].download).toBe(100);
    });
  });

  describe('deleteAllResults', () => {
    it('clears all results', () => {
      const results = [
        { download: 100, upload: 50, ping: 10, jitter: 2, timestamp: '2026-01-01T00:00:00.000Z' },
      ];
      writeAllResults(results);

      writeAllResults([]);

      expect(readAllResults()).toEqual([]);
    });
  });

  describe('exportResults', () => {
    it('exports results as JSON', () => {
      const results = [
        { download: 100, upload: 50, ping: 10, jitter: 2, timestamp: '2026-01-01T00:00:00.000Z' },
      ];
      writeAllResults(results);

      const stored = readAllResults();
      const json = JSON.stringify(stored, null, 2);
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].download).toBe(100);
    });

    it('exports results as CSV', () => {
      const results = [
        { download: 100, upload: 50, ping: 10, jitter: 2, timestamp: '2026-01-01T00:00:00.000Z' },
        { download: 120, upload: 60, ping: 12, jitter: 3, timestamp: '2026-01-02T00:00:00.000Z' },
      ];
      writeAllResults(results);

      const stored = readAllResults();
      const header = 'timestamp,download_mbps,upload_mbps,ping_ms,jitter_ms';
      const rows = stored.map(
        (r: { timestamp: string; download: number; upload: number; ping: number; jitter: number }) =>
          `${r.timestamp},${r.download},${r.upload},${r.ping},${r.jitter}`,
      );
      const csv = [header, ...rows].join('\n');

      expect(csv).toContain('timestamp,download_mbps,upload_mbps,ping_ms,jitter_ms');
      expect(csv).toContain('2026-01-01T00:00:00.000Z,100,50,10,2');
      expect(csv).toContain('2026-01-02T00:00:00.000Z,120,60,12,3');
    });
  });
});
