import { Test, TestingModule } from '@nestjs/testing'
import { {{pascalCase operation_name}}Service } from './{{lowercase operation_name}}.service'

describe('{{pascalCase operation_name}}Service', () => {
  let service: {{pascalCase operation_name}}Service

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{{pascalCase operation_name}}Service]
    }).compile()

    service = module.get<{{pascalCase operation_name}}Service>({{pascalCase operation_name}}Service)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
