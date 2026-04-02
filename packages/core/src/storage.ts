/** File-based storage for speed test results. */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { type SpeedTestResult } from './types.js';

const RESULTS_DIR = join(homedir(), '.speedtest');
const RESULTS_FILE = join(RESULTS_DIR, 'results.json');
const MAX_RESULTS = 1000;

/**
 * Ensures the results directory exists.
 */
function ensureDir(): void {
  if (!existsSync(RESULTS_DIR)) {
    mkdirSync(RESULTS_DIR, { recursive: true });
  }
}

/**
 * Reads all stored results from disk.
 *
 * @returns Array of stored results, or empty array if none exist
 */
function readAllResults(): SpeedTestResult[] {
  ensureDir();

  if (!existsSync(RESULTS_FILE)) {
    return [];
  }

  try {
    const data = readFileSync(RESULTS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as SpeedTestResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Writes results array to disk.
 *
 * @param results - Results to persist
 */
function writeAllResults(results: SpeedTestResult[]): void {
  ensureDir();
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');
}

/**
 * Retrieves stored speed test results.
 *
 * @param limit - Maximum number of results to return (default: all, max: 1000)
 * @returns Array of results ordered newest first
 *
 * @example
 * ```typescript
 * const recent = getResults(10); // Last 10 tests
 * const all = getResults();      // All stored tests
 * ```
 */
export function getResults(limit?: number): SpeedTestResult[] {
  const results = readAllResults();
  // Results are stored newest first
  const count = limit !== undefined ? Math.min(limit, MAX_RESULTS) : MAX_RESULTS;
  return results.slice(0, count);
}

/**
 * Saves a new test result to storage.
 *
 * @param result - Result to save (timestamp is auto-generated)
 * @returns The saved result with timestamp included
 *
 * @example
 * ```typescript
 * const saved = saveResult({ download: 150.5, upload: 50.2, ping: 12.3, jitter: 2.1 });
 * console.log(saved.timestamp); // ISO timestamp
 * ```
 */
export function saveResult(
  result: Omit<SpeedTestResult, 'timestamp'>,
): SpeedTestResult {
  const allResults = readAllResults();
  const newResult: SpeedTestResult = {
    ...result,
    timestamp: new Date().toISOString(),
  };

  // Prepend new result (newest first)
  allResults.unshift(newResult);

  // Enforce maximum
  if (allResults.length > MAX_RESULTS) {
    allResults.length = MAX_RESULTS;
  }

  writeAllResults(allResults);
  return newResult;
}

/**
 * Deletes all stored results.
 *
 * @example
 * ```typescript
 * deleteAllResults();
 * console.log(getResults()); // []
 * ```
 */
export function deleteAllResults(): void {
  ensureDir();
  if (existsSync(RESULTS_FILE)) {
    writeFileSync(RESULTS_FILE, '[]', 'utf-8');
  }
}

/**
 * Exports results in the specified format.
 *
 * @param format - Output format ('json' or 'csv')
 * @returns Formatted string of all results
 * @throws {Error} If format is not supported
 *
 * @example
 * ```typescript
 * const json = exportResults('json');
 * const csv = exportResults('csv');
 * ```
 */
export function exportResults(format: 'json' | 'csv'): string {
  const results = readAllResults();

  switch (format) {
    case 'json':
      return JSON.stringify(results, null, 2);

    case 'csv': {
      const header = 'timestamp,download_mbps,upload_mbps,ping_ms,jitter_ms';
      const rows = results.map(
        (r) =>
          `${r.timestamp},${r.download},${r.upload},${r.ping},${r.jitter}`,
      );
      return [header, ...rows].join('\n');
    }

    default:
      throw new Error(`Unsupported export format: ${format satisfies never}`);
  }
}
