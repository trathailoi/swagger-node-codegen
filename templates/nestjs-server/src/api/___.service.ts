import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseService } from '../common/base.service'
import { LoggerService } from '../../logger/custom.logger'
import { {{pascalCase operation_name}} } from './{{lowercase operation_name}}.entity'

@Injectable()
export class {{pascalCase operation_name}}Service extends BaseService<{{pascalCase operation_name}}> {
  constructor(
    @InjectRepository({{pascalCase operation_name}}) private readonly repo: Repository<{{pascalCase operation_name}}>,
    logger: LoggerService
  ) {
    super(repo, logger)
  }
}
