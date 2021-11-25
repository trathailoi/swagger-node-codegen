import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import { Repository } from 'typeorm'
import { TYPES } from '../ioc/types'
import { CrudService } from './crudservice'
import { {{pascalCase operation_name}} } from '../entity/{{lowercase operation_name}}'

@injectable()
class {{pascalCase operation_name}}Service extends CrudService<{{pascalCase operation_name}}> {
  constructor(
    @inject(TYPES.{{pascalCase operation_name}}Repository) repository: Repository<{{pascalCase operation_name}}>,
    @inject(TYPES.Logger) logger: Logger
  ) {
    super(repository, logger)
    this.logger.info('Created {{pascalCase operation_name}}Service')
  }
}

export { {{pascalCase operation_name}}Service }
