import { Module } from '@nestjs/common'
import { RoomsGateway } from './rooms.gateway'
import { RoomsController } from './rooms.controller'

@Module({
  controllers: [RoomsController],
  providers: [RoomsGateway],
})
export class RoomsModule {}