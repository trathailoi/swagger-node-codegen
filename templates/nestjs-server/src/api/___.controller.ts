import {
  Controller,
  UsePipes, HttpCode, HttpStatus,
  {{importCommon operation}}
} from '@nestjs/common'
import {
  {{importSwagger operation}}
} from '@nestjs/swagger'
import * as Joi from 'joi'

import { Mapper } from '../common/mapper'
import { JoiValidationPipe } from '../common/validation.pipe'
import { MzSwaggerAuth } from '../common/decorator/swagger-auth.decorator'

import { {{pascalCase operation_name}} } from './{{lowercase operation_name}}.entity'
import { {{pascalCase operation_name}}Service } from './{{lowercase operation_name}}.service'
{{#each (importDto operation)}}
import { {{pascalCase this}} } from './dto/{{kebabCase this}}.dto'
{{/each}}

@ApiTags('{{plural operation_name}}')
@MzSwaggerAuth()
@Controller('{{plural operation_name}}')
export class {{pascalCase operation_name}}Controller {
  constructor(
    private readonly {{camelCase operation_name}}Service: {{pascalCase operation_name}}Service,
    private readonly mapper: Mapper
  ) {}

{{#each operation}}
  {{#each this.path}}
    {{#validMethod @key}}
  @{{capitalize @key}}({{#if (getEndPoint ../../subresource)}}'{{getEndPoint ../../subresource}}'{{/if}})
  @HttpCode(HttpStatus.{{getHttpStatus ../responses}})
  {{#each ../responses}}
  @{{getApiResponse @key}}({{#if (isEqual @key '200')}}{ type: {{getApiResponseProperty this 'type'}}, isArray: {{getApiResponseProperty this 'isArray'}} }{{/if}})
  {{/each}}
  @UsePipes(new JoiValidationPipe({
    {{#each (getJoiValidation ../this ../../../swagger)}}
    {{@key}}: {{{this}}},
    {{/each}}
  }))
  async {{getOperationId ../operationId}}({{getControllerParameters ../this}}) {
    const result = await this.{{camelCase ../../../operation_name}}Service.{{getOperationId ../operationId}}({{getServiceParameters ../this ../../../operation_name}})
    {{#if (isEqual (getOperationId ../operationId) 'create')}}
    return result.identifiers[0]
    {{else}}
    return result
    {{/if}}
  }

    {{/validMethod}}
  {{/each}}
{{/each}}
}
