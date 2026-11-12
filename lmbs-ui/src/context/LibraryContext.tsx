import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Book,
  BookFormData,
  Member,
  MemberFormData,
  Loan,
  ActivityItem,
  ToastMessage,
  NavigationTab,
  BackendSyncState,
} from "../types";
import {
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_LOANS,
  INITIAL_ACTIVITIES,
} from "../services/seedData";
import { apiService } from "../services/api";

interface LibraryContextType {
  books: Book[];
  members: Member[];
  loans: Loan[];
  activities: ActivityItem[];
  theme: "dark" | "light";
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  backendState: BackendSyncState;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  checkBackendConnection: () => Promise<boolean>;
  syncWithBackend: () => Promise<void>;
  updateApiUrl: (url: string) => void;

  // Book operations
  addBook: (data: BookFormData) => Promise<Book | null>;
  updateBook: (id: string, data: Partial<BookFormData>) => Promise<Book | null>;
  deleteBook: (id: string) => Promise<void>;
  getBookById: (id: string) => Book | undefined;

  // Member operations
  addMember: (data: MemberFormData) => Promise<Member | null>;
  updateMember: (
    id: string,
    data: Partial<MemberFormData>,
  ) => Promise<Member | null>;
  deleteMember: (id: string) => Promise<void>;
  getMemberById: (id: string) => Member | undefined;

  // Circulation operations
  issueBook: (
    bookId: string,
    memberId: string,
    days?: number,
    notes?: string,
  ) => Promise<Loan | null>;
  returnBook: (loanId: string) => Promise<void>;
  renewLoan: (loanId: string, days?: number) => Promise<void>;

  // Quick utilities
  resetToDemoData: () => void;
  exportCatalogJson: () => void;
  exportCatalogCsv: () => void;

