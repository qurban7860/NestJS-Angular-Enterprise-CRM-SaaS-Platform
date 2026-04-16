import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Database adapter initialized');

    // Log slow queries (> 1s) in development
    if (process.env.NODE_ENV !== 'production') {
      (this as any).$on('query', (e: any) => {
        if (e.duration > 1000) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }

    (this as any).$on('error', (e: any) => {
      this.logger.error(`Prisma error: ${e.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Helper: soft-delete aware findMany — excludes isDeleted=true rows
   */
  async softFindMany<T>(
    model: string,
    args: Record<string, any> = {},
  ): Promise<T[]> {
    return (this as any)[model].findMany({
      ...args,
      where: { ...args.where, isDeleted: false },
    });
  }
}
