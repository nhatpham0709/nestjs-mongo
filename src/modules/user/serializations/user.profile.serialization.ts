import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import { UserGetSerialization } from './user.get.serialization'

import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization'
import { ENUM_USER_SIGN_UP_FROM } from '../constants/user.enum.constant'
import { ENUM_POLICY_REQUEST_ACTION, ENUM_POLICY_SUBJECT } from 'src/common/policy/constants/policy.enum.constant'
import { IPolicyRule } from 'src/common/policy/interfaces/policy.interface'
import { ENUM_ROLE_TYPE } from 'src/modules/role/constants/role.enum.constant'

export class UserPermissionSerialization {
  @ApiProperty({
    required: true,
    nullable: false,
    enum: ENUM_POLICY_SUBJECT,
    example: ENUM_POLICY_SUBJECT.API_KEY,
  })
  subject: ENUM_POLICY_SUBJECT

  @ApiProperty({
    required: true,
    nullable: false,
  })
  action: string
}
export class UserProfileSerialization extends OmitType(UserGetSerialization, [
  'isActive',
  'blocked',
  'passwordExpired',
  'passwordCreated',
  'passwordAttempt',
  'inactiveDate',
  'inactivePermanent',
  'blockedDate',
  'role',
  'photo'
] as const) {
  @ApiHideProperty()
  @Exclude()
  readonly isActive: boolean

  @ApiHideProperty()
  @Exclude()
  readonly inactivePermanent: boolean

  @ApiHideProperty()
  @Exclude()
  readonly blocked: boolean

  @ApiHideProperty()
  @Exclude()
  readonly passwordExpired: Date

  @ApiHideProperty()
  @Exclude()
  readonly passwordCreated: Date

  @ApiHideProperty()
  @Exclude()
  readonly passwordAttempt: number

  @ApiHideProperty()
  @Exclude()
  readonly inactiveDate?: Date

  @ApiHideProperty()
  @Exclude()
  readonly blockedDate?: Date

  @ApiHideProperty()
  @Exclude()
  readonly photo?: AwsS3Serialization

  @Expose()
  @Transform(({ obj }) => obj.role.name)
  readonly role: string

  @ApiHideProperty()
  @Exclude()
  readonly signUpFrom: ENUM_USER_SIGN_UP_FROM

  @ApiProperty({
    example: ENUM_ROLE_TYPE.ADMIN,
    type: 'string',
    enum: ENUM_ROLE_TYPE,
    required: true,
    nullable: false,
  })
  @Expose()
  @Transform(({ obj }) => obj.role.type)
  readonly type: ENUM_ROLE_TYPE

  @ApiProperty({
    type: () => UserPermissionSerialization,
    isArray: true,
    required: true,
    nullable: false,
  })
  @Transform(({ obj }) => {
    return obj.role.permissions.map(({ action, subject }: IPolicyRule) => {
      const ac = action.map((l) => ENUM_POLICY_REQUEST_ACTION[l.toUpperCase()])
      return {
        subject,
        action: ac.join(','),
      }
    })
  })
  @Expose()
  readonly permissions: UserPermissionSerialization[]
}
