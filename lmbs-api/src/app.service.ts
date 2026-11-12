import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

type BookInput = {
  title: string;
  author: string;
  pages?: number;
  publishedYear?: number;
  genre?: string;
  totalCopies?: number;
  isbn?: string;
  shelfLocation?: string;
  description?: string;
  coverGradient?: string;
};

type MemberUpdate = {
  name?: string;
  email?: string;
  membershipNumber?: string;
  phone?: string;
  status?: 'active' | 'suspended' | 'expired';
  bio?: string;
  hobbies?: string;
};

type IssueLoanInput = {
  bookId: string;
  memberId: string;
  days: number;
  notes?: string;
};

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getBooks() {
    return this.prisma.book.findMany();
  }

  getMembers() {
    return this.prisma.member.findMany();
  }

  async getLoans() {
    const records = await this.prisma.loan.findMany({
      include: { book: true, member: true },
      orderBy: { createdAt: 'desc' },
    });

    const today = new Date().toISOString().slice(0, 10);

    return records.map((loan) => {
      const dueDate = loan.dueDate.toISOString().slice(0, 10);

      return {
        id: loan.id,
        bookId: loan.bookId,
        bookTitle: loan.book.title,
        bookAuthor: loan.book.author,
        memberId: loan.memberId,
        memberName: loan.member.name,
        memberEmail: loan.member.email,
        borrowDate: loan.borrowDate.toISOString().slice(0, 10),
        dueDate,
        returnDate: loan.returnDate?.toISOString().slice(0, 10) ?? null,
        status: loan.returnDate
          ? 'returned'
          : dueDate < today
            ? 'overdue'
            : 'active',
        notes: loan.notes ?? undefined,
      };
    });
  }

  async getActivities() {
    const records = await this.prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return records.map((record) => ({
      id: record.id,
      type: record.type,
      title: record.title,
      description: record.description,
      timestamp: record.createdAt.toISOString(),
    }));
  }

  async issueBook(input: IssueLoanInput) {
    const borrowDate = new Date();
    borrowDate.setUTCHours(0, 0, 0, 0);

    const dueDate = new Date(borrowDate);
    dueDate.setUTCDate(dueDate.getUTCDate() + input.days);

    return this.prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({
        where: { id: input.memberId },
      });
      if (!member) throw new NotFoundException('Member not found');
      if (member.status !== 'active') {
        throw new ForbiddenException('Only active patrons can borrow books');
      }

      const book = await tx.book.findUnique({
        where: { id: input.bookId },
      });
      if (!book) throw new NotFoundException('Book not found');

      const changed = await tx.book.updateMany({
        where: {
          id: input.bookId,
          availableCopies: { gt: 0 },
        },
        data: { availableCopies: { decrement: 1 } },
      });
      if (changed.count !== 1) {
        throw new ConflictException('No copies are available');
      }

      const loan = await tx.loan.create({
        data: {
          bookId: input.bookId,
          memberId: input.memberId,
          borrowDate,
          dueDate,
          notes: input.notes,
        },
      });

      await tx.activity.create({
        data: {
          type: 'borrow',
          title: 'Book Checked Out',
          description: `${member.name} borrowed "${book.title}"`,
        },
      });

      return {
        id: loan.id,
        bookId: loan.bookId,
        bookTitle: book.title,
        bookAuthor: book.author,
        memberId: loan.memberId,
        memberName: member.name,
        memberEmail: member.email,
        borrowDate: loan.borrowDate.toISOString().slice(0, 10),
        dueDate: loan.dueDate.toISOString().slice(0, 10),
        returnDate: null,
        status: 'active',
        notes: loan.notes ?? undefined,
      };
    });
  }

  async returnBook(loanId: string) {
    const returnDate = new Date();
    returnDate.setUTCHours(0, 0, 0, 0);

    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { book: true, member: true },
      });
      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.returnDate) {
        throw new ConflictException('Loan already returned');
      }

      const changed = await tx.loan.updateMany({
        where: { id: loanId, returnDate: null },
        data: { returnDate },
      });
      if (changed.count !== 1) {
        throw new ConflictException('Loan already returned');
      }

      const restored = await tx.book.updateMany({
        where: {
          id: loan.bookId,
          availableCopies: { lt: loan.book.totalCopies },
        },
        data: { availableCopies: { increment: 1 } },
      });
      if (restored.count !== 1) {
        throw new ConflictException(
          'Could not restore copy; check inventory counts',
        );
      }

      await tx.activity.create({
        data: {
          type: 'return',
          title: 'Book Returned',
          description: `"${loan.book.title}" returned by ${loan.member.name}`,
        },
      });

      return {
        id: loan.id,
        bookId: loan.bookId,
        bookTitle: loan.book.title,
        bookAuthor: loan.book.author,
        memberId: loan.memberId,
        memberName: loan.member.name,
        memberEmail: loan.member.email,
        borrowDate: loan.borrowDate.toISOString().slice(0, 10),
        dueDate: loan.dueDate.toISOString().slice(0, 10),
        returnDate: returnDate.toISOString().slice(0, 10),
        status: 'returned',
        notes: loan.notes ?? undefined,
      };
    });
  }

  async renewLoan(loanId: string, days: number) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { book: true, member: true },
      });

      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.returnDate) {
        throw new ConflictException('Returned loans cannot be renewed');
      }

      const today = new Date().toISOString().slice(0, 10);
      if (loan.dueDate.toISOString().slice(0, 10) < today) {
        throw new ConflictException('Overdue loans cannot be renewed');
      }

      const newDueDate = new Date(loan.dueDate);
      newDueDate.setUTCDate(newDueDate.getUTCDate() + days);

      const changed = await tx.loan.updateMany({
        where: {
          id: loanId,
          returnDate: null,
          dueDate: loan.dueDate,
        },
        data: { dueDate: newDueDate },
      });
      if (changed.count !== 1) {
        throw new ConflictException('Loan changed; please retry');
      }

      await tx.activity.create({
        data: {
          type: 'renew',
          title: 'Loan Renewed',
          description: `"${loan.book.title}" renewed for ${loan.member.name} until ${newDueDate.toISOString().slice(0, 10)}`,
        },
      });

      return {
        id: loan.id,
        bookId: loan.bookId,
        bookTitle: loan.book.title,
        bookAuthor: loan.book.author,
        memberId: loan.memberId,
        memberName: loan.member.name,
        memberEmail: loan.member.email,
        borrowDate: loan.borrowDate.toISOString().slice(0, 10),
        dueDate: newDueDate.toISOString().slice(0, 10),
        returnDate: null,
        status: 'active',
        notes: loan.notes ?? undefined,
      };
    });
  }

  async createMember(input: {
    name: string;
    email: string;
    membershipNumber: string;
    phone?: string;
    status?: 'active' | 'suspended' | 'expired';
    bio?: string;
    hobbies?: string;
  }) {
    const emailExists = await this.prisma.member.findUnique({
      where: { email: input.email },
    });
    if (emailExists) {
      throw new ConflictException('Email is already registered');
    }

    const numberExists = await this.prisma.member.findUnique({
      where: { membershipNumber: input.membershipNumber },
    });
    if (numberExists) {
      throw new ConflictException('Membership number is already in use');
    }

    return this.prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: {
          name: input.name,
          email: input.email,
          membershipNumber: input.membershipNumber,
          phone: input.phone ?? '',
          status: input.status ?? 'active',
          bio: input.bio,
          hobbies: input.hobbies,
        },
      });

      await tx.activity.create({
        data: {
          type: 'add_member',
          title: 'New Patron Registered',
          description: `${member.name} registered with ID ${member.membershipNumber}`,
        },
      });

      return member;
    });
  }

  async deleteMember(id: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const loanCount = await this.prisma.loan.count({
      where: { memberId: id },
    });
    if (loanCount > 0) {
      throw new ConflictException('Cannot delete a patron with loan history');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.member.delete({ where: { id } });

      await tx.activity.create({
        data: {
          type: 'delete_member',
          title: 'Patron Removed',
          description: `Removed ${member.name} (${member.membershipNumber})`,
        },
      });
    });

    return { message: 'Member deleted' };
  }

  async updateMember(id: string, input: MemberUpdate) {
    const existing = await this.prisma.member.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Member not found');
    }

    if (input.email && input.email !== existing.email) {
      const other = await this.prisma.member.findUnique({
        where: { email: input.email },
      });
      if (other) throw new ConflictException('Email is already registered');
    }

    if (
      input.membershipNumber &&
      input.membershipNumber !== existing.membershipNumber
    ) {
      const other = await this.prisma.member.findUnique({
        where: { membershipNumber: input.membershipNumber },
      });
      if (other) {
        throw new ConflictException('Membership number is already in use');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.member.update({
        where: { id },
        data: input,
      });

      await tx.activity.create({
        data: {
          type: 'update_member',
          title: 'Patron Updated',
          description: `Updated ${updated.name}'s membership record`,
        },
      });

      return updated;
    });
  }

  async createBook(input: BookInput) {
    const totalCopies = input.totalCopies ?? 1;

    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.create({
        data: {
          title: input.title,
          author: input.author,
          pages: input.pages,
          publishedYear: input.publishedYear,
          genre: input.genre ?? 'General',
          totalCopies,
          availableCopies: totalCopies,
          isbn: input.isbn || undefined,
          shelfLocation: input.shelfLocation,
          description: input.description,
          coverGradient: input.coverGradient,
        },
      });

      await tx.activity.create({
        data: {
          type: 'add_book',
          title: 'New Acquisition Added',
          description: `Added "${book.title}" by ${book.author}`,
        },
      });

      return book;
    });
  }

  async updateBook(id: string, input: BookInput) {
    const existing = await this.prisma.book.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Book not found');
    }

    const totalCopies = input.totalCopies ?? existing.totalCopies;
    const borrowedCopies = existing.totalCopies - existing.availableCopies;

    if (totalCopies < borrowedCopies) {
      throw new BadRequestException(
        'Total copies cannot be less than copies currently borrowed',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.book.update({
        where: { id },
        data: {
          title: input.title,
          author: input.author,
          genre: input.genre ?? existing.genre,
          pages: input.pages,
          publishedYear: input.publishedYear,
          isbn: input.isbn === '' ? null : input.isbn,
          totalCopies,
          availableCopies: totalCopies - borrowedCopies,
          shelfLocation: input.shelfLocation,
          description: input.description,
          coverGradient: input.coverGradient,
        },
      });

      await tx.activity.create({
        data: {
          type: 'update_book',
          title: 'Book Updated',
          description: `Updated "${updated.title}"`,
        },
      });

      return updated;
    });
  }

  async deleteBook(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id } });

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      const loanCount = await tx.loan.count({ where: { bookId: id } });
      if (loanCount > 0) {
        throw new ConflictException('Cannot delete a book with loan history');
      }

      await tx.book.delete({ where: { id } });

      await tx.activity.create({
        data: {
          type: 'delete_book',
          title: 'Book Removed',
          description: `Removed "${book.title}" from the catalog`,
        },
      });

      return { message: 'Book deleted' };
    });
  }
}
