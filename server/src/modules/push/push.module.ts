import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { PushController } from './push.controller'
import { PushSchedulerService } from './push-scheduler.service'

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [PushController],
  providers: [PushSchedulerService],
})
export class PushModule {}