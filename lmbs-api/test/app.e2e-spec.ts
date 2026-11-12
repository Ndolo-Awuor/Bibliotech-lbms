import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { randomUUID } from 'node:crypto';
import { PrismaService } from './../src/prisma.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('Test database URL is missing');

    const target = new URL(databaseUrl);
    if (
      target.hostname !== 'localhost' ||
      target.pathname !== '/lmbs_test_db'
    ) {
      throw new Error('End-to-end tests must use local lmbs_test_db');
    }
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('lists the library data through the API', async () => {
    for (const path of [
      '/api/v1/books',
      '/api/v1/members',
      '/api/v1/loans',
      '/api/v1/activities',
    ]) {
      const response = await request(app.getHttpServer()).get(path).expect(200);
      expect(Array.isArray(response.body)).toBe(true);
    }
  });

  it('rejects an invalid loan period without changing data', async () => {
    const booksBefore = await request(app.getHttpServer())
      .get('/api/v1/books')
      .expect(200);
    const loansBefore = await request(app.getHttpServer())
      .get('/api/v1/loans')
      .expect(200);

    const rejected = await request(app.getHttpServer())
      .post('/api/v1/loans')
      .send({ bookId: 'unused', memberId: 'unused', days: 0 })
      .expect(400);

    expect(rejected.body.message).toBe(
      'Days must be a whole number from 1 to 365',
    );

    const booksAfter = await request(app.getHttpServer())
      .get('/api/v1/books')
      .expect(200);
    const loansAfter = await request(app.getHttpServer())
      .get('/api/v1/loans')
      .expect(200);

    const availableById = (books: { id: string; availableCopies: number }[]) =>
      Object.fromEntries(
        books.map(({ id, availableCopies }) => [id, availableCopies]),
      );

    expect(availableById(booksAfter.body)).toEqual(
      availableById(booksBefore.body),
    );
    expect(
      loansAfter.body.map((loan: { id: string }) => loan.id).sort(),
    ).toEqual(loansBefore.body.map((loan: { id: string }) => loan.id).sort());
  });

  it('keeps copy counts correct through checkout and return', async () => {
    const server = app.getHttpServer();
    const suffix = randomUUID();

    const book = await request(server)
      .post('/api/v1/books')
      .send({
        title: `E2E Circulation ${suffix}`,
        author: 'Peter Onyango',
        totalCopies: 1,
      })
      .expect(201);

    const member = await request(server)
      .post('/api/v1/members')
      .send({
        name: 'Judith Kerubo',
        email: `judith.${suffix}@example.test`,
        membershipNumber: `LIB-E2E-${suffix}`,
        status: 'active',
      })
      .expect(201);

    const availableCopies = async () => {
      const response = await request(server).get('/api/v1/books').expect(200);
      return response.body.find(
        (item: { id: string }) => item.id === book.body.id,
      )?.availableCopies;
    };

    const issueBody = {
      bookId: book.body.id,
      memberId: member.body.id,
      days: 14,
    };

    const issued = await request(server)
      .post('/api/v1/loans')
      .send(issueBody)
      .expect(201);

    expect(issued.body.status).toBe('active');
    expect(await availableCopies()).toBe(0);

    await request(server).post('/api/v1/loans').send(issueBody).expect(409);
    expect(await availableCopies()).toBe(0);

    const returned = await request(server)
      .put(`/api/v1/loans/${issued.body.id}/return`)
      .expect(200);

    expect(returned.body.status).toBe('returned');
    expect(await availableCopies()).toBe(1);

    await request(server)
      .put(`/api/v1/loans/${issued.body.id}/return`)
      .expect(409);
    expect(await availableCopies()).toBe(1);

    const activities = await request(server)
      .get('/api/v1/activities')
      .expect(200);

    const eventTypes = activities.body
      .filter((item: { description: string }) =>
        item.description.includes(book.body.title),
      )
      .map((item: { type: string }) => item.type);

    expect(eventTypes).toEqual(expect.arrayContaining(['borrow', 'return']));
  });

  afterEach(async () => {
    if (!app) return;
    const prisma = app.get(PrismaService);
    await prisma.loan.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.book.deleteMany();
    await prisma.member.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });
});
