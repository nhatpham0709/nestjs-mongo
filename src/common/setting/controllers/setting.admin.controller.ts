import { BadRequestException, Body, Controller, Get, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthJwtAdminAccessProtected } from 'src/common/auth/decorators/auth.jwt.decorator'
import {
  ENUM_POLICY_ACTION,
  ENUM_POLICY_SUBJECT,
} from 'src/common/policy/constants/policy.enum.constant'
import { PolicyAbilityProtected } from 'src/common/policy/decorators/policy.decorator'
import { RequestParamGuard } from 'src/common/request/decorators/request.decorator'
import {
  Response,
  ResponsePaging,
} from 'src/common/response/decorators/response.decorator'
import {
  IResponse,
  IResponsePaging,
} from 'src/common/response/interfaces/response.interface'
import { ResponseIdSerialization } from 'src/common/response/serializations/response.id.serialization'
import { ENUM_SETTING_STATUS_CODE_ERROR } from 'src/common/setting/constants/setting.status-code.constant'
import { SettingAdminUpdateGuard } from 'src/common/setting/decorators/setting.admin.decorator'
import { GetSetting } from 'src/common/setting/decorators/setting.decorator'
import { SettingAdminUpdateDoc } from 'src/common/setting/docs/setting.admin.doc'
import { SettingRequestDto } from 'src/common/setting/dtos/setting.request.dto'
import { SettingUpdateValueDto } from 'src/common/setting/dtos/setting.update-value.dto'
import {
  SettingDoc,
  SettingEntity,
} from 'src/common/setting/repository/entities/setting.entity'
import { SettingService } from 'src/common/setting/services/setting.service'
import { SettingPublicGetDoc, SettingPublicListDoc } from '../docs/setting.public.doc'
import { PaginationQuery } from 'src/common/pagination/decorators/pagination.decorator'
import {
  SETTING_DEFAULT_AVAILABLE_ORDER_BY,
  SETTING_DEFAULT_AVAILABLE_SEARCH,
  SETTING_DEFAULT_ORDER_BY,
  SETTING_DEFAULT_ORDER_DIRECTION,
  SETTING_DEFAULT_PER_PAGE,
} from '../constants/setting.list.constant'
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto'
import { SettingListSerialization } from '../serializations/setting.list.serialization'
import { PaginationService } from 'src/common/pagination/services/pagination.service'
import { SettingGetSerialization } from '../serializations/setting.get.serialization'

@ApiTags('Admin/Settings')
@Controller({
  version: '1',
  path: '/setting',
})
export class SettingAdminController {
  constructor(
    private readonly settingService: SettingService,
    private readonly paginationService: PaginationService,
  ) {}

  @SettingPublicListDoc()
  @ResponsePaging('setting.list', {
    serialization: SettingListSerialization,
  })
  @Get('/list')
  async list(
    @PaginationQuery(
      SETTING_DEFAULT_PER_PAGE,
      SETTING_DEFAULT_ORDER_BY,
      SETTING_DEFAULT_ORDER_DIRECTION,
      SETTING_DEFAULT_AVAILABLE_SEARCH,
      SETTING_DEFAULT_AVAILABLE_ORDER_BY,
    )
    { _search, _limit, _offset, _order }: PaginationListDto,
  ): Promise<IResponsePaging> {
    const find: Record<string, any> = {
      ..._search,
    }

    const settings: SettingEntity[] = await this.settingService.findAll(find, {
      paging: {
        limit: _limit,
        offset: _offset,
      },
      order: _order,
    })
    const total: number = await this.settingService.getTotal(find)
    const totalPage: number = this.paginationService.totalPage(total, _limit)

    return {
      _pagination: { total, totalPage },
      data: settings,
    }
  }

  @SettingPublicGetDoc()
  @Response('setting.get', {
    serialization: SettingGetSerialization,
  })
  @SettingAdminUpdateGuard()
  @RequestParamGuard(SettingRequestDto)
  @PolicyAbilityProtected({
    subject: ENUM_POLICY_SUBJECT.SETTING,
    action: [ENUM_POLICY_ACTION.READ, ENUM_POLICY_ACTION.UPDATE],
  })
  @Get('get/:setting')
  async get(@GetSetting(true) setting: SettingEntity): Promise<IResponse> {
    return { data: setting }
  }

  @SettingAdminUpdateDoc()
  @Response('setting.update', {
    serialization: ResponseIdSerialization,
  })
  @SettingAdminUpdateGuard()
  @PolicyAbilityProtected({
    subject: ENUM_POLICY_SUBJECT.SETTING,
    action: [ENUM_POLICY_ACTION.READ, ENUM_POLICY_ACTION.UPDATE],
  })
  @AuthJwtAdminAccessProtected()
  @RequestParamGuard(SettingRequestDto)
  @Put('/update/:setting')
  async update(
    @GetSetting() setting: SettingDoc,
    @Body()
    body: SettingUpdateValueDto,
  ): Promise<IResponse> {
    const check = await this.settingService.checkValue(body.value, body.type)
    if (!check) {
      throw new BadRequestException({
        statusCode:
          ENUM_SETTING_STATUS_CODE_ERROR.SETTING_VALUE_NOT_ALLOWED_ERROR,
        message: 'setting.error.valueNotAllowed',
      })
    }

    await this.settingService.updateValue(setting, body)

    return {
      data: { _id: setting._id },
    }
  }
}
