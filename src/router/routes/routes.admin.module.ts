import { Module } from '@nestjs/common'
import { ApiKeyModule } from 'src/common/api-key/api-key.module'
import { ApiKeyAdminController } from 'src/common/api-key/controllers/api-key.admin.controller'
import { AuthModule } from 'src/common/auth/auth.module'
import { RoleAdminController } from 'src/modules/role/controllers/role.admin.controller'
import { RoleModule } from 'src/modules/role/role.module'
import { SettingAdminController } from 'src/common/setting/controllers/setting.admin.controller'
import { UserAdminController } from 'src/modules/user/controllers/user.admin.controller'
import { UserModule } from 'src/modules/user/user.module'
import { HealthController } from 'src/health/controllers/health.controller'
import { HealthModule } from 'src/health/health.module'
import { TerminusModule } from '@nestjs/terminus'

@Module({
  controllers: [
    SettingAdminController,
    ApiKeyAdminController,
    RoleAdminController,
    UserAdminController,
    HealthController,
  ],
  providers: [],
  exports: [],
  imports: [
    ApiKeyModule,
    RoleModule,
    UserModule,
    AuthModule,
    HealthModule,
    TerminusModule,
  ],
})
export class RoutesAdminModule {}
