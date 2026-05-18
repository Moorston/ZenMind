import { Module } from '@nestjs/common'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { DbModule } from '@/modules/db/db.module'
import { StorageModule } from '@/modules/storage/storage.module'
import { CoursesModule } from '@/modules/courses/courses.module'
import { SeriesModule } from '@/modules/series/series.module'
import { InstructorsModule } from '@/modules/instructors/instructors.module'
import { ProgressModule } from '@/modules/progress/progress.module'
import { AuthModule } from '@/modules/auth/auth.module'

@Module({
  imports: [
    DbModule,
    StorageModule,
    CoursesModule,
    SeriesModule,
    InstructorsModule,
    ProgressModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
