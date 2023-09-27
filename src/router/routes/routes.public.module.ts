import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { MessagePublicController } from 'src/common/message/controllers/message.public.controller'
import { SettingPublicController } from 'src/common/setting/controllers/setting.public.controller'

@Module({
  controllers: [MessagePublicController, SettingPublicController],
  providers: [],
  exports: [],
  imports: [TerminusModule],
})
export class RoutesPublicModule {}
