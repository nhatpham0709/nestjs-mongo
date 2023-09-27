import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { MailerService } from 'src/common/mailer/mailer.service'
import path from 'path'

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async signUp(email: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: this.i18n.t('mail.signUp.subject', {
        lang: I18nContext.current().lang,
      }),
      templatePath: path.join(
        'src',
        'common',
        'mail',
        'templates',
        'activation.hbs',
      ),
      context: {
        title: this.i18n.t('mail.signUp.subject', {
          lang: I18nContext.current().lang,
        }),
        app_name: this.configService.get('app.name'),
      },
    })
  }
}
