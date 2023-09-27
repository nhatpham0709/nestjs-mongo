import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger'
import { ClientSession, Connection } from 'mongoose'
import {
  AuthGoogleOAuth2LoginProtected,
  AuthGoogleOAuth2SignUpProtected,
} from 'src/common/auth/decorators/auth.google.decorator'
import { AuthJwtPayload } from 'src/common/auth/decorators/auth.jwt.decorator'
import { IAuthGooglePayload } from 'src/common/auth/interfaces/auth.interface'
import { AuthService } from 'src/common/auth/services/auth.service'
import { DatabaseConnection } from 'src/common/database/decorators/database.decorator'
import { ENUM_ERROR_STATUS_CODE_ERROR } from 'src/common/error/constants/error.status-code.constant'
import { Response } from 'src/common/response/decorators/response.decorator'
import { IResponse } from 'src/common/response/interfaces/response.interface'
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/constants/role.status-code.constant'
import { RoleService } from 'src/modules/role/services/role.service'
import { SettingService } from 'src/common/setting/services/setting.service'
import { ENUM_USER_SIGN_UP_FROM } from 'src/modules/user/constants/user.enum.constant'
import {
  ENUM_USER_STATUS_CODE_ERROR,
  ENUM_USER_STATUS_CODE_SUCCESS,
} from 'src/modules/user/constants/user.status-code.constant'
import {
  UserPublicLoginDoc,
  UserPublicSignUpDoc,
} from 'src/modules/user/docs/user.public.doc'
import { UserLoginDto } from 'src/modules/user/dtos/user.login.dto'
import { UserSignUpDto } from 'src/modules/user/dtos/user.sign-up.dto'
import { IUserDoc } from 'src/modules/user/interfaces/user.interface'
import { UserDoc } from 'src/modules/user/repository/entities/user.entity'
import { UserLoginSerialization } from 'src/modules/user/serializations/user.login.serialization'
import { UserService } from 'src/modules/user/services/user.service'
import { MailService } from 'src/common/mail/mail.service'
import { ConfigService } from '@nestjs/config'
import { compareSync } from 'bcryptjs'

@ApiTags('Auth')
@Controller({
  version: '1',
  path: '/',
})
export class AuthController {
  constructor(
    @DatabaseConnection() private readonly databaseConnection: Connection,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly roleService: RoleService,
    private readonly settingService: SettingService,
    private readonly mailSerivce: MailService,
    private readonly configService: ConfigService,
  ) {}

