import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { {{pascalCase operation_name}}Service } from './{{lowercase operation_name}}.service'
import { {{pascalCase operation_name}}Controller } from './{{lowercase operation_name}}.controller'
import { {{pascalCase operation_name}} } from './{{lowercase operation_name}}.entity'

import { Mapper } from '../common/mapper'

@Module({
  imports: [TypeOrmModule.forFeature([{{pascalCase operation_name}}])],
  controllers: [{{pascalCase operation_name}}Controller],
  providers: [
    {{pascalCase operation_name}}Service,
    Mapper
  ]
})
export class {{pascalCase operation_name}}Module {}
