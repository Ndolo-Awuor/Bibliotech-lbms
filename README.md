# Library Management System

This project pairs a React library dashboard (`lmbs-ui`) with a NestJS API (`lmbs-api`). Staff can manage books and patrons, issue and return loans, renew active loans, and see recent activity. PostgreSQL stores the connected app's records; Prisma defines the tables and migrations.

## Project layout

| Folder                        | Purpose                                                           |
| ----------------------------- | ----------------------------------------------------------------- |
| `lmbs-ui`                     | React, TypeScript, Vite frontend; runs at `http://localhost:5173` |
| `lmbs-api`                    | NestJS, TypeScript, Prisma API; runs at `http://localhost:3000`   |
| PostgreSQL database `lmbs_db` | Stores books, patrons, loans, and activity                        |

The frontend calls `http://localhost:3000/api/v1` by default. The API allows browser requests from `http://localhost:5173` in local development.

## Local setup

These steps use Node.js 24 and PostgreSQL 17, the versions used during development. Run commands in Git Bash from `LibraryProject` unless stated otherwise.

1. Create a local PostgreSQL database named `lmbs_db` if it does not already exist. For the Windows PostgreSQL 17 installation used here:

   ```bash
   "/c/Program Files/PostgreSQL/17/bin/psql.exe" -h localhost -U postgres -d postgres -c "CREATE DATABASE lmbs_db;"
   ```

2. Set up the API:

   ```bash
   cd lmbs-api
   npm ci
   cp .env.example .env
   ```

   Edit `.env` and replace the placeholder with your PostgreSQL password. URL-encode special characters in the password. Keep `.env` private. If this project is already running locally, keep its existing `.env` instead of copying the example over it.

3. Apply the committed schema migrations and generate the Prisma client:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   npm run start:dev
   ```

   Leave that terminal open. `http://localhost:3000/` should return `Hello World!`; `http://localhost:3000/api/v1/books` should return a JSON array, initially possibly `[]`.

4. Open a second terminal in `LibraryProject` and start the frontend:

   ```bash
   cd lmbs-ui
   npm ci
   npm run dev
   ```

   Open the URL printed by Vite, normally `http://localhost:5173`. The sidebar should show **API Connected** when both the API and PostgreSQL are available.

If either port is already occupied, stop the other process using it. The current frontend API address and backend CORS setting assume ports 5173 and 3000.

## Optional sample catalog

To add 20 fictional books to a fresh or existing development database, run this in `lmbs-api` after applying migrations and generating the Prisma client:

```bash
npx prisma db seed
```

The seed uses stable IDs, so running it again skips books already added by the seed and leaves all existing book records unchanged. It does not add patrons or loans. The frontend's Books Catalog will show the books after refreshing while **API Connected**. This command uses `DATABASE_URL` from `.env`; check that it names the database you intend to populate before running it. Prisma 7 runs the seed only when this command is invoked explicitly.

## Main API routes

| Method      | Route                      | Purpose                              |
| ----------- | -------------------------- | ------------------------------------ |
| GET, POST   | `/api/v1/books`            | List or add books                    |
| PUT, DELETE | `/api/v1/books/:id`        | Edit or delete a book                |
| GET, POST   | `/api/v1/members`          | List or register patrons             |
| PUT, DELETE | `/api/v1/members/:id`      | Edit or delete a patron              |
| GET, POST   | `/api/v1/loans`            | List or issue loans                  |
| PUT         | `/api/v1/loans/:id/return` | Return a loan                        |
| PUT         | `/api/v1/loans/:id/renew`  | Renew an active loan                 |
| GET         | `/api/v1/activities`       | Show the 50 most recent saved events |

Prisma models are in `lmbs-api/prisma/schema.prisma`. A checkout and return update loan state, available copies, and activity together in a database transaction. The API rejects checkout for suspended patrons or when no copies remain. Books and patrons with loan history cannot be deleted.

## Demo workflow

1. Start PostgreSQL, the API, and the frontend. Confirm **API Connected**.
2. Add a book through **Books Catalog**, for example _Library Systems Primer_ by George Atambo with one copy.
3. Register a patron through **Patron Directory**, for example Chebet Vanessa with a unique email and membership number.
4. Issue that book to the active patron. Verify availability changes from 1 to 0 and the loan appears in **Circulation**.
5. Renew the loan and verify its due date changes while available copies remain 0.
6. Return the loan and verify availability changes back to 1. The dashboard's **Recent Activity** panel should show saved events.
7. Refresh the browser to confirm the connected data persists in PostgreSQL.

Use new email and membership number values if the examples have already been registered. The frontend also supports a local offline demo mode; offline changes are stored in the browser and are not uploaded to PostgreSQL by the current sync feature.

## Build and test

In `lmbs-api`:

```bash
npm run build
```

The end-to-end tests use a separate local database named `lmbs_test_db`. Copy `.env` to `.env.test`, change only the database name to `lmbs_test_db`, create that database in PostgreSQL, then apply migrations to it:

```bash
node --env-file=.env.test ./node_modules/prisma/build/index.js migrate deploy
npm run test:e2e
```

The test runner checks that its database URL points to local `lmbs_test_db`. It deletes records in that test database after each test. Do not use that database for records you want to keep.

In `lmbs-ui`:

```bash
npm run build
```

## Current scope

The API has no staff sign-in or role permissions yet. The Analytics view calculates metrics from the loaded library data; there is no separate reporting API. Do not expose this API publicly until authentication and deployment configuration are added.
