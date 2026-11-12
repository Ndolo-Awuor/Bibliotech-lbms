import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { Search, Plus, ArrowLeftRight, Menu, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onOpenMobile: () => void;
  onOpenAddBook: () => void;
  onOpenIssueBook: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobile,
  onOpenAddBook,
  onOpenIssueBook,
}) => {
  const { searchQuery, setSearchQuery, backendState } = useLibrary();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: pressing '/' or 'Cmd+K' / 'Ctrl+K' focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    navigate('/catalog');
  };

  return (
    <header
      className="h-17 px-4 lg:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30"
      id="app-top-header"
    >
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={onOpenMobile}
          aria-label="Open mobile menu"
          id="mobile-nav-toggle-btn"
        >
          <Menu size={22} />
        </button>

        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            className="w-full h-10 pl-10 pr-9 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-full text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
            placeholder="Search titles, authors, genres, ISBNs..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            id="global-search-input"
            aria-label="Global Search"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 pointer-events-none">
            /
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Backend Quick Status Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            backendState.isConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
          }`}
          id="header-api-badge"
          title={`Backend status: ${backendState.isConnected ? 'Connected to http://localhost:3000' : 'Offline / Standalone mode'}`}
        >
          {backendState.isConnected ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{backendState.isConnected ? 'API Live' : 'Local Mode'}</span>
        </div>

        {/* Issue Book CTA */}
        <button
          className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
          onClick={onOpenIssueBook}
          id="header-issue-book-btn"
        >
          <ArrowLeftRight size={15} className="text-cyan-500" />
          <span className="hidden sm:inline">Issue Book</span>
        </button>

        {/* Add Book CTA */}
        <button
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-98 transition-all cursor-pointer"
          onClick={onOpenAddBook}
          id="header-add-book-btn"
        >
          <Plus size={16} />
          <span>Add Book</span>
        </button>
      </div>
    </header>
  );
};
