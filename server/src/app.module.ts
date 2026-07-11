import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { DbModule } from '@/modules/db/db.module'
import { StorageModule } from '@/modules/storage/storage.module'
import { CoursesModule } from '@/modules/courses/courses.module'
import { SeriesModule } from '@/modules/series/series.module'
import { InstructorsModule } from '@/modules/instructors/instructors.module'
import { ProgressModule } from '@/modules/progress/progress.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { AuthGuard } from '@/modules/auth/auth.guard'
import { PushModule } from '@/modules/push/push.module'
import { AdminModule } from '@/modules/admin/admin.module'
import { MetricsModule } from '@/modules/metrics/metrics.module'
import { PaymentsModule } from '@/modules/payments/payments.module'
import { CommunityModule } from '@/modules/community/community.module'
import { RecommendationsModule } from '@/modules/recommendations/recommendations.module'
import { RoomsModule } from '@/modules/rooms/rooms.module'
import { AnalyticsModule } from '@/modules/analytics/analytics.module'
import { RepositoriesModule } from '@/repositories/repositories.module'

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    DbModule,
    RepositoriesModule,
    StorageModule,
    CoursesModule,
    SeriesModule,
    InstructorsModule,
    ProgressModule,
    AuthModule,
    AdminModule,
    MetricsModule,
    PaymentsModule,
    CommunityModule,
    RecommendationsModule,
    RoomsModule,
    AnalyticsModule,
    PushModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
