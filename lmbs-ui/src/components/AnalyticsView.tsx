import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import {
  PieChart,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  Download,
  TrendingUp
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { books, loans, members, stats, exportCatalogCsv } = useLibrary();

  // Compute most borrowed books
  const bookBorrowCounts = loans.reduce((acc, loan) => {
    acc[loan.bookTitle] = (acc[loan.bookTitle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topBooks = Object.entries(bookBorrowCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Compute patron activity
  const memberBorrowCounts = loans.reduce((acc, loan) => {
    acc[loan.memberName] = (acc[loan.memberName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topMembers = Object.entries(memberBorrowCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Genre distribution
  const genreCounts = books.reduce((acc, b) => {
    const g = b.genre || 'General';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedGenres = Object.entries(genreCounts).sort(([, a], [, b]) => b - a);

  const totalCompleted = loans.filter((l) => l.status === 'returned').length;
  const returnRatePercent = loans.length > 0
    ? Math.round((totalCompleted / loans.length) * 100)
    : 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 animate-fadeIn" id="analytics-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics & Collection Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Circulation metrics, patron tendencies, and catalog balance breakdown.
          </p>
        </div>

        <button
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
          onClick={exportCatalogCsv}
          id="analytics-export-btn"
        >
          <Download size={15} />
          <span>Export Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Loan Events</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{loans.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">All recorded borrowings</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Return Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">{returnRatePercent}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{totalCompleted} successfully returned</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Shelf Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {stats.totalCopies > 0
              ? `${Math.round(((stats.totalCopies - stats.availableCopies) / stats.totalCopies) * 100)}%`
              : '0%'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {stats.totalCopies - stats.availableCopies} of {stats.totalCopies} copies in hands
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Patron Engagement</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {members.length > 0
              ? `${Math.round((Object.keys(memberBorrowCounts).length / members.length) * 100)}%`
              : '0%'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">of patrons actively borrowing</div>
        </div>
      </div>

      {/* Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-indigo-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Domain Balance</h3>
            </div>
            <span className="text-xs text-slate-400">{sortedGenres.length} categories</span>
          </div>

          <div className="space-y-3.5">
            {sortedGenres.map(([genre, count], index) => {
              const percent = Math.round((count / (books.length || 1)) * 100);
              const colors = [
                'bg-gradient-to-r from-indigo-500 to-cyan-500',
                'bg-gradient-to-r from-emerald-500 to-teal-500',
                'bg-gradient-to-r from-amber-500 to-orange-500',
                'bg-gradient-to-r from-purple-500 to-pink-500',
                'bg-gradient-to-r from-blue-500 to-indigo-500',
                'bg-gradient-to-r from-rose-500 to-red-500',
              ];
              return (
                <div key={genre} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{genre}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {count} titles ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Borrowed Titles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Top Borrowed Books</h3>
            </div>
            <span className="text-xs text-slate-400">Leaderboard</span>
          </div>

          <div className="space-y-2.5">
            {topBooks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No checkout records recorded.</p>
            ) : (
              topBooks.map(([title, count], idx) => (
                <div
                  key={title}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        idx === 0
                          ? 'bg-amber-500 text-black font-extrabold'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate">{title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                    {count} {count === 1 ? 'loan' : 'loans'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Active Patrons */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-cyan-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Top Active Patrons</h3>
            </div>
            <span className="text-xs text-slate-400">Cardholder Ranking</span>
          </div>

          <div className="space-y-2.5">
            {topMembers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active borrow events recorded.</p>
            ) : (
              topMembers.map(([name, count], idx) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate">{name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-semibold shrink-0">
                    {count} books
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
