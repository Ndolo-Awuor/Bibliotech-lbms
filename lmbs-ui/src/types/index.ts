export interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  pages?: number;
  publishedYear?: number;
  isbn?: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation?: string;
  description?: string;
  coverGradient?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BookFormData = Omit<
  Book,
  "_id" | "createdAt" | "updatedAt" | "availableCopies"
> & {
  _id?: string;
  availableCopies?: number;
};

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipNumber: string;
  status: "active" | "suspended" | "expired";
  joinedDate: string;
  bio?: string;
  hobbies?: string;
}

export type MemberFormData = Omit<Member, "id" | "joinedDate"> & {
  id?: string;
};

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: "active" | "returned" | "overdue";
  fineAmount?: number;
  notes?: string;
}

export interface ActivityItem {
  id: string;
  type:
    | "borrow"
    | "return"
    | "renew"
    | "add_book"
    | "update_book"
    | "delete_book"
    | "add_member"
    | "update_member"
    | "delete_member"
    | "sync";
  title: string;
  description: string;
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

export type NavigationTab =
  | "dashboard"
  | "catalog"
  | "circulation"
  | "members"
  | "analytics"
  | "settings";

export interface BackendSyncState {
  apiUrl: string;
  isConnected: boolean;
  isChecking: boolean;
  lastSyncedAt: string | null;
  syncMode: "auto" | "manual";
  error: string | null;
}
