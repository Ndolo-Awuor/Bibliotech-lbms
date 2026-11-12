import React, { useState, useEffect } from "react";
import { useLibrary } from "../../context/LibraryContext";
import { Book, Member } from "../../types";
import { X, ArrowLeftRight, Calendar, AlertCircle } from "lucide-react";

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBook?: Book | null;
  preselectedMember?: Member | null;
}

export const IssueBookModal: React.FC<IssueBookModalProps> = ({
  isOpen,
  onClose,
  preselectedBook,
  preselectedMember,
}) => {
  const { books, members, issueBook } = useLibrary();

  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [durationDays, setDurationDays] = useState<number>(14);
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableBooks = books.filter((b) => b.availableCopies > 0);

  useEffect(() => {
    if (preselectedBook) {
      setSelectedBookId(preselectedBook._id);
    } else if (availableBooks.length > 0) {
      setSelectedBookId(availableBooks[0]._id);
    }

    if (preselectedMember) {
      setSelectedMemberId(preselectedMember.id);
    } else if (members.length > 0) {
      const activeMember =
        members.find((m) => m.status === "active") || members[0];
      setSelectedMemberId(activeMember.id);
    }

    setDurationDays(14);
    setNotes("");
    setError(null);
  }, [isOpen, preselectedBook, preselectedMember, books, members]);

  if (!isOpen) return null;

  const selectedBook = books.find((b) => b._id === selectedBookId);
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const projectedDueDate = new Date(
    Date.now() + durationDays * 86400000,
  ).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedBookId) {
      setError("Please select a book to issue");
      return;
    }
    if (!selectedMemberId) {
      setError("Please select a library patron");
      return;
    }
    if (selectedMember?.status !== "active") {
      setError("Only active patrons can borrow books.");
      return;
    }
    if (selectedBook && selectedBook.availableCopies <= 0) {
      setError("No physical copies are currently available.");
      return;
    }

    setIsSubmitting(true);
    try {
      const loan = await issueBook(
        selectedBookId,
        selectedMemberId,
        durationDays,
        notes,
      );
      if (loan) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      id="issue-book-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="issue-book-dialog"
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 flex items-center justify-center">
              <ArrowLeftRight size={17} />
            </div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              Issue Book Loan
            </h2>
          </div>
          <button
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
            id="close-issue-modal-btn"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-5 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Select Book */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="issue-select-book"
              >
                Select Book Title *
              </label>
              <select
                id="issue-select-book"
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
              >
                {books.map((b) => (
                  <option
                    key={b._id}
                    value={b._id}
                    disabled={b.availableCopies <= 0}
                  >
                    {b.title} ({b.availableCopies} of {b.totalCopies} available)
                  </option>
                ))}
              </select>
            </div>

            {/* Select Member */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="issue-select-member"
              >
                Select Patron *
              </label>
              <select
                id="issue-select-member"
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.membershipNumber}){" "}
                    {m.status === "suspended" ? "— [SUSPENDED]" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Checkout Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[7, 14, 21, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      durationDays === days
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                    onClick={() => setDurationDays(days)}
                    id={`duration-${days}-btn`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Projected Due Date Banner */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar size={15} className="text-cyan-500" />
                <span>Calculated Due Date:</span>
              </div>
              <strong className="text-cyan-600 dark:text-cyan-400 font-bold">
                {projectedDueDate}
              </strong>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="issue-notes-input"
              >
                Lending Notes (Optional)
              </label>
              <input
                id="issue-notes-input"
                type="text"
                className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="e.g. Reference copy for thesis research"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
              onClick={onClose}
              id="cancel-issue-modal-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/25 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 cursor-pointer"
              disabled={
                isSubmitting ||
                !selectedBook ||
                selectedBook.availableCopies <= 0 ||
                selectedMember?.status !== "active"
              }
              id="confirm-issue-loan-btn"
            >
              <ArrowLeftRight size={14} />
              <span>{isSubmitting ? "Issuing..." : "Confirm & Issue"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
