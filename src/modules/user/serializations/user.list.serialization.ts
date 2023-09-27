import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization'
import { RoleListSerialization } from 'src/modules/role/serializations/role.list.serialization'
import { UserGetSerialization } from './user.get.serialization'

export class UserListSerialization extends OmitType(UserGetSerialization, [
  'photo',
] as const) {
  @ApiProperty({
    type: () => RoleListSerialization,
    required: true,
    nullable: false,
  })
  @ApiHideProperty()
  @Exclude()
  readonly photo?: AwsS3Serialization
}
