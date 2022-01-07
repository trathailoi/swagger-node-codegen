import { ApiProperty } from '@nestjs/swagger'

export class {{pascalCase model_name}}Dto implements Readonly<{{pascalCase model_name}}Dto> {
  {{#each (getDtoProperties model schemas)}}
  @ApiProperty({ example: '{{this.example}}'{{#if (isEqual (getRequired ../model @key) false)}}, required: false{{/if}} })
    {{@key}}{{#if (isEqual (getRequired ../model @key) false)}}?{{/if}}: {{getDtoType this}}

  {{/each}}
}
