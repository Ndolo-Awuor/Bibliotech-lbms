import React from 'react';
import { Book } from '../../types';
import { useLibrary } from '../../context/LibraryContext';
import {
  X,
  ArrowLeftRight,
  Edit2,
  Clock,
  UserCheck
} from 'lucide-react';

interface BookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onOpenEdit: (book: Book) => void;
  onOpenIssue: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  isOpen,
  onClose,
  book,
  onOpenEdit,
  onOpenIssue,
}) => {
  const { loans } = useLibrary();

  if (!isOpen || !book) return null;

  const activeBookLoans = loans.filter(
    (l) => l.bookId === book._id && (l.status === 'active' || l.status === 'overdue')
  );

  const isAvailable = book.availableCopies > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      id="book-detail-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="book-detail-dialog"
      >
        {/* Cover Spine Visual Header */}
        <div
          className="h-36 relative p-5 flex flex-col justify-between overflow-hidden text-white"
          style={{
            background: book.coverGradient || 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10">
              {book.genre || 'General'}
            </span>

            <button
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
              onClick={onClose}
              aria-label="Close"
              id="close-detail-modal-btn"
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
                {book.title}
              </h2>
              <div className="text-xs text-white/80 mt-0.5">by {book.author}</div>
            </div>

            <span
              className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${
                isAvailable
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-rose-500/90 text-white'
              }`}
            >
              {book.availableCopies} of {book.totalCopies} Available
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {book.description ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {book.description}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No description recorded for this volume.
            </p>
          )}

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">ISBN-13</div>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">
                {book.isbn || 'N/A'}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Year</div>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                {book.publishedYear || '—'}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Pages</div>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                {book.pages ? `${book.pages} pp` : '—'}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Shelf Stacks</div>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                {book.shelfLocation || 'General'}
              </div>
            </div>
          </div>

          {/* Active Borrowers Section */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Borrowers ({activeBookLoans.length})
            </h4>
            {activeBookLoans.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                All copies are currently restocked on the shelf.
              </p>
            ) : (
              <div className="space-y-2">
                {activeBookLoans.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} className="text-cyan-500" />
                      <span className="font-semibold text-slate-900 dark:text-white">{l.memberName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={13} />
                      <span>Due {l.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            onClick={() => {
              onClose();
              onOpenEdit(book);
            }}
            id="detail-modal-edit-btn"
          >
            <Edit2 size={14} />
            <span>Edit Book</span>
          </button>

          <button
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              isAvailable
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
            disabled={!isAvailable}
            onClick={() => {
              onClose();
              onOpenIssue(book);
            }}
            id="detail-modal-issue-btn"
          >
            <ArrowLeftRight size={14} />
            <span>{isAvailable ? 'Check Out This Book' : 'All Copies Borrowed'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