  // Calculated stats
  stats: {
    totalBooks: number;
    availableCopies: number;
    totalCopies: number;
    activeLoansCount: number;
    overdueLoansCount: number;
    totalMembers: number;
    totalFinesPending: number;
  };
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: "lmbs_books",
  MEMBERS: "lmbs_members",
  LOANS: "lmbs_loans",
  ACTIVITIES: "lmbs_activities",
  THEME: "lmbs_theme",
  API_URL: "lmbs_api_url",
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "dark";
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Primary Entities with LocalStorage caching
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BOOKS;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MEMBERS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_LOANS;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ACTIVITIES;
  });

  // Backend Sync State
  const [backendState, setBackendState] = useState<BackendSyncState>({
    apiUrl: apiService.getBaseUrl(),
    isConnected: false,
    isChecking: false,
    lastSyncedAt: null,
    syncMode: "auto",
    error: null,
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const addActivity = useCallback(
    (type: ActivityItem["type"], title: string, description: string) => {
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        type,
        title,
        description,
        timestamp: "Just now",
      };
      setActivities((prev) => [newActivity, ...prev.slice(0, 49)]);
    },
    [],
  );

  // Check Backend Status
  const checkBackendConnection = useCallback(async (): Promise<boolean> => {
    setBackendState((prev) => ({ ...prev, isChecking: true, error: null }));
    const result = await apiService.checkConnection();
    setBackendState((prev) => ({
      ...prev,
      isChecking: false,
      isConnected: result.connected,
      error: result.error || null,
    }));
    return result.connected;
  }, []);

  // On initial mount, test connection
  useEffect(() => {
    checkBackendConnection().then(async (connected) => {
      if (!connected) return;

      try {
        const [remoteBooks, remoteMembers, remoteLoans, remoteActivities] =
          await Promise.all([
            apiService.getBooks(),
            apiService.getMembers(),
            apiService.getLoans(),
            apiService.getActivities(),
          ]);
        setBooks(remoteBooks);
        setMembers(remoteMembers);
        setLoans(remoteLoans);
        setActivities(remoteActivities);
        addToast({
          type: "success",
          title: "Connected to Backend API",
          message: `Loaded ${remoteBooks.length} books, ${remoteMembers.length} patrons, and ${remoteLoans.length} loans from PostgreSQL.`,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Could not load books";
        setBackendState((prev) => ({
          ...prev,
          isConnected: false,
          error: message,
        }));
        addToast({ type: "error", title: "Book Load Failed", message });
      }
    });
  }, [checkBackendConnection, backendState.apiUrl, addToast]);

  useEffect(() => {
    if (!backendState.isConnected) return;

    let cancelled = false;

    void apiService
      .getActivities()
      .then((items) => {
        if (!cancelled) setActivities(items);
      })
      .catch((error: unknown) => {
        console.error("Could not refresh activity", error);
      });

    return () => {
      cancelled = true;
    };
  }, [backendState.isConnected, backendState.apiUrl, books, members, loans]);

  const updateApiUrl = (url: string) => {
    apiService.setBaseUrl(url);
    setBackendState((prev) => ({ ...prev, apiUrl: url }));
    checkBackendConnection();
  };

  // Sync books with backend
  const syncWithBackend = async () => {
    try {
      setBackendState((prev) => ({ ...prev, isChecking: true }));
      const isOnline = await checkBackendConnection();
      if (!isOnline) {
        addToast({
          type: "warning",
          title: "Backend API Unreachable",
          message: "Running in offline mode with persisted local storage.",
        });
        return;
      }

      const [remoteBooks, remoteMembers, remoteLoans, remoteActivities] =
        await Promise.all([
          apiService.getBooks(),
          apiService.getMembers(),
          apiService.getLoans(),
          apiService.getActivities(),
        ]);
      setBooks(remoteBooks);
      setMembers(remoteMembers);
      setLoans(remoteLoans);
      setActivities(remoteActivities);

      setBackendState((prev) => ({
        ...prev,
        isChecking: false,
        lastSyncedAt: new Date().toLocaleTimeString(),
      }));

      addToast({
        type: "success",
        title: "Sync Complete",
        message: `Successfully synchronized ${remoteBooks.length} books with backend.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      setBackendState((prev) => ({ ...prev, isChecking: false, error: msg }));
      addToast({
        type: "error",
        title: "Synchronization Failed",
        message: msg,
      });
    }
  };

  // Book Handlers
  const addBook = async (data: BookFormData): Promise<Book | null> => {
    let createdBook: Book;
    const isOnline = backendState.isConnected;

    if (isOnline) {
      try {
        createdBook = await apiService.createBook(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not save book";
        addToast({ type: "error", title: "Book Not Saved", message });
        return null;
      }
    } else {
      createdBook = createLocalBook(data);
    }

    setBooks((prev) => [createdBook, ...prev]);
    addActivity(
      "add_book",
      "New Book Added",
      `"${createdBook.title}" by ${createdBook.author}`,
    );
    addToast({
      type: "success",
      title: "Book Added Successfully",
      message: `"${createdBook.title}" is now cataloged.`,
    });
    return createdBook;
  };

  const createLocalBook = (data: BookFormData): Book => {
    const id = `book-${Date.now()}`;
    const gradients = [
      "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
      "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    ];
    const randomGradient =
      gradients[Math.floor(Math.random() * gradients.length)];

    return {
      _id: id,
      title: data.title,
      author: data.author,
      genre: data.genre || "General",
      pages: Number(data.pages) || 0,
      publishedYear: Number(data.publishedYear) || new Date().getFullYear(),
      isbn:
        data.isbn ||
        `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      totalCopies: Number(data.totalCopies) || 1,
      availableCopies: Number(data.totalCopies) || 1,
      shelfLocation: data.shelfLocation || "Main Stacks",
      description: data.description || "",
      coverGradient: data.coverGradient || randomGradient,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const updateBook = async (
    id: string,
    data: Partial<BookFormData>,
  ): Promise<Book | null> => {
    if (backendState.isConnected) {
      try {
        await apiService.updateBook(id, data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not update book";
        addToast({ type: "error", title: "Update Failed", message });
        return null;
      }
    }

    const currentBook = books.find((b) => b._id === id);
    const totalCopies =
      data.totalCopies !== undefined
        ? Number(data.totalCopies)
        : currentBook?.totalCopies || 1;
    const copiesDiff = totalCopies - (currentBook?.totalCopies || 1);
    const availableCopies = Math.max(
      0,
      (currentBook?.availableCopies || 1) + copiesDiff,
    );

    const updated: Book = {
      ...(currentBook || ({} as Book)),
      ...data,
      pages: data.pages !== undefined ? Number(data.pages) : currentBook?.pages,
      publishedYear:
        data.publishedYear !== undefined
          ? Number(data.publishedYear)
          : currentBook?.publishedYear,
      totalCopies,
      availableCopies,
      updatedAt: new Date().toISOString(),
    };

    setBooks((prev) => prev.map((b) => (b._id === id ? updated : b)));

    addActivity(
      "update_book",
      "Book Updated",
      `Details updated for "${updated.title || id}"`,
    );
    addToast({
      type: "info",
      title: "Book Updated",
      message: `Changes saved for "${updated.title || "Book"}"`,
    });

    return updated;
  };

  const deleteBook = async (id: string): Promise<void> => {
    const book = books.find((b) => b._id === id);
    if (backendState.isConnected) {
      try {
        await apiService.deleteBook(id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not delete book";
        addToast({ type: "error", title: "Delete Failed", message });
        return;
      }
    }

    setBooks((prev) => prev.filter((b) => b._id !== id));
    addActivity(
      "delete_book",
      "Book Removed",
      `"${book?.title || id}" was deleted from catalog.`,
    );
    addToast({
      type: "info",
      title: "Book Removed",
      message: `"${book?.title || "Book"}" removed from catalog.`,
    });
  };

  const getBookById = useCallback(
    (id: string) => {
      return books.find((b) => b._id === id);
    },
    [books],
  );

  // Member Handlers
  const addMember = async (data: MemberFormData): Promise<Member | null> => {
    let newMember: Member;

    if (backendState.isConnected) {
      try {
        newMember = await apiService.createMember(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not register patron";
        addToast({ type: "error", title: "Patron Not Saved", message });
        return null;
      }
    } else {
      newMember = {
        id: `mem-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        membershipNumber:
          data.membershipNumber ||
          `LIB-2026-${Math.floor(100 + Math.random() * 900)}`,
        status: data.status || "active",
        bio: data.bio || "",
        hobbies: data.hobbies,
        joinedDate: new Date().toISOString().slice(0, 10),
      };
    }

    setMembers((prev) => [newMember, ...prev]);
    addActivity(
      "add_member",
      "New Patron Enrolled",
      `${newMember.name} joined the library`,
    );
    addToast({
      type: "success",
      title: "Member Registered",
      message: `${newMember.name} is now a library patron.`,
    });
    return newMember;
  };

  const updateMember = async (
    id: string,
    data: Partial<MemberFormData>,
  ): Promise<Member | null> => {
    let updated: Member;

    if (backendState.isConnected) {
      try {
        updated = await apiService.updateMember(id, data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not update patron";
        addToast({ type: "error", title: "Patron Not Updated", message });
        return null;
      }
    } else {
      const current = members.find((member) => member.id === id);
      if (!current) {
        addToast({ type: "error", title: "Patron Not Found" });
        return null;
      }
      updated = { ...current, ...data };
    }

    setMembers((prev) =>
      prev.map((member) => (member.id === id ? updated : member)),
    );
    addToast({
      type: "info",
      title: "Member Profile Updated",
      message: `${updated.name}'s profile was updated.`,
    });
    return updated;
  };

  const deleteMember = async (id: string): Promise<void> => {
    const member = members.find((m) => m.id === id);

    if (backendState.isConnected) {
      try {
        await apiService.deleteMember(id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not delete patron";
        addToast({ type: "error", title: "Patron Not Deleted", message });
        return;
      }
    }

    setMembers((prev) => prev.filter((m) => m.id !== id));
    addToast({
      type: "info",
      title: "Member Removed",
      message: `${member?.name || "Member"} was removed.`,
    });
  };

  const getMemberById = useCallback(
    (id: string) => {
      return members.find((m) => m.id === id);
    },
    [members],
  );

  // Circulation Handlers
  const issueBook = async (
    bookId: string,
    memberId: string,
    days = 14,
    notes?: string,
  ): Promise<Loan | null> => {
    const book = books.find((b) => b._id === bookId);
    const member = members.find((m) => m.id === memberId);

    if (!book) {
      addToast({ type: "error", title: "Book Not Found" });
      return null;
    }
    if (book.availableCopies <= 0) {
      addToast({
        type: "error",
        title: "Out of Stock",
        message: "No available physical copies to checkout.",
      });
      return null;
    }
    if (!member) {
      addToast({ type: "error", title: "Member Not Found" });
      return null;
    }
    if (member.status !== "active") {
      addToast({
        type: "error",
        title: "Patron Cannot Borrow",
        message: "Only active patrons can borrow books.",
      });
      return null;
    }

    let newLoan: Loan;

    if (backendState.isConnected) {
      try {
        newLoan = await apiService.issueBook(bookId, memberId, days, notes);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not issue book";
        addToast({ type: "error", title: "Book Not Issued", message });
        return null;
      }
    } else {
      const borrowDate = new Date().toISOString().slice(0, 10);
      const dueDate = new Date(Date.now() + days * 86400000)
        .toISOString()
        .slice(0, 10);

      newLoan = {
        id: `loan-${Date.now()}`,
        bookId: book._id,
        bookTitle: book.title,
        bookAuthor: book.author,
        memberId: member.id,
        memberName: member.name,
        memberEmail: member.email,
        borrowDate,
        dueDate,
        status: "active",
        notes,
      };
    }

    setBooks((prev) =>
      prev.map((b) =>
        b._id === bookId
          ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
          : b,
      ),
    );
    setLoans((prev) => [newLoan, ...prev]);
    addActivity(
      "borrow",
      "Book Loan Issued",
      `"${book.title}" issued to ${member.name}`,
    );
    addToast({
      type: "success",
      title: "Book Issued Successfully",
      message: `Due on ${new Date(newLoan.dueDate).toLocaleDateString()}`,
    });

    return newLoan;
  };

  const returnBook = async (loanId: string): Promise<void> => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan || loan.status === "returned") return;

    let returnedLoan: Loan;

    if (backendState.isConnected) {
      try {
        returnedLoan = await apiService.returnBook(loanId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not return book";
        addToast({ type: "error", title: "Return Failed", message });
        return;
      }
    } else {
      returnedLoan = {
        ...loan,
        status: "returned",
        returnDate: new Date().toISOString().slice(0, 10),
      };
    }

    setBooks((prev) =>
      prev.map((book) =>
        book._id === loan.bookId
          ? {
              ...book,
              availableCopies: Math.min(
                book.totalCopies,
                book.availableCopies + 1,
              ),
            }
          : book,
      ),
    );
    setLoans((prev) =>
      prev.map((item) => (item.id === loanId ? returnedLoan : item)),
    );
    addActivity(
      "return",
      "Book Returned",
      `"${loan.bookTitle}" returned by ${loan.memberName}`,
    );
    addToast({
      type: "success",
      title: "Book Returned",
      message: `"${loan.bookTitle}" is back in circulation.`,
    });
  };

  const renewLoan = async (loanId: string, days = 7): Promise<void> => {
    const loan = loans.find((item) => item.id === loanId);
    if (!loan) return;

    const today = new Date().toISOString().slice(0, 10);
    if (
      loan.status === "returned" ||
      loan.status === "overdue" ||
      loan.dueDate < today
    ) {
      addToast({
        type: "error",
        title: "Loan Cannot Be Renewed",
        message: "Only active loans can be renewed.",
      });
      return;
    }

    let renewedLoan: Loan;

    if (backendState.isConnected) {
      try {
        renewedLoan = await apiService.renewLoan(loanId, days);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not renew loan";
        addToast({ type: "error", title: "Renewal Failed", message });
        return;
      }
    } else {
      const newDueDate = new Date(
        new Date(loan.dueDate).getTime() + days * 86400000,
      )
        .toISOString()
        .slice(0, 10);

      renewedLoan = {
        ...loan,
        dueDate: newDueDate,
        status: "active",
        notes: `${loan.notes ? loan.notes + "; " : ""}Renewed +${days}d`,
      };
    }

    setLoans((prev) =>
      prev.map((item) => (item.id === loanId ? renewedLoan : item)),
    );
    addToast({
      type: "success",
      title: "Loan Renewed",
      message: `New due date: ${renewedLoan.dueDate}`,
    });
  };

  const resetToDemoData = () => {
    setBooks(INITIAL_BOOKS);
    setMembers(INITIAL_MEMBERS);
    setLoans(INITIAL_LOANS);
    setActivities(INITIAL_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    addToast({
      type: "info",
      title: "Reset to Sample Data",
      message: "Library catalog restored to initial state.",
    });
  };

  const exportCatalogJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(books, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `lmbs-catalog-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast({
      type: "success",
      title: "Export Complete",
      message: "Catalog downloaded as JSON.",
    });
  };

  const exportCatalogCsv = () => {
    const headers = [
      "ID",
      "Title",
      "Author",
      "Genre",
      "Pages",
      "PublishedYear",
      "ISBN",
      "AvailableCopies",
      "TotalCopies",
      "ShelfLocation",
    ];
    const rows = books.map((b) => [
      b._id,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.genre}"`,
      b.pages || 0,
      b.publishedYear || "",
      `"${b.isbn || ""}"`,
      b.availableCopies,
      b.totalCopies,
      `"${b.shelfLocation || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute(
      "download",
      `lmbs-catalog-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast({
      type: "success",
      title: "Export Complete",
      message: "Catalog downloaded as CSV.",
    });
  };

  // Recalculate dynamic statistics
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
    const availableCopies = books.reduce(
      (acc, b) => acc + (b.availableCopies || 0),
      0,
    );

    const activeLoans = loans.filter(
      (l) => l.status === "active" || l.status === "overdue",
    );
    const today = new Date().toISOString().split("T")[0];

    let overdueCount = 0;
    let totalFines = 0;

    activeLoans.forEach((loan) => {
      if (loan.dueDate < today || loan.status === "overdue") {
        overdueCount++;
        const diffDays = Math.max(
          1,
          Math.floor(
            (new Date().getTime() - new Date(loan.dueDate).getTime()) /
              86400000,
          ),
        );
        totalFines += diffDays * 0.5; // $0.50 / day fine
      }
    });

    return {
      totalBooks,
      availableCopies,
      totalCopies,
      activeLoansCount: activeLoans.length,
      overdueLoansCount: overdueCount,
      totalMembers: members.length,
      totalFinesPending: Number(totalFines.toFixed(2)),
    };
  }, [books, loans, members]);

  return (
    <LibraryContext.Provider
      value={{
        books,
        members,
        loans,
        activities,
        theme,
        toggleTheme,
        searchQuery,
        setSearchQuery,
        backendState,
        toasts,
        addToast,
        removeToast,
        checkBackendConnection,
        syncWithBackend,
        updateApiUrl,
        addBook,
        updateBook,
        deleteBook,
        getBookById,
        addMember,
        updateMember,
        deleteMember,
        getMemberById,
        issueBook,
        returnBook,
        renewLoan,
        resetToDemoData,
        exportCatalogJson,
        exportCatalogCsv,
        stats,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};
