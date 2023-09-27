import { registerAs } from '@nestjs/config'
import { seconds } from 'src/common/helper/constants/helper.function.constant'

export default registerAs(
  'auth',
  (): Record<string, any> => ({
    accessToken: {
      secretKey: process.env.AUTH_JWT_ACCESS_TOKEN_SECRET_KEY,
      expirationTime: seconds(
        process.env.AUTH_JWT_ACCESS_TOKEN_EXPIRED,
      ),
      notBeforeExpirationTime: seconds('0'),
    },

    refreshToken: {
      secretKey: process.env.AUTH_JWT_REFRESH_TOKEN_SECRET_KEY,
      expirationTime: seconds(
        process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRED,
      ), // 14 days
      notBeforeExpirationTime: seconds(
        process.env.AUTH_JWT_REFRESH_TOKEN_NOT_BEFORE_EXPIRATION,
      ), // 1 hours
    },

    subject: process.env.AUTH_JWT_SUBJECT,
    audience: process.env.AUTH_JWT_AUDIENCE,
    issuer: process.env.AUTH_JWT_ISSUER,
    prefixAuthorization: 'Bearer',

    password: {
      attempt: true,
      maxAttempt: 5,
      expiredIn: seconds('182d'),
    },

    googleOAuth2: {
      clientId: process.env.SSO_GOOGLE_CLIENT_ID,
      clientSecret: process.env.SSO_GOOGLE_CLIENT_SECRET,
      callbackUrlLogin: process.env.SSO_GOOGLE_CALLBACK_URL_LOGIN,
      callbackUrlSignUp: process.env.SSO_GOOGLE_CALLBACK_URL_SIGN_UP,
    },
  }),
)
