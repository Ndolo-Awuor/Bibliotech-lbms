import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import {
  Server,
  RefreshCw,
  Download,
  RotateCcw,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';

interface SettingsViewProps {
  onRequestResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRequestResetData }) => {
  const {
    backendState,
    updateApiUrl,
    checkBackendConnection,
    syncWithBackend,
    exportCatalogJson,
    exportCatalogCsv,
    theme,
    toggleTheme,
  } = useLibrary();

  const [inputUrl, setInputUrl] = useState(backendState.apiUrl);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiUrl(inputUrl);
  };

  const handleTestConnection = async () => {
    setTestResult('Testing connection to backend...');
    const ok = await checkBackendConnection();
    if (ok) {
      setTestResult('Success: Connection established to Express REST API.');
    } else {
      setTestResult(`Backend unreachable: ${backendState.error || 'Server is offline or port 3000 is down.'}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 animate-fadeIn" id="settings-view">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & System Configuration
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure API endpoints, manage data export backups, and adjust library rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Express API Configuration Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Server size={19} className="text-indigo-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Express API Integration</h3>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                backendState.isConnected
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              {backendState.isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Bibliotech connects to the companion Express + MongoDB API (<strong>lbms-api</strong>) running on port 3000.
            When connected, book additions, edits, and deletions sync with MongoDB.
          </p>

          <form onSubmit={handleSaveUrl} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="backend-url-input">
                API Base URL
              </label>
              <div className="flex gap-2">
                <input
                  id="backend-url-input"
                  type="text"
                  className="flex-1 h-9 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="http://localhost:3000/api/v1"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                  id="save-api-url-btn"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                onClick={handleTestConnection}
                disabled={backendState.isChecking}
                id="test-connection-btn"
              >
                <Server size={14} />
                <span>Test Link</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm cursor-pointer"
                onClick={() => syncWithBackend()}
                disabled={backendState.isChecking}
                id="sync-now-btn"
              >
                <RefreshCw size={13} className={backendState.isChecking ? 'animate-spin' : ''} />
                <span>{backendState.isChecking ? 'Syncing...' : 'Sync Books'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  backendState.isConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                }`}
              >
                {backendState.isConnected ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{testResult}</span>
              </div>
            )}

            {backendState.lastSyncedAt && (
              <div className="text-[11px] text-slate-400">
                Last synchronized: {backendState.lastSyncedAt}
              </div>
            )}
          </form>
        </div>

        {/* Data Import/Export & Backup */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <Database size={19} className="text-cyan-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Backups & Data Portability</h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Download full snapshots of your inventory, active loans, and cardholder registries.
          </p>

          <div className="space-y-3">
            <button
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
              onClick={exportCatalogCsv}
              id="export-csv-setting-btn"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Download size={15} />
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">Export Catalog (CSV)</div>
                <div className="text-[11px] text-slate-400">Spreadsheet-compatible data file</div>
              </div>
            </button>

            <button
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
              onClick={exportCatalogJson}
              id="export-json-setting-btn"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Download size={15} />
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">Export Full Database (JSON)</div>
                <div className="text-[11px] text-slate-400">Complete raw record archive</div>
              </div>
            </button>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-rose-500">
                Danger Zone: Factory Reset
              </h4>
              <p className="text-[11px] text-slate-400">
                Restores the standard 10 classic computer science and literature books.
              </p>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer"
                onClick={onRequestResetData}
                id="reset-demo-data-btn"
              >
                <RotateCcw size={13} />
                <span>Reset to Sample Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* System & Rules Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Appearance & Rules</h3>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex items-center justify-between pt-2 first:pt-0">
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">Display Theme</div>
                <div className="text-[11px] text-slate-400">
                  {theme === 'dark' ? 'Obsidian Dark' : 'Clean Light'}
                </div>
              </div>

              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                onClick={toggleTheme}
                id="setting-toggle-theme-btn"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={14} className="text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-indigo-600" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">Default Loan Window</div>
                <div className="text-[11px] text-slate-400">Patron checkout duration</div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                14 Days
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">Overdue Fine Charge</div>
                <div className="text-[11px] text-slate-400">Per-day penalty accrual</div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                $0.50 / day
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
