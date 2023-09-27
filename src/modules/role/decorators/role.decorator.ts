import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { IRequestApp } from 'src/common/request/interfaces/request.interface'
import {
  RoleDoc,
  RoleEntity,
} from 'src/modules/role/repository/entities/role.entity'

export const GetRole = createParamDecorator(
  async (returnPlain: boolean, ctx: ExecutionContext): Promise<RoleDoc | RoleEntity> => {
    const { __role } = ctx
      .switchToHttp()
      .getRequest<IRequestApp & { __role: RoleDoc }>()
    return returnPlain ? (await __role.populate('users')).toObject() : __role
  },
)
