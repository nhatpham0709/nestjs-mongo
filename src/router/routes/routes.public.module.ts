import { Module } from '@nestjs/common'
import { SettingPublicController } from 'src/common/setting/controllers/setting.public.controller'

@Module({
  controllers: [SettingPublicController],
  providers: [],
  exports: [],
  imports: [],
})
export class RoutesPublicModule {}
