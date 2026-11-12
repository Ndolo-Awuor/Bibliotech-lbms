import React, { useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { LibraryProvider, useLibrary } from "./context/LibraryContext";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { CatalogView } from "./components/CatalogView";
import { CirculationView } from "./components/CirculationView";
import { MembersView } from "./components/MembersView";
import { AnalyticsView } from "./components/AnalyticsView";
import { SettingsView } from "./components/SettingsView";
import { ToastContainer } from "./components/ToastContainer";
import { BookModal } from "./components/Modals/BookModal";
import { BookDetailModal } from "./components/Modals/BookDetailModal";
import { IssueBookModal } from "./components/Modals/IssueBookModal";
import { MemberModal } from "./components/Modals/MemberModal";
import { ConfirmModal } from "./components/Modals/ConfirmModal";
import { Book, Member, BookFormData, MemberFormData } from "./types";

const MainLayout: React.FC = () => {
  const {
    addBook,
    updateBook,
    deleteBook,
    addMember,
    updateMember,
    deleteMember,
    resetToDemoData,
  } = useLibrary();

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Book Modal State
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Book Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [inspectingBook, setInspectingBook] = useState<Book | null>(null);

  // Issue Book Modal State
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issuePreselectedBook, setIssuePreselectedBook] = useState<Book | null>(
    null,
  );
  const [issuePreselectedMember, setIssuePreselectedMember] =
    useState<Member | null>(null);

  // Member Modal State
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDanger: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    isDanger: false,
    onConfirm: () => {},
  });

  // Handlers for Book Modals
  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookModalOpen(true);
  };

  const handleOpenEditBook = (book: Book) => {
    setEditingBook(book);
    setBookModalOpen(true);
  };

  const handleSaveBook = async (formData: BookFormData): Promise<boolean> => {
    const result = editingBook
      ? await updateBook(editingBook._id, formData)
      : await addBook(formData);

    return result !== null;
  };

  const handleOpenBookDetail = (book: Book) => {
    setInspectingBook(book);
    setDetailModalOpen(true);
  };

  const handleRequestDeleteBook = (book: Book) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Book from Catalog",
      message: `Remove "${book.title}" by ${book.author} from the catalog? Books with loan history cannot be deleted.`,
      confirmLabel: "Delete Book",
      isDanger: true,
      onConfirm: () => deleteBook(book._id),
    });
  };

  // Handlers for Issue Book Modal
  const handleOpenIssueBook = (
    preselectedBook?: Book | null,
    preselectedMember?: Member | null,
  ) => {
    setIssuePreselectedBook(preselectedBook || null);
    setIssuePreselectedMember(preselectedMember || null);
    setIssueModalOpen(true);
  };

  // Handlers for Member Modals
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberModalOpen(true);
  };

  const handleOpenEditMember = (member: Member) => {
    setEditingMember(member);
    setMemberModalOpen(true);
  };

  const handleSaveMember = async (
    formData: MemberFormData,
  ): Promise<boolean> => {
    if (editingMember) {
      return (await updateMember(editingMember.id, formData)) !== null;
    }

    return (await addMember(formData)) !== null;
  };

  const handleRequestDeleteMember = (member: Member) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Patron Record",
      message: `Are you sure you want to delete ${member.name} (${member.membershipNumber})?`,
      confirmLabel: "Remove Member",
      isDanger: true,
      onConfirm: () => deleteMember(member.id),
    });
  };

  const handleRequestResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset to Sample Demonstration Data",
      message:
        "This will restore the original 10 classic computer science and literature volumes, sample cardholders, and loans. Custom items will be reset.",
      confirmLabel: "Reset Database",
      isDanger: true,
      onConfirm: () => resetToDemoData(),
    });
  };

  return (
    <div
      className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative selection:bg-indigo-500 selection:text-white"
      id="app-root-container"
    >
      {/* Decorative ambient background glows */}
      <div className="fixed top-[-100px] right-[-100px] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[200px] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <main
        className="flex-1 flex flex-col min-w-0 relative z-10"
        id="main-content-viewport"
      >
        <Header
          onOpenMobile={() => setMobileMenuOpen(true)}
          onOpenAddBook={handleOpenAddBook}
          onOpenIssueBook={() => handleOpenIssueBook()}
        />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardView
                  onOpenAddBook={handleOpenAddBook}
                  onOpenIssueBook={() => handleOpenIssueBook()}
                  onOpenAddMember={handleOpenAddMember}
                />
              }
            />
            <Route
              path="/catalog"
              element={
                <CatalogView
                  onOpenAddBook={handleOpenAddBook}
                  onOpenEditBook={handleOpenEditBook}
                  onOpenBookDetail={handleOpenBookDetail}
                  onOpenIssueBookWithBook={(b) => handleOpenIssueBook(b)}
                  onRequestDeleteBook={handleRequestDeleteBook}
                />
              }
            />
            <Route
              path="/circulation"
              element={
                <CirculationView
                  onOpenIssueBook={() => handleOpenIssueBook()}
                />
              }
            />
            <Route
              path="/members"
              element={
                <MembersView
                  onOpenAddMember={handleOpenAddMember}
                  onOpenEditMember={handleOpenEditMember}
                  onOpenIssueBookToMember={(m) => handleOpenIssueBook(null, m)}
                  onRequestDeleteMember={handleRequestDeleteMember}
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route
              path="/settings"
              element={
                <SettingsView onRequestResetData={handleRequestResetData} />
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {/* Floating Modals */}
      <BookModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        onSubmit={handleSaveBook}
        initialBook={editingBook}
      />

      <BookDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        book={inspectingBook}
        onOpenEdit={(b) => handleOpenEditBook(b)}
        onOpenIssue={(b) => handleOpenIssueBook(b)}
      />

      <IssueBookModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        preselectedBook={issuePreselectedBook}
        preselectedMember={issuePreselectedMember}
      />

      <MemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        onSubmit={handleSaveMember}
        initialMember={editingMember}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDanger={confirmModal.isDanger}
      />

      {/* Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <LibraryProvider>
        <MainLayout />
      </LibraryProvider>
    </HashRouter>
  );
}
