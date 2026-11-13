import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is missing');
}

// These are fictional demo titles. Stable IDs let us run this seed repeatedly
// without duplicating or overwriting books that staff have edited.
const authors = [
  'Judith Kerubo',
  'Peter Onyango',
  'Mike Ndolo',
  'Zipporah Kwamboka',
  'George Atambo',
  'Thomas Mosomi',
  'David Onchere',
  'George Moochi',
  'Chebet Vanessa',
  'Atogo Michael',
] as const;

const catalog = [
  ['Foundations of Library Systems', 'Software Engineering', 248, 2022, 'TECH-A1', 3],
  ['Practical TypeScript Patterns', 'Software Engineering', 312, 2023, 'TECH-A1', 4],
  ['Designing Reliable APIs', 'Software Engineering', 286, 2024, 'TECH-A2', 3],
  ['Databases in Practice', 'Computer Science', 330, 2021, 'COMP-B1', 5],
  ['An Introduction to Algorithms', 'Computer Science', 416, 2020, 'COMP-B1', 2],
  ['Networks and the Modern Web', 'Computer Science', 274, 2022, 'COMP-B2', 3],
  ['Secure Applications Handbook', 'Cybersecurity', 296, 2023, 'TECH-C1', 2],
  ['A Guide to Cloud Services', 'Cloud Computing', 260, 2024, 'TECH-C2', 4],
  ['Human-Centered Interface Design', 'Design', 232, 2021, 'DES-D1', 3],
  ['Data Visualization Basics', 'Data Science', 220, 2022, 'DATA-E1', 3],
  ['Statistics for Curious Minds', 'Data Science', 302, 2020, 'DATA-E1', 2],
  ['Machine Learning Field Notes', 'Data Science', 344, 2024, 'DATA-E2', 3],
  ['The Art of Clear Writing', 'Language', 198, 2019, 'LANG-F1', 4],
  ['Stories from the Rift Valley', 'Literature', 224, 2021, 'LIT-G1', 2],
  ['A Journey Through East Africa', 'History', 270, 2020, 'HIST-H1', 3],
  ['Science in Everyday Life', 'Science', 256, 2022, 'SCI-I1', 4],
  ['Understanding Our Environment', 'Science', 288, 2023, 'SCI-I2', 3],
  ['Small Business Essentials', 'Business', 244, 2021, 'BUS-J1', 2],
  ['Planning Better Projects', 'Management', 214, 2024, 'BUS-J2', 3],
  ['Learning Habits That Last', 'Self Improvement', 192, 2023, 'SELF-K1', 4],
] as const;

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

try {
  const result = await prisma.book.createMany({
    data: catalog.map(([title, genre, pages, publishedYear, shelfLocation, copies], index) => ({
      id: `seed-book-${String(index + 1).padStart(2, '0')}`,
      title,
      author: authors[index % authors.length],
      genre,
      pages,
      publishedYear,
      shelfLocation,
      totalCopies: copies,
      availableCopies: copies,
    })),
    skipDuplicates: true,
  });

  console.log(`Added ${result.count} sample books; existing books were left unchanged.`);
} finally {
  await prisma.$disconnect();
}
