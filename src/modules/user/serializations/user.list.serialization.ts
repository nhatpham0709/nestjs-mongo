import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization'
import { RoleListSerialization } from 'src/modules/role/serializations/role.list.serialization'
import { UserEntity } from '../repository/entities/user.entity'

export class UserListSerialization extends OmitType(UserEntity, [
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

  @ApiHideProperty()
  @Exclude()
  readonly password: string
}
