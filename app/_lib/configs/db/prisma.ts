import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line no-unused-vars
  let prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = (global as any).prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') (global as any).prismaGlobal = prisma;
