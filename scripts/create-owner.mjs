import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${Buffer.from(derived).toString('hex')}`;
}

const rl = createInterface({ input, output });
try {
  const name = (await rl.question('Owner name: ')).trim();
  const email = (await rl.question('Owner email / user ID: ')).trim().toLowerCase();
  const password = await rl.question('Owner password: ', { hideEchoBack: true });
  if (!name || !email || !password || password.length < 6) {
    throw new Error('Name/email are required and password must be at least 10 characters.');
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: 'OWNER' },
    create: { name, email, passwordHash, role: 'OWNER' },
    select: { id: true, name: true, email: true, role: true },
  });
  console.log(`\nOwner account ready: ${user.email} (${user.role})`);
} finally {
  rl.close();
  await prisma.$disconnect();
}
