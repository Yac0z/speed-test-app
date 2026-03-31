'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

type Settings = {
  theme: Theme;
  testDuration: number;
  parallelConnections: number;
  dataRetentionDays: number;
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  testDuration: 10,
  parallelConnections: 4,
  dataRetentionDays: 90,
};

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [clearingHistory, setClearingHistory] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('speed-test-settings');
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          const record = parsed;
          const themeValue =
            'theme' in record &&
            (record.theme === 'light' ||
              record.theme === 'dark' ||
              record.theme === 'system')
              ? (record.theme as Theme)
              : undefined;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...(themeValue && { theme: themeValue }),
            ...('testDuration' in record &&
              typeof record.testDuration === 'number' && {
                testDuration: record.testDuration,
              }),
            ...('parallelConnections' in record &&
              typeof record.parallelConnections === 'number' && {
                parallelConnections: record.parallelConnections,
              }),
            ...('dataRetentionDays' in record &&
              typeof record.dataRetentionDays === 'number' && {
                dataRetentionDays: record.dataRetentionDays,
              }),
          });
        }
      } catch {
        // Use defaults
      }
    }
  }, []);

  const saveSettings = useCallback(() => {
    localStorage.setItem('speed-test-settings', JSON.stringify(settings));
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  }, [settings]);

  const clearHistory = useCallback(async () => {
    setClearingHistory(true);
    try {
      await fetch('/api/results', { method: 'DELETE' });
      localStorage.removeItem('speed-test-history');
    } catch {
      // Silently fail
    } finally {
      setClearingHistory(false);
      setConfirmClear(false);
    }
  }, []);

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-slate-400">
            Configure your speed test preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Appearance
            </h2>
            <fieldset>
              <legend className="mb-2 block text-sm text-slate-400">
                Theme
              </legend>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => {
                      updateSetting('theme', theme);
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      settings.theme === theme
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Test Settings */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Test Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="testDuration"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Test Duration: {settings.testDuration} seconds
                </label>
                <input
                  id="testDuration"
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={settings.testDuration}
                  onChange={(e) => {
                    updateSetting('testDuration', Number(e.target.value));
                  }}
                  className="w-full accent-blue-500"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>5s</span>
                  <span>30s</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="parallelConnections"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Parallel Connections: {settings.parallelConnections}
                </label>
                <input
                  id="parallelConnections"
                  type="range"
                  min="1"
                  max="8"
                  value={settings.parallelConnections}
                  onChange={(e) => {
                    updateSetting(
                      'parallelConnections',
                      Number(e.target.value)
                    );
                  }}
                  className="w-full accent-blue-500"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>1</span>
                  <span>8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">Data</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="dataRetention"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Data Retention: {settings.dataRetentionDays} days
                </label>
                <input
                  id="dataRetention"
                  type="range"
                  min="7"
                  max="365"
                  step="7"
                  value={settings.dataRetentionDays}
                  onChange={(e) => {
                    updateSetting('dataRetentionDays', Number(e.target.value));
                  }}
                  className="w-full accent-blue-500"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>7 days</span>
                  <span>1 year</span>
                </div>
              </div>

              <div className="pt-4">
                {confirmClear ? (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-red-400">Are you sure?</p>
                    <button
                      type="button"
                      onClick={clearHistory}
                      disabled={clearingHistory}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                    >
                      {clearingHistory ? 'Clearing...' : 'Yes, Clear'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmClear(false);
                      }}
                      className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClear(true);
                    }}
                    className="rounded-lg bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-600/30"
                  >
                    Clear All History
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveSettings}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-95"
            >
              {saveStatus === 'saved' ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
