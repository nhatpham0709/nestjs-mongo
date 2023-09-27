import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from 'src/common/auth/auth.module';
import { AuthController } from 'src/common/auth/controllers/auth.controller';
import { AwsModule } from 'src/common/aws/aws.module';
import { MailModule } from 'src/common/mail/mail.module';
import { RoleModule } from 'src/modules/role/role.module';
import { UserAuthController } from 'src/modules/user/controllers/user.auth.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [UserAuthController, AuthController],
    providers: [],
    exports: [],
    imports: [UserModule, AuthModule, AwsModule, TerminusModule, AuthModule, RoleModule, MailModule],
})
export class RoutesAuthModule {}
