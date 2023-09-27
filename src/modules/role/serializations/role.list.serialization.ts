import { ApiProperty } from '@nestjs/swagger'
import { RoleGetSerialization } from './role.get.serialization'
import { UserEntity } from 'src/modules/user/repository/entities/user.entity'

export class RoleListSerialization extends RoleGetSerialization {
  @ApiProperty()
  readonly users: UserEntity[]
}