  @UserPublicLoginDoc()
  @Response('user.login', {
    serialization: UserLoginSerialization,
  })
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() { email, password }: UserLoginDto): Promise<IResponse> {
    const user: UserDoc = await this.userService.findOneByEmail(email)
    if (!user) {
      throw new NotFoundException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
        message: 'user.error.notFound',
      })
    }

    const maxPasswordAttempt = this.configService.get<number>(
      'auth.password.maxAttempt',
    )
    if (user.passwordAttempt >= maxPasswordAttempt) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_ATTEMPT_MAX_ERROR,
        message: 'user.error.passwordAttemptMax',
      })
    }

    const validate = compareSync(password, user.password)

    if (!validate) {
      await this.userService.increasePasswordAttempt(user)

      throw new BadRequestException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NOT_MATCH_ERROR,
        message: 'user.error.passwordNotMatch',
      })
    } else if (user.blocked) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_BLOCKED_ERROR,
        message: 'user.error.blocked',
      })
    } else if (user.inactivePermanent) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_PERMANENT_ERROR,
        message: 'user.error.inactivePermanent',
      })
    } else if (!user.isActive) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_ERROR,
        message: 'user.error.inactive',
      })
    }

    const userWithRole: IUserDoc = await this.userService.joinWithRole(user)
    if (!userWithRole.role.isActive) {
      throw new ForbiddenException({
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR,
        message: 'role.error.inactive',
      })
    }

    await this.userService.resetPasswordAttempt(user)

    const accessToken: string =
      await this.authService.createAccessToken(userWithRole)

    const refreshToken: string = await this.authService.createRefreshToken(
      userWithRole._id,
    )

    const checkPasswordExpired: boolean =
      await this.authService.checkPasswordExpired(user.passwordExpired)

    if (checkPasswordExpired) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_SUCCESS.USER_PASSWORD_EXPIRED_ERROR,
        message: 'user.error.passwordExpired',
      })
    }

    return {
      data: {
        expiresIn: this.configService.get<number>(
          'auth.accessToken.expirationTime',
        ),
        accessToken,
        refreshToken,
      },
    }
  }

  @UserPublicSignUpDoc()
  @Response('user.signUp')
  @Post('/register')
  async register(
    @Body()
    { email, mobileNumber, ...body }: UserSignUpDto,
  ): Promise<void> {
    const promises: Promise<any>[] = [
      this.roleService.findOneByName('user'),
      this.userService.existByEmail(email),
    ]

    if (mobileNumber) {
      promises.push(this.userService.existByMobileNumber(mobileNumber))
    }

    const [role, emailExist, mobileNumberExist] = await Promise.all(promises)

    if (emailExist) {
      throw new ConflictException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EMAIL_EXIST_ERROR,
        message: 'user.error.emailExist',
      })
    } else if (mobileNumberExist) {
      throw new ConflictException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_MOBILE_NUMBER_EXIST_ERROR,
        message: 'user.error.mobileNumberExist',
      })
    }

    const password = await this.authService.createPassword(body.password)

    const session = await this.databaseConnection.startSession()
    session.startTransaction()

    try {
      await this.userService.create(
        {
          email,
          mobileNumber,
          signUpFrom: ENUM_USER_SIGN_UP_FROM.LOCAL,
          role: role._id,
          ...body,
        },
        password,
        { session },
      )

      await this.mailSerivce.signUp(email)
      await session.commitTransaction()
      session.endSession()
    } catch (e) {
      await session.abortTransaction()
      session.endSession()

      throw new InternalServerErrorException({
        statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
        message: 'http.serverError.internalServerError',
        _error: e.message,
      })
    }

    return
  }

  @ApiExcludeEndpoint()
  @Response('user.loginGoogle')
  @AuthGoogleOAuth2LoginProtected()
  @Get('/login/google')
  async loginGoogle(): Promise<void> {
    return
  }

  @ApiExcludeEndpoint()
  @Response('user.loginGoogleCallback')
  @AuthGoogleOAuth2LoginProtected()
  @Get('/login/google/callback')
  async loginGoogleCallback(
    @AuthJwtPayload()
    {
      email,
      accessToken: googleAccessToken,
      refreshToken: googleRefreshToken,
    }: IAuthGooglePayload,
  ): Promise<IResponse> {
    const user: UserDoc = await this.userService.findOneByEmail(email)

    if (!user) {
      throw new NotFoundException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
        message: 'user.error.notFound',
      })
    } else if (user.blocked) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_BLOCKED_ERROR,
        message: 'user.error.blocked',
      })
    } else if (user.inactivePermanent) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_PERMANENT_ERROR,
        message: 'user.error.inactivePermanent',
      })
    } else if (!user.isActive) {
      throw new ForbiddenException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_ERROR,
        message: 'user.error.inactive',
      })
    }

    const userWithRole: IUserDoc = await this.userService.joinWithRole(user)
    if (!userWithRole.role.isActive) {
      throw new ForbiddenException({
        statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR,
        message: 'role.error.inactive',
      })
    }

    await this.userService.updateGoogleSSO(user, {
      accessToken: googleAccessToken,
      refreshToken: googleRefreshToken,
    })

    const accessToken = await this.authService.createAccessToken(userWithRole)

    const refreshToken = await this.authService.createRefreshToken(
      userWithRole._id,
    )

    return {
      data: {
        expiresIn: this.configService.get<number>(
          'auth.accessToken.expirationTime',
        ),
        accessToken,
        refreshToken,
      },
    }
  }

  @ApiExcludeEndpoint()
  @Response('user.signUpGoogle')
  @AuthGoogleOAuth2SignUpProtected()
  @Get('/sign-up/google')
  async signUpGoogle(): Promise<void> {
    return
  }

  @ApiExcludeEndpoint()
  @Response('user.signUpGoogleCallback')
  @AuthGoogleOAuth2SignUpProtected()
  @HttpCode(HttpStatus.CREATED)
  @Get('/sign-up/google/callback')
  async signUpGoogleCallback(
    @AuthJwtPayload()
    {
      email,
      firstName,
      lastName,
      accessToken: googleAccessToken,
      refreshToken: googleRefreshToken,
    }: IAuthGooglePayload,
  ): Promise<void> {
    const promises: Promise<any>[] = [
      this.roleService.findOneByName('user'),
      this.userService.existByEmail(email),
    ]

    const [role, emailExist] = await Promise.all(promises)

    if (emailExist) {
      throw new ConflictException({
        statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EMAIL_EXIST_ERROR,
        message: 'user.error.emailExist',
      })
    }

    const session: ClientSession = await this.databaseConnection.startSession()
    session.startTransaction()

    try {
      const passwordString = await this.authService.createPasswordRandom()
      const password = await this.authService.createPassword(passwordString)

      const user: UserDoc = await this.userService.create(
        {
          email,
          firstName,
          lastName,
          password: passwordString,
          role: role._id,
          signUpFrom: ENUM_USER_SIGN_UP_FROM.GOOGLE,
        },
        password,
        { session },
      )

      await this.userService.updateGoogleSSO(
        user,
        {
          accessToken: googleAccessToken,
          refreshToken: googleRefreshToken,
        },
        { session },
      )

      await session.commitTransaction()
      await session.endSession()
    } catch (err: any) {
      await session.abortTransaction()
      await session.endSession()

      throw new InternalServerErrorException({
        statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
        message: 'http.serverError.internalServerError',
        _error: err.message,
      })
    }

    return
  }
  
}
