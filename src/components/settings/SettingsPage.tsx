'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/components/ThemeProvider';

type Theme = 'light' | 'dark' | 'system';

type Settings = {
  testDuration: number;
  parallelConnections: number;
  dataRetentionDays: number;
};

const DEFAULT_SETTINGS: Settings = {
  testDuration: 10,
  parallelConnections: 4,
  dataRetentionDays: 90,
};

function CyberSlider(props: {
  id: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  label: string;
  unit: string;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}) {
  const {
    id,
    min,
    max,
    step = 1,
    value,
    label,
    unit,
    minLabel,
    maxLabel,
    onChange,
  } = props;
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-3 flex items-center justify-between font-mono text-sm text-slate-400"
      >
        <span>{label}</span>
        <span className="text-cyan-neon/80">
          {value}
          <span className="ml-1 text-xs text-slate-600">{unit}</span>
        </span>
      </label>
      <div className="relative">
        {/* Track background */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          {/* Fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-neon/60 to-cyan-neon/80 transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Range input (invisible but interactive) */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) =>{  onChange(Number(e.target.value)); }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={label}
        />
        {/* Thumb indicator */}
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-neon bg-cyber-dark shadow-[0_0_8px_rgba(0,240,255,0.4)] transition-all duration-150"
          style={{ left: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-600">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function ThemeToggle(props: {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  const { theme, setTheme } = props;
  const options: { value: Theme; label: string; icon: string }[] = [
    { value: 'dark', label: 'Dark', icon: '◐' },
    { value: 'light', label: 'Light', icon: '◑' },
    { value: 'system', label: 'Auto', icon: '⚙' },
  ];

  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const isActive = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() =>{  setTheme(option.value); }}
            className={`group/theme relative flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-sm tracking-wider uppercase transition-all duration-300 ${
              isActive
                ? 'border border-cyan-neon/40 bg-cyan-neon/10 text-cyan-neon shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                : 'border border-slate-800/50 bg-slate-900/50 text-slate-500 hover:border-cyan-neon/20 hover:text-slate-400'
            }`}
          >
            <span
              className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover/theme:scale-105'}`}
            >
              {option.icon}
            </span>
            <span>{option.label}</span>
            {isActive && (
              <span className="absolute -bottom-px left-1/2 h-px w-6 -translate-x-1/2 bg-cyan-neon/60" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [confirmClear, setConfirmClear] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('speed-test-settings');
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          const record = parsed as Record<string, unknown>;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...('testDuration' in record &&
            typeof record.testDuration === 'number'
              ? { testDuration: record.testDuration }
              : {}),
            ...('parallelConnections' in record &&
            typeof record.parallelConnections === 'number'
              ? { parallelConnections: record.parallelConnections }
              : {}),
            ...('dataRetentionDays' in record &&
            typeof record.dataRetentionDays === 'number'
              ? { dataRetentionDays: record.dataRetentionDays }
              : {}),
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
    setTimeout(() =>{  setSaveStatus('idle'); }, 2000);
  }, [settings]);

  const clearHistory = useCallback(() => {
    localStorage.removeItem('speed-test-history');
    setConfirmClear(false);
  }, []);

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cyber-dark p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl animate-pulse space-y-6">
          <div className="h-8 w-32 rounded bg-slate-800" />
          <div className="h-32 rounded-xl bg-slate-800/50" />
          <div className="h-48 rounded-xl bg-slate-800/50" />
          <div className="h-40 rounded-xl bg-slate-800/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-neon/60" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-cyan-neon/40 uppercase">
              Configuration
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            <span className="cyber-text-glow text-cyan-neon">SETTINGS</span>
          </h1>
          <p className="mt-1 font-mono text-sm text-slate-600">
            // customize your speed test experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="cyber-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-cyan-neon/60">{'>'}</span>
              <h2 className="font-mono text-sm font-semibold tracking-wider text-cyan-neon/80 uppercase">
                Appearance
              </h2>
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>

          {/* Test Settings */}
          <div className="cyber-card p-6">
            <div className="mb-6 flex items-center gap-2">
              <span className="text-cyan-neon/60">{'>'}</span>
              <h2 className="font-mono text-sm font-semibold tracking-wider text-cyan-neon/80 uppercase">
                Test Parameters
              </h2>
            </div>
            <div className="space-y-8">
              <CyberSlider
                id="testDuration"
                min={5}
                max={30}
                step={5}
                value={settings.testDuration}
                label="Test Duration"
                unit="s"
                minLabel="5s (quick)"
                maxLabel="30s (thorough)"
                onChange={(v) =>{  updateSetting('testDuration', v); }}
              />
              <CyberSlider
                id="parallelConnections"
                min={1}
                max={8}
                value={settings.parallelConnections}
                label="Parallel Connections"
                unit=""
                minLabel="1 (conservative)"
                maxLabel="8 (aggressive)"
                onChange={(v) =>{  updateSetting('parallelConnections', v); }}
              />
            </div>
          </div>

          {/* Data */}
          <div className="cyber-card p-6">
            <div className="mb-6 flex items-center gap-2">
              <span className="text-cyan-neon/60">{'>'}</span>
              <h2 className="font-mono text-sm font-semibold tracking-wider text-cyan-neon/80 uppercase">
                Data Management
              </h2>
            </div>
            <div className="space-y-6">
              <CyberSlider
                id="dataRetention"
                min={7}
                max={365}
                step={7}
                value={settings.dataRetentionDays}
                label="Data Retention"
                unit="d"
                minLabel="7 days"
                maxLabel="1 year"
                onChange={(v) =>{  updateSetting('dataRetentionDays', v); }}
              />

              <div className="border-t border-cyan-neon/10 pt-4">
                {confirmClear ? (
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-red-400/80">
                      {'> Confirm deletion of all history?'}
                    </span>
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-2 font-mono text-xs tracking-wider text-red-400 uppercase transition-all hover:border-red-500/60 hover:bg-red-500/20"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() =>{  setConfirmClear(false); }}
                      className="rounded-sm border border-slate-700/50 bg-slate-900/50 px-4 py-2 font-mono text-xs tracking-wider text-slate-500 uppercase transition-all hover:border-slate-600 hover:text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>{  setConfirmClear(true); }}
                    className="rounded-sm border border-red-500/20 bg-red-500/5 px-4 py-2.5 font-mono text-xs tracking-wider text-red-400/60 uppercase transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                  >
                    {'>'} Clear All History
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
              className={`cyber-btn relative rounded-sm px-8 py-3 font-mono text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
                saveStatus === 'saved'
                  ? 'border border-green-neon/40 bg-green-neon/10 text-green-neon shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                  : 'border border-cyan-neon/30 bg-cyan-neon/10 text-cyan-neon shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-cyan-neon/60 hover:bg-cyan-neon/20 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]'
              }`}
            >
              {/* Corner accents */}
              <span className="absolute -top-1 -left-1 h-2.5 w-2.5 border-t border-l border-current opacity-40" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 border-t border-r border-current opacity-40" />
              <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 border-b border-l border-current opacity-40" />
              <span className="absolute -right-1 -bottom-1 h-2.5 w-2.5 border-r border-b border-current opacity-40" />

              <span className="relative z-10">
                {saveStatus === 'saved' ? '✓ Saved' : 'Save Settings'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
