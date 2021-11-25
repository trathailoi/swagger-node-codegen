import { Request, ResponseToolkit } from '@hapi/hapi'
import { inject, injectable } from 'inversify'
import { TYPES } from '../ioc/types'
import { Logger } from 'winston'
import { HapiRoute } from '../decorators/decorators'
import { HapiController } from './hapi-controller'
import * as Joi from '@hapi/joi'
import * as Boom from '@hapi/boom'
import { Mapper } from '../helpers/mapper'
import { I{{pascalCase operation_name}}Controller } from './interfaces/{{lowercase operation_name}}.interface'

import { {{pascalCase operation_name}}Service } from '../service/{{lowercase operation_name}}.service'
// import { {{pascalCase operation_name}}Model } from '../dto/{{lowercase operation_name}}'
// import { {{pascalCase operation_name}} } from '../entity/{{lowercase operation_name}}'

@injectable()
class {{pascalCase operation_name}}Controller extends HapiController implements I{{pascalCase operation_name}}Controller {

  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.{{pascalCase operation_name}}Service) private service: {{pascalCase operation_name}}Service,
    @inject(TYPES.Mapper) private mapper: Mapper)
  {
    super()
    this.logger.info('Created controller {{pascalCase operation_name}}Controller')
  }

{{#each operation}}
  {{#each this.path}}
    {{#validMethod @key}}
// #region {{../operationId}}
/**
 {{#each ../descriptionLines}}
 * {{{this}}}
 {{/each}}
 */
  @HapiRoute({
    method: '{{allcaps @key}}',
    path: '{{colonToCurlyBrace ../../path_name}}',
    options: {
      validate: { },
      description: '{{ ../summary }}',
      tags: [{{#each ../tags}}'{{this}}',{{/each}}],
      auth: false
    }
  })
  public async {{../operationId}}(request: Request, toolkit: ResponseToolkit) {
    return toolkit.response().code(501)
  }
// #endregion

    {{/validMethod}}
  {{/each}}
{{/each}}
}

export { {{pascalCase operation_name}}Controller }
