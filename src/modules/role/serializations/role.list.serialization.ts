import { ApiProperty, OmitType } from '@nestjs/swagger'
import { RoleGetSerialization } from './role.get.serialization'

export class RoleListSerialization extends OmitType(RoleGetSerialization, []) {}
