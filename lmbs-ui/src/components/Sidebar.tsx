import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Users,
  BarChart3,
  Settings,
  BookMarked,
  Sun,
  Moon,
  RefreshCw,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    stats,
    backendState,
    syncWithBackend,
    theme,
    toggleTheme,
  } = useLibrary();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/30 font-semibold shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-68 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
        id="main-sidebar"
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 group"
            onClick={onCloseMobile}
          >
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform"
              id="brand-logo-icon"
            >
              <BookMarked size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                Bibliotech
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                LMBS Cloud
              </span>
            </div>
          </NavLink>

          {mobileOpen && (
            <button
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={onCloseMobile}
              aria-label="Close menu"
              id="close-mobile-menu-btn"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3.5 space-y-1" aria-label="Primary Navigation">
          <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-3 pt-2 pb-1.5">
            Management
          </div>

          <NavLink
            to="/dashboard"
            className={getNavLinkClass}
            onClick={onCloseMobile}
            id="nav-dashboard-btn"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/catalog"
            className={getNavLinkClass}
            onClick={onCloseMobile}
            id="nav-catalog-btn"
          >
            <BookOpen size={18} />
            <span>Books Catalog</span>
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              id="badge-total-books"
            >
              {stats.totalBooks}
            </span>
          </NavLink>

          <NavLink
            to="/circulation"
            className={getNavLinkClass}
            onClick={onCloseMobile}
            id="nav-circulation-btn"
          >
            <ArrowLeftRight size={18} />
            <span>Circulation</span>
            {stats.activeLoansCount > 0 && (
              <span
                className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                  stats.overdueLoansCount > 0
                    ? 'bg-rose-500 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                }`}
                id="badge-active-loans"
              >
                {stats.activeLoansCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/members"
            className={getNavLinkClass}
            onClick={onCloseMobile}
            id="nav-members-btn"
          >
            <Users size={18} />
            <span>Patron Directory</span>
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              id="badge-total-members"
            >
              {stats.totalMembers}
            </span>
          </NavLink>

          <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-3 pt-4 pb-1.5">
            Insights & System
          </div>

          <NavLink
            to="/analytics"
            className={getNavLinkClass}
            onClick={onCloseMobile}
            id="nav-analytics-btn"
          >
            <BarChart3 size={18} />
            <span>Analytics & Reports</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={getNavLinkClass}
            onClick={onCloseMobile}
            id="nav-settings-btn"
          >
            <Settings size={18} />
            <span>Settings & API</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* API Health Pill */}
          <div
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
            id="api-status-indicator"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendState.isChecking
                    ? 'bg-cyan-500 animate-pulse'
                    : backendState.isConnected
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : 'bg-amber-500 shadow-sm shadow-amber-500/50'
                }`}
              />
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-200">
                  {backendState.isChecking
                    ? 'Checking API...'
                    : backendState.isConnected
                    ? 'API Connected'
                    : 'Offline (Local)'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {backendState.isConnected ? ':3000 REST' : 'Cached Store'}
                </div>
              </div>
            </div>

            <button
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => syncWithBackend()}
              title="Sync with Express Backend"
              id="sidebar-sync-btn"
              disabled={backendState.isChecking}
            >
              <RefreshCw size={13} className={backendState.isChecking ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Theme Switcher Button */}
          <button
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-xs transition-colors shadow-sm cursor-pointer"
            onClick={toggleTheme}
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} className="text-amber-400" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-indigo-600" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
