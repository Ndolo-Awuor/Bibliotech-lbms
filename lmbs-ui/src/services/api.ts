import {
  Book,
  BookFormData,
  Member,
  MemberFormData,
  Loan,
  ActivityItem,
} from "../types";

const DEFAULT_API_BASE = "http://localhost:3000/api/v1";

export class LibraryApiService {
  private baseUrl: string;

  constructor(customUrl?: string) {
    this.baseUrl =
      customUrl || localStorage.getItem("lmbs_api_url") || DEFAULT_API_BASE;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, "");
    localStorage.setItem("lmbs_api_url", this.baseUrl);
  }

  public async checkConnection(): Promise<{
    connected: boolean;
    latencyMs?: number;
    error?: string;
  }> {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.baseUrl}/books`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        return { connected: true, latencyMs };
      }
      return {
        connected: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Network connection failed";
      return { connected: false, error: message };
    }
  }

  public async getBooks(): Promise<Book[]> {
    const response = await fetch(`${this.baseUrl}/books`);
    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.statusText}`);
    }
    const data = await response.json();
    return data.map((item: any) => ({
      _id: item._id || item.id,
      title: item.title,
      author: item.author,
      genre: item.genre || "General",
      pages: item.pages || 0,
      publishedYear: item.publishedYear || new Date().getFullYear(),
      isbn: item.isbn ?? "",
      totalCopies: item.totalCopies || 3,
      availableCopies:
        item.availableCopies !== undefined
          ? item.availableCopies
          : item.totalCopies || 3,
      shelfLocation: item.shelfLocation || "General Collection",
      description: item.description || "",
      coverGradient:
        item.coverGradient ||
        "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));
  }

  public async getMembers(): Promise<Member[]> {
    const response = await fetch(`${this.baseUrl}/members`);
    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.statusText}`);
    }

    const data: Member[] = await response.json();
    return data.map((member) => ({
      ...member,
      joinedDate: member.joinedDate.slice(0, 10),
    }));
  }

  public async getLoans(): Promise<Loan[]> {
    const response = await fetch(`${this.baseUrl}/loans`);
    if (!response.ok) {
      throw new Error(`Failed to fetch loans: ${response.statusText}`);
    }

    const loans: Loan[] = await response.json();
    return loans;
  }

  public async getActivities(): Promise<ActivityItem[]> {
    const response = await fetch(`${this.baseUrl}/activities`);
    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.statusText}`);
    }

    const activities: ActivityItem[] = await response.json();
    return activities.map((activity) => ({
      ...activity,
      timestamp: new Date(activity.timestamp).toLocaleString(),
    }));
  }

  public async issueBook(
    bookId: string,
    memberId: string,
    days: number,
    notes?: string,
  ): Promise<Loan> {
    const response = await fetch(`${this.baseUrl}/loans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId,
        memberId,
        days,
        notes: notes?.trim() || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Could not issue book (${response.status})`,
      );
    }

    return (await response.json()) as Loan;
  }

  public async returnBook(loanId: string): Promise<Loan> {
    const response = await fetch(`${this.baseUrl}/loans/${loanId}/return`, {
      method: "PUT",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Could not return book (${response.status})`,
      );
    }

    return (await response.json()) as Loan;
  }

  public async renewLoan(loanId: string, days = 7): Promise<Loan> {
    const response = await fetch(`${this.baseUrl}/loans/${loanId}/renew`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Could not renew loan (${response.status})`,
      );
    }

    return (await response.json()) as Loan;
  }

  public async createMember(data: MemberFormData): Promise<Member> {
    const response = await fetch(`${this.baseUrl}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() ?? "",
        membershipNumber: data.membershipNumber.trim(),
        status: data.status,
        bio: data.bio?.trim() ?? "",
        hobbies: data.hobbies?.trim() ?? "",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Could not register patron (${response.status})`,
      );
    }

    const created: Member = await response.json();
    return {
      ...created,
      joinedDate: created.joinedDate.slice(0, 10),
    };
  }

  public async updateMember(
    id: string,
    data: Partial<MemberFormData>,
  ): Promise<Member> {
    const response = await fetch(`${this.baseUrl}/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name?.trim(),
        email: data.email?.trim(),
        membershipNumber: data.membershipNumber?.trim(),
        phone: data.phone?.trim(),
        status: data.status,
        bio: data.bio?.trim(),
        hobbies: data.hobbies?.trim(),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Could not update patron (${response.status})`,
      );
    }

    const updated: Member = await response.json();
    return { ...updated, joinedDate: updated.joinedDate.slice(0, 10) };
  }

  public async deleteMember(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/members/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Could not delete patron (${response.status})`,
      );
    }
  }

  public async createBook(data: BookFormData): Promise<Book> {
    const payload = {
      title: data.title,
      author: data.author,
      genre: data.genre,
      pages: Number(data.pages) || 0,
      publishedYear: Number(data.publishedYear) || new Date().getFullYear(),
      isbn: data.isbn?.trim() || undefined,
      totalCopies: Number(data.totalCopies),
      shelfLocation: data.shelfLocation?.trim() || undefined,
      description: data.description?.trim() || undefined,
      coverGradient: data.coverGradient || undefined,
    };

    const response = await fetch(`${this.baseUrl}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create book on backend");
    }

    const created = await response.json();
    return {
      _id: created._id || created.id,
      title: created.title,
      author: created.author,
      genre: data.genre || "General",
      pages: created.pages,
      publishedYear: created.publishedYear,
      isbn: created.isbn ?? "",
      totalCopies: data.totalCopies || 3,
      availableCopies: data.totalCopies || 3,
      shelfLocation: data.shelfLocation || "General Section",
      description: data.description || "",
      coverGradient:
        data.coverGradient ||
        "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
      createdAt: created.createdAt || new Date().toISOString(),
      updatedAt: created.updatedAt || new Date().toISOString(),
    };
  }

  public async updateBook(
    id: string,
    data: Partial<BookFormData>,
  ): Promise<Book> {
    const payload = {
      title: data.title,
      author: data.author,
      genre: data.genre,
      pages: data.pages !== undefined ? Number(data.pages) : undefined,
      publishedYear:
        data.publishedYear !== undefined
          ? Number(data.publishedYear)
          : undefined,
      isbn: data.isbn?.trim(),
      totalCopies:
        data.totalCopies !== undefined ? Number(data.totalCopies) : undefined,
      shelfLocation: data.shelfLocation?.trim(),
      description: data.description?.trim(),
      coverGradient: data.coverGradient,
    };

    const response = await fetch(`${this.baseUrl}/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update book on backend");
    }

    const updated = await response.json();
    return updated;
  }

  public async deleteBook(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/books/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete book: ${response.statusText}`);
    }
    return true;
  }
}

export const apiService = new LibraryApiService();
