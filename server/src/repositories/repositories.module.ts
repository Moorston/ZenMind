import { Global, Module } from '@nestjs/common'
import { CoursesRepository } from './courses.repository'
import { SeriesRepository } from './series.repository'
import { InstructorsRepository } from './instructors.repository'
import { ProgressRepository } from './progress.repository'
import { UsersRepository } from './users.repository'
import { SessionsRepository } from './sessions.repository'
import { PushTokensRepository } from './push-tokens.repository'

@Global()
@Module({
  providers: [
    CoursesRepository,
    SeriesRepository,
    InstructorsRepository,
    ProgressRepository,
    UsersRepository,
    SessionsRepository,
    PushTokensRepository,
  ],
  exports: [
    CoursesRepository,
    SeriesRepository,
    InstructorsRepository,
    ProgressRepository,
    UsersRepository,
    SessionsRepository,
    PushTokensRepository,
  ],
})
export class RepositoriesModule {}
