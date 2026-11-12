import React, { useState, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import {
  Clock,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  RefreshCw
} from 'lucide-react';

interface CirculationViewProps {
  onOpenIssueBook: () => void;
}

export const CirculationView: React.FC<CirculationViewProps> = ({ onOpenIssueBook }) => {
  const { loans, returnBook, renewLoan, stats } = useLibrary();

  const [activeSubTab, setActiveSubTab] = useState<'active' | 'overdue' | 'returned' | 'all'>('active');
  const [filterQuery, setFilterQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const isOverdue = loan.status === 'overdue' || (loan.status === 'active' && loan.dueDate < todayStr);

      if (activeSubTab === 'active' && (loan.status !== 'active' || isOverdue)) {
        return false;
      }
      if (activeSubTab === 'overdue' && !isOverdue) {
        return false;
      }
      if (activeSubTab === 'returned' && loan.status !== 'returned') {
        return false;
      }

      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase();
        const matchTitle = loan.bookTitle.toLowerCase().includes(q);
        const matchMember = loan.memberName.toLowerCase().includes(q);
        const matchEmail = loan.memberEmail.toLowerCase().includes(q);
        if (!matchTitle && !matchMember && !matchEmail) return false;
      }

      return true;
    });
  }, [loans, activeSubTab, filterQuery, todayStr]);

  const calculateDaysRemaining = (dueDate: string) => {
    const dueTime = new Date(dueDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 animate-fadeIn" id="circulation-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Circulation & Lending Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage checkouts, process book returns, calculate fines, and grant extensions.
          </p>
        </div>

        <button
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          onClick={onOpenIssueBook}
          id="circ-issue-book-btn"
        >
          <Plus size={16} />
          <span>Issue New Loan</span>
        </button>
      </div>

      {/* Lending Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Checked Out</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeLoansCount}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Items</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${stats.overdueLoansCount > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
            {stats.overdueLoansCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Late Fines</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold">
              $
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-500">
            ${stats.totalFinesPending.toFixed(2)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Returns</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {loans.filter((l) => l.status === 'returned').length}
          </div>
        </div>
      </div>

      {/* Circulation Sub-Navigation & Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'active'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setActiveSubTab('active')}
            id="tab-circ-active"
          >
            <span>Active Loans ({loans.filter((l) => l.status === 'active' && l.dueDate >= todayStr).length})</span>
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setActiveSubTab('overdue')}
            id="tab-circ-overdue"
          >
            <span>Overdue ({stats.overdueLoansCount})</span>
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'returned'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setActiveSubTab('returned')}
            id="tab-circ-returned"
          >
            <span>Return History</span>
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setActiveSubTab('all')}
            id="tab-circ-all"
          >
            <span>All ({loans.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            placeholder="Search loans..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            id="circulation-search-input"
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm" id="circulation-table-container">
        {filteredLoans.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No circulation records found in this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3.5">Book Title</th>
                  <th className="px-5 py-3.5">Patron</th>
                  <th className="px-5 py-3.5">Checkout Date</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Fine Amount</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredLoans.map((loan) => {
                  const daysRem = calculateDaysRemaining(loan.dueDate);
                  const isOverdue = loan.status === 'overdue' || (loan.status === 'active' && daysRem < 0);
                  const fine = isOverdue ? Math.abs(daysRem) * 0.5 : 0;

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors" id={`loan-row-${loan.id}`}>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{loan.bookTitle}</div>
                        <div className="text-xs text-slate-400">by {loan.bookAuthor}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{loan.memberName}</div>
                        <div className="text-xs text-slate-400">{loan.memberEmail}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{loan.borrowDate}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">{loan.dueDate}</div>
                        {loan.status !== 'returned' && (
                          <div
                            className={`text-[11px] font-medium mt-0.5 ${
                              isOverdue
                                ? 'text-rose-500 font-bold'
                                : daysRem <= 3
                                ? 'text-amber-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {isOverdue ? `${Math.abs(daysRem)} days overdue` : `${daysRem} days left`}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            loan.status === 'returned'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              : isOverdue
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {loan.status === 'returned'
                            ? `Returned on ${loan.returnDate}`
                            : isOverdue
                            ? 'Overdue'
                            : 'Active Loan'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {loan.status !== 'returned' && isOverdue ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">
                            ${fine.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {loan.status !== 'returned' ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
                              onClick={() => renewLoan(loan.id, 7)}
                              title="Extend by 7 days"
                              id={`renew-loan-${loan.id}`}
                            >
                              <RefreshCw size={12} />
                              <span>Renew</span>
                            </button>
                            <button
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
                              onClick={() => returnBook(loan.id)}
                              title="Process return"
                              id={`return-loan-${loan.id}`}
                            >
                              <RotateCcw size={12} />
                              <span>Return</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
