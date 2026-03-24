import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 1. Initialize the pg pool with higher capacity for transactions
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
  connectionString,
  max: 20, // Increase max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// 2. Wrap the pool with Prisma's driver adapter
const adapter = new PrismaPg(pool as any);

// 3. Pass the adapter into the PrismaClient constructor
const prismaClientSingleton = () => {
  return new PrismaClient({ 
    adapter,
    log: ['error', 'warn']
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;