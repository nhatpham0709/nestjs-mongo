import { registerAs } from '@nestjs/config'
import { seconds } from 'src/common/helper/constants/helper.function.constant'

export default registerAs(
  'helper',
  (): Record<string, any> => ({
    jwt: {
      secretKey: '123456',
      expirationTime: seconds('1h'),
      notBeforeExpirationTime: seconds('0'),
    },
  }),
)
