import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class UserLoginDto {
  @ApiProperty({
    example: faker.internet.email(),
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @Type(() => String)
  readonly email: string

  @ApiProperty({
    example: faker.internet.password(),
    required: true,
  })
  @IsNotEmpty()
  @Type(() => String)
  readonly password: string
}
