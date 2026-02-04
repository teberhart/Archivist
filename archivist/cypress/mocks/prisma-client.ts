export class PrismaClientKnownRequestError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

export const Prisma = {
  PrismaClientKnownRequestError,
};

export class PrismaClient {}
