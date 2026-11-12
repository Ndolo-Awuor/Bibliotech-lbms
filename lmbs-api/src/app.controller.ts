import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Delete('api/v1/books/:id')
  deleteBook(@Param('id') id: string) {
    return this.appService.deleteBook(id);
  }
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/v1/books')
  getBooks() {
    return this.appService.getBooks();
  }

  @Get('api/v1/members')
  getMembers() {
    return this.appService.getMembers();
  }

  @Get('api/v1/loans')
  getLoans() {
    return this.appService.getLoans();
  }

  @Get('api/v1/activities')
  getActivities() {
    return this.appService.getActivities();
  }

  @Post('api/v1/loans')
  issueBook(@Body() body: unknown) {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new BadRequestException('Body must be a JSON object');
    }

    const { bookId, memberId, days, notes } = body as Record<string, unknown>;

    if (typeof bookId !== 'string' || !bookId.trim()) {
      throw new BadRequestException('Book ID is required');
    }
    if (typeof memberId !== 'string' || !memberId.trim()) {
      throw new BadRequestException('Member ID is required');
    }

    const loanDays = days === undefined ? 14 : days;
    if (
      typeof loanDays !== 'number' ||
      !Number.isInteger(loanDays) ||
      loanDays < 1 ||
      loanDays > 365
    ) {
      throw new BadRequestException(
        'Days must be a whole number from 1 to 365',
      );
    }
    if (notes !== undefined && typeof notes !== 'string') {
      throw new BadRequestException('Notes must be text');
    }

    return this.appService.issueBook({
      bookId: bookId.trim(),
      memberId: memberId.trim(),
      days: loanDays,
      notes: (notes as string | undefined)?.trim(),
    });
  }

  @Put('api/v1/loans/:id/return')
  returnBook(@Param('id') id: string) {
    return this.appService.returnBook(id);
  }

  @Put('api/v1/loans/:id/renew')
  renewLoan(@Param('id') id: string, @Body() body: unknown) {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new BadRequestException('Body must be a JSON object');
    }

    const { days } = body as Record<string, unknown>;
    const renewDays = days === undefined ? 7 : days;

    if (
      typeof renewDays !== 'number' ||
      !Number.isInteger(renewDays) ||
      renewDays < 1 ||
      renewDays > 365
    ) {
      throw new BadRequestException(
        'Days must be a whole number from 1 to 365',
      );
    }

    return this.appService.renewLoan(id, renewDays);
  }

  @Post('api/v1/members')
  createMember(@Body() body: unknown) {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new BadRequestException('Body must be a JSON object');
    }

    const { name, email, membershipNumber, phone, status, bio, hobbies } =
      body as Record<string, unknown>;

    if (typeof name !== 'string' || !name.trim()) {
      throw new BadRequestException('Name is required');
    }
    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      throw new BadRequestException('A valid email is required');
    }
    if (typeof membershipNumber !== 'string' || !membershipNumber.trim()) {
      throw new BadRequestException('Membership number is required');
    }

    for (const [field, value] of Object.entries({ phone, bio, hobbies })) {
      if (value !== undefined && typeof value !== 'string') {
        throw new BadRequestException(`${field} must be text`);
      }
    }
    if (
      status !== undefined &&
      status !== 'active' &&
      status !== 'suspended' &&
      status !== 'expired'
    ) {
      throw new BadRequestException('Invalid member status');
    }

    return this.appService.createMember({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      membershipNumber: membershipNumber.trim(),
      phone: (phone as string | undefined)?.trim(),
      status,
      bio: (bio as string | undefined)?.trim(),
      hobbies: (hobbies as string | undefined)?.trim(),
    });
  }

  @Delete('api/v1/members/:id')
  deleteMember(@Param('id') id: string) {
    return this.appService.deleteMember(id);
  }

  @Put('api/v1/members/:id')
  updateMember(@Param('id') id: string, @Body() body: unknown) {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new BadRequestException('Body must be a JSON object');
    }

    const input = body as Record<string, unknown>;
    const fields = [
      'name',
      'email',
      'membershipNumber',
      'phone',
      'status',
      'bio',
      'hobbies',
    ] as const;

    if (!fields.some((field) => input[field] !== undefined)) {
      throw new BadRequestException('Provide at least one member field');
    }

    for (const field of fields) {
      if (input[field] !== undefined && typeof input[field] !== 'string') {
        throw new BadRequestException(`${field} must be text`);
      }
    }

    for (const field of ['name', 'email', 'membershipNumber'] as const) {
      if (input[field] !== undefined && !(input[field] as string).trim()) {
        throw new BadRequestException(`${field} cannot be empty`);
      }
    }

    if (
      input.email !== undefined &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((input.email as string).trim())
    ) {
      throw new BadRequestException('A valid email is required');
    }

    if (
      input.status !== undefined &&
      input.status !== 'active' &&
      input.status !== 'suspended' &&
      input.status !== 'expired'
    ) {
      throw new BadRequestException('Invalid member status');
    }

    const text = (value: unknown): string | undefined =>
      typeof value === 'string' ? value.trim() : undefined;

    return this.appService.updateMember(id, {
      name: text(input.name),
      email: text(input.email)?.toLowerCase(),
      membershipNumber: text(input.membershipNumber),
      phone: text(input.phone),
      status: input.status as 'active' | 'suspended' | 'expired' | undefined,
      bio: text(input.bio),
      hobbies: text(input.hobbies),
    });
  }

  @Post('api/v1/books')
  createBook(@Body() body: unknown) {
    return this.appService.createBook(this.parseBookBody(body));
  }

  @Put('api/v1/books/:id')
  updateBook(@Param('id') id: string, @Body() body: unknown) {
    return this.appService.updateBook(id, this.parseBookBody(body));
  }

  private parseBookBody(body: unknown) {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new BadRequestException('Body must be a JSON object');
    }

    const {
      title,
      author,
      pages,
      publishedYear,
      genre,
      totalCopies,
      isbn,
      shelfLocation,
      description,
      coverGradient,
    } = body as Record<string, unknown>;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof author !== 'string' ||
      !author.trim()
    ) {
      throw new BadRequestException('Title and author are required');
    }

    if (
      pages !== undefined &&
      (typeof pages !== 'number' || !Number.isInteger(pages) || pages < 0)
    ) {
      throw new BadRequestException(
        'Pages must be a non-negative whole number',
      );
    }

    if (
      publishedYear !== undefined &&
      (typeof publishedYear !== 'number' ||
        !Number.isInteger(publishedYear) ||
        publishedYear < 1)
    ) {
      throw new BadRequestException(
        'Published year must be a positive whole number',
      );
    }

    if (
      totalCopies !== undefined &&
      (typeof totalCopies !== 'number' ||
        !Number.isInteger(totalCopies) ||
        totalCopies < 1)
    ) {
      throw new BadRequestException(
        'Total copies must be a positive whole number',
      );
    }

    for (const [field, value] of Object.entries({
      genre,
      isbn,
      shelfLocation,
      description,
      coverGradient,
    })) {
      if (value !== undefined && typeof value !== 'string') {
        throw new BadRequestException(`${field} must be text`);
      }
    }

    return {
      title: title.trim(),
      author: author.trim(),
      pages: pages as number | undefined,
      publishedYear: publishedYear as number | undefined,
      genre: (genre as string | undefined)?.trim() || undefined,
      totalCopies: totalCopies as number | undefined,
      isbn: (isbn as string | undefined)?.trim(),
      shelfLocation: (shelfLocation as string | undefined)?.trim(),
      description: (description as string | undefined)?.trim(),
      coverGradient: (coverGradient as string | undefined)?.trim(),
    };
  }
}
