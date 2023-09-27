import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { hashSync } from 'bcryptjs'
import { HelperDateService } from 'src/common/helper/services/helper.date.service'
import { HelperStringService } from 'src/common/helper/services/helper.string.service'

@Injectable()
export class AuthService {
  private readonly accessTokenSecretKey: string
  private readonly accessTokenExpirationTime: number
  private readonly accessTokenNotBeforeExpirationTime: number

  private readonly refreshTokenSecretKey: string
  private readonly refreshTokenExpirationTime: number
  private readonly refreshTokenNotBeforeExpirationTime: number

  private readonly passwordExpiredIn: number

  constructor(
    private readonly helperDateService: HelperDateService,
    private readonly helperStringService: HelperStringService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenSecretKey = this.configService.get<string>(
      'auth.accessToken.secretKey',
    )
    this.accessTokenExpirationTime = this.configService.get<number>(
      'auth.accessToken.expirationTime',
    )
    this.accessTokenNotBeforeExpirationTime = this.configService.get<number>(
      'auth.accessToken.notBeforeExpirationTime',
    )

    this.refreshTokenSecretKey = this.configService.get<string>(
      'auth.refreshToken.secretKey',
    )
    this.refreshTokenExpirationTime = this.configService.get<number>(
      'auth.refreshToken.expirationTime',
    )
    this.refreshTokenNotBeforeExpirationTime = this.configService.get<number>(
      'auth.refreshToken.notBeforeExpirationTime',
    )

    this.passwordExpiredIn = this.configService.get<number>(
      'auth.password.expiredIn',
    )
  }

  async createAccessToken(payload: any): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecretKey,
      expiresIn: this.accessTokenExpirationTime,
      notBefore: this.accessTokenNotBeforeExpirationTime,
    })
  }

  async createRefreshToken(payload: any): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecretKey,
      expiresIn: this.refreshTokenExpirationTime,
      notBefore: this.refreshTokenNotBeforeExpirationTime,
    })
  }

  async createPassword(password: string): Promise<any> {
    const passwordExpired: Date = this.helperDateService.forwardInSeconds(
      this.passwordExpiredIn,
    )
    const passwordCreated: Date = this.helperDateService.create()
    const passwordHash = hashSync(password)

    return {
      passwordHash,
      passwordExpired,
      passwordCreated,
    }
  }

  async createPasswordRandom(): Promise<string> {
    return this.helperStringService.random(15)
  }

  async checkPasswordExpired(passwordExpired: Date): Promise<boolean> {
    const today: Date = this.helperDateService.create()
    const passwordExpiredConvert: Date =
      this.helperDateService.create(passwordExpired)

    return today > passwordExpiredConvert
  }
}
