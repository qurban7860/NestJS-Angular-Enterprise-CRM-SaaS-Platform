import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CoreModule } from './core/core.module';
import { AuthModule } from './features/auth/auth.module';
import { CrmModule } from './features/crm/crm.module';
import { TasksModule } from './features/tasks/tasks.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { FilesModule } from './features/files/files.module';
import { SystemModule } from './features/system/system.module';
import { BillingModule } from './features/billing/billing.module';
import { GlobalExceptionFilter } from './core/presentation/filters/global-exception.filter';
import { LoggingInterceptor } from './core/presentation/interceptors/logging.interceptor';
import { TransformInterceptor } from './core/presentation/interceptors/transform.interceptor';
import { AuditInterceptor } from './core/presentation/interceptors/audit.interceptor';
import { JwtAuthGuard } from './features/auth/presentation/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    // ── Config ─────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Rate Limiting ───────────────────────────────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // ── Core (Prisma, Redis, Logger, Audit) ─────────────────
    CoreModule,

    // ── Feature Modules ─────────────────────────────────────
    AuthModule,
    CrmModule,
    TasksModule,
    DashboardModule,
    NotificationsModule,
    FilesModule,
    SystemModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Guards
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // Global Filters
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },

    // Global Interceptors
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
