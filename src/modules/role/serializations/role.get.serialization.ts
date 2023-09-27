import { faker } from '@faker-js/faker';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
    ENUM_POLICY_ACTION,
    ENUM_POLICY_SUBJECT,
} from 'src/common/policy/constants/policy.enum.constant';
import { ResponseIdSerialization } from 'src/common/response/serializations/response.id.serialization';
import { ENUM_ROLE_TYPE } from 'src/modules/role/constants/role.enum.constant';
import { UserGetSerialization } from 'src/modules/user/serializations/user.get.serialization';

export class PermissionSerialization {
    @ApiProperty({
        required: true,
        nullable: false,
        description: 'Permission subject',
        enum: ENUM_POLICY_SUBJECT,
    })
    subject: ENUM_POLICY_SUBJECT;

    @ApiProperty({
        required: true,
        nullable: false,
        description: 'Permission action base on subject',
        isArray: true,
        enum: ENUM_POLICY_ACTION,
        default: Object.values(ENUM_POLICY_ACTION),
    })
    action: ENUM_POLICY_ACTION[];
}

export class RoleGetSerialization extends ResponseIdSerialization {
    @ApiProperty({
        description: 'Name of role',
        example: faker.person.jobTitle(),
        required: true,
        nullable: false,
    })
    readonly name: string;

    @ApiProperty({
        description: 'Description of role',
        example: faker.lorem.sentence(),
        required: false,
        nullable: true,
    })
    readonly description?: string;

    @ApiProperty({
        description: 'Active flag of role',
        example: true,
        required: true,
        nullable: false,
    })
    readonly isActive: boolean;

    @ApiProperty({
        description: 'Representative for role type',
        example: ENUM_ROLE_TYPE.ADMIN,
        required: true,
        nullable: false,
    })
    readonly type: ENUM_ROLE_TYPE;

    @ApiProperty({
        type: () => PermissionSerialization,
        required: true,
        nullable: false,
        default: [],
    })
    @Type(() => PermissionSerialization)
    readonly permissions: PermissionSerialization;

    @Expose()
    @ApiProperty({
        type: () => UserGetSerialization,
        required: true,
        nullable: false,
        default: [],
    })
    @Type(() => UserGetSerialization)
    readonly users: UserGetSerialization;    

    @ApiProperty({
        description: 'Date created at',
        example: faker.date.recent(),
        required: true,
        nullable: false,
    })
    readonly createdAt: Date;

    @ApiProperty({
        description: 'Date updated at',
        example: faker.date.recent(),
        required: true,
        nullable: false,
    })
    readonly updatedAt: Date;

    @ApiHideProperty()
    @Exclude()
    readonly deletedAt?: Date;


}
