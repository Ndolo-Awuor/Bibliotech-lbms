import React from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import {
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  ArrowUpRight,
  Plus,
  ArrowLeftRight,
  TrendingUp,
  Download,
  RotateCcw,
  BookMarked,
} from "lucide-react";

interface DashboardViewProps {
  onOpenAddBook: () => void;
  onOpenIssueBook: () => void;
  onOpenAddMember: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddBook,
  onOpenIssueBook,
  onOpenAddMember,
}) => {
  const { books, loans, stats, activities, returnBook, exportCatalogCsv } =
    useLibrary();

  const navigate = useNavigate();

  // Overdue loans
  const overdueLoans = loans.filter(
    (l) =>
      l.status === "overdue" ||
      (l.status === "active" && new Date(l.dueDate) < new Date()),
  );

  // Category breakdown
  const categoryCounts = books.reduce(
    (acc, book) => {
      const genre = book.genre || "General";
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const sortedCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const availabilityPercent =
    stats.totalCopies > 0
      ? Math.round((stats.availableCopies / stats.totalCopies) * 100)
      : 0;

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 lg:space-y-8 animate-fadeIn"
      id="dashboard-view"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Library Command Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time circulation, catalogue inventory turnover, and patron
            analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            onClick={exportCatalogCsv}
            id="dash-export-csv-btn"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            onClick={onOpenIssueBook}
            id="dash-quick-issue-btn"
          >
            <ArrowLeftRight size={15} />
            <span>Issue Loan</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        aria-label="Key Metrics"
      >
        {/* Total Titles */}
        <div
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
          id="card-stat-books"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Titles
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {stats.totalBooks}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {stats.totalCopies}
            </span>
            <span>total physical volumes</span>
          </div>
        </div>

        {/* Available Copies */}
        <div
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
          id="card-stat-available"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Available Copies
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            {stats.availableCopies}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {availabilityPercent}%
            </span>
            <span>shelf availability rate</span>
          </div>
        </div>

        {/* Active Loans */}
        <div
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
          id="card-stat-loans"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Loans
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-cyan-600 dark:text-cyan-400">
            {stats.activeLoansCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Books out with patrons</span>
          </div>
        </div>

        {/* Overdue Items */}
        <div
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
          id="card-stat-overdue"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Overdue Items
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div
            className={`text-3xl font-extrabold tracking-tight ${
              stats.overdueLoansCount > 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-900 dark:text-white"
            }`}
          >
            {stats.overdueLoansCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              ${stats.totalFinesPending.toFixed(2)}
            </span>
            <span>in late fines</span>
          </div>
        </div>

        {/* Patrons */}
        <div
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
          id="card-stat-members"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Patrons Enrolled
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {stats.totalMembers}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Verified cardholders</span>
          </div>
        </div>
      </section>

      {/* Urgent Overdue Alert Section */}
      {overdueLoans.length > 0 && (
        <section
          className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-2xl p-5 sm:p-6 space-y-4"
          id="overdue-alerts-banner"
          aria-label="Overdue Loans Alert"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-500/30">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Attention: {overdueLoans.length} Loans Require Action
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Deadlines have passed. Fines are actively accruing at
                  $0.50/day.
                </p>
              </div>
            </div>

            <button
              className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
              onClick={() => navigate("/circulation")}
              id="view-circulation-overdue-btn"
            >
              <span>Manage Circulation</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {overdueLoans.slice(0, 3).map((loan) => (
              <div
                key={loan.id}
                className="bg-white/70 dark:bg-slate-900/60 border border-rose-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {loan.bookTitle}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {loan.memberName} • Due: {loan.dueDate}
                  </div>
                </div>
                <button
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer"
                  onClick={() => returnBook(loan.id)}
                  title="Mark returned"
                  id={`quick-return-${loan.id}`}
                >
                  <RotateCcw size={12} />
                  <span>Return</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Quick Actions & Categories */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors cursor-pointer group"
                onClick={onOpenIssueBook}
                id="qa-issue-book"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ArrowLeftRight size={17} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    Check Out
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Issue to patron
                  </div>
                </div>
              </button>

              <button
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors cursor-pointer group"
                onClick={onOpenAddBook}
                id="qa-add-book"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Plus size={17} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    New Book
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Add to catalog
                  </div>
                </div>
              </button>

              <button
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors cursor-pointer group"
                onClick={onOpenAddMember}
                id="qa-add-member"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users size={17} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    New Patron
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Register user
                  </div>
                </div>
              </button>

              <button
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors cursor-pointer group"
                onClick={() => navigate("/catalog")}
                id="qa-browse-catalog"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookMarked size={17} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    Catalog
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Browse inventory
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Genre Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Top Categories
              </h3>
              <span className="text-xs text-slate-400">
                Inventory Distribution
              </span>
            </div>

            <div className="space-y-3.5">
              {sortedCategories.map(([category, count], idx) => {
                const percent = Math.round((count / (books.length || 1)) * 100);
                const colors = [
                  "bg-gradient-to-r from-indigo-500 to-cyan-400",
                  "bg-gradient-to-r from-emerald-500 to-teal-400",
                  "bg-gradient-to-r from-amber-500 to-orange-400",
                  "bg-gradient-to-r from-purple-500 to-pink-400",
                  "bg-gradient-to-r from-blue-500 to-indigo-500",
                ];
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {category}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {count} titles ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              From API
            </span>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/80">
            {activities.slice(0, 7).map((activity) => (
              <div
                key={activity.id}
                className="pt-3 first:pt-0 flex items-start gap-3.5"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    activity.type === "borrow"
                      ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500"
                      : activity.type === "return"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500"
                        : activity.type === "add_book"
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {activity.type === "borrow" && <Clock size={14} />}
                  {activity.type === "return" && <RotateCcw size={14} />}
                  {activity.type === "add_book" && <BookOpen size={14} />}
                  {activity.type === "add_member" && <Users size={14} />}
                  {activity.type === "sync" && <RotateCcw size={14} />}
                  {activity.type === "delete_book" && (
                    <AlertTriangle size={14} />
                  )}
                  {activity.type === "update_book" && <BookMarked size={14} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {activity.title}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
