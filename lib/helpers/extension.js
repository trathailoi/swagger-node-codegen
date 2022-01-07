const _ = require('lodash');
const pluralize = require('pluralize');
const swaggerToJoi = require('swagger-to-joi');
const HttpStatus = require('./http-status-codes');
const { pascalCase, kebabCase } = require('../utilities');

const getSchemaModel = (schema) => {
  let modelName = ''
  if (schema.$ref) {
    modelName = schema.$ref.substr(('#/components/schemas/').length);
  } else if (schema.items && schema.items.$ref) {
    modelName = schema.items.$ref.substr(('#/components/schemas/').length);
  }
  return modelName
}

const getApiResponse = (statusCode) => {
  const constant = HttpStatus[statusCode];
  const tokens = constant.split('_');
  const result = tokens.map(t => _.capitalize(t)).join('');
  return `Api${result}Response`;
}

const typeMap = {
  'string': 'string',
  'uuid': 'string',
  'number': 'number',
  'integer': 'number',
  'boolean': 'boolean',
  'array': 'Array<any>',
  'object': 'any',
};

function handlebarsExt(Handlebars) {
  Handlebars.registerHelper('plural', (str) => {
    return pluralize.plural(str);
  });

  Handlebars.registerHelper('allcaps', (str) => {
    return str ? str.toUpperCase() : '';
  });

  Handlebars.registerHelper('capitalize', (str) => {
    return _.capitalize(str);
  });

  Handlebars.registerHelper('lowercase', (str) => {
    return str ? pluralize.singular(str.toLowerCase()) : '';
  });

  Handlebars.registerHelper('camelCase', (str) => {
    return pluralize.singular(str.split('-').map((t, idx) => idx > 0 ? (t.substr(0, 1).toUpperCase() + t.substr(1)) : t).join(''));
  });

  Handlebars.registerHelper('pascalCase', pascalCase);

  Handlebars.registerHelper('kebabCase', kebabCase);

  Handlebars.registerHelper('inline', (str) => {
    return str ? str.replace(/\n/g, '') : '';
  });

  Handlebars.registerHelper('quote', (str) => {
    return /[$&@-]/.test(str) ? `'${str}'` : str
  });

  Handlebars.registerHelper('isEqual', (arg1, arg2) => {
    return arg1 === arg2
  });

  Handlebars.registerHelper('json', (str) => {
    return new Handlebars.SafeString(JSON.stringify(str, null, 5));
  });

  // region: Function handlers .dto file
  Handlebars.registerHelper('getRequired', (model, key) => {
    if (Array.isArray(model.required) && model.required.length) {
      return model.required.includes(key)
    }
    return false
  });

  Handlebars.registerHelper('getDtoType', (type) => {
    if (type.$ref) {
      return typeMap[type.$ref.substr(('#/components/schemas/').length)] || 'any';
    }
    switch (type.type) {
      case 'array':
        return new Handlebars.SafeString(`Array<${type.items.type || typeMap[type.items.$ref.substr(('#/components/schemas/').length)] || 'any'}>`);
      case 'object':
        return type.$ref ? type.$ref.substr(('#/components/schemas/').length) : 'any';
      default:
        return typeMap[type.type] || 'any'
    }
  });

  Handlebars.registerHelper('getDtoProperties', (model, schemas) => {
    let properties = {}
    if ('properties' in model) {
      properties = model.properties
    } else if ('allOf' in model) {
      model.allOf.forEach((propertiesDefinition) => {
        if ('$ref' in propertiesDefinition) {
          const component = schemas[getSchemaModel(propertiesDefinition)]
          properties = { ...properties, ...component.properties }
        } else if ('properties' in propertiesDefinition) {
          properties = { ...properties, ...propertiesDefinition.properties }
        }
      })
    } else if ('$ref' in model) {
      const component = schemas[getSchemaModel(model)]
      properties = component.properties
    }
    return properties
  });
  // endregion: Function handrs .dto file

  Handlebars.registerHelper('importCommon', (operation) => {
    const result = operation.reduce((opKeys, op) => _.uniq([
      ...opKeys,
      ...Object.keys(op.path).filter(k => k !== 'endpointName').map(k => pascalCase(k))
    ]), []);

    for (const op of operation) {
      for (const key in op.path) {
        if (key !== 'endpointName' && Object.hasOwnProperty.call(op.path, key)) {
          if (_.get(op.path[key], 'requestBody')) {
            result.push('Body')
          }
          if (_.get(op.path[key], 'parameters') && _.get(op.path[key], 'parameters').some(p => p.in === 'path')) {
            result.push('Param')
          }
          if (_.get(op.path[key], 'parameters') && _.get(op.path[key], 'parameters').some(p => p.in === 'query')) {
            result.push('Query')
          }
        }
      }
    }
    return _.uniq(result).join(', ');
  });

  Handlebars.registerHelper('importSwagger', (operation) => {
    const result = ['ApiTags'];
    for (const op of operation) {
      for (const key in op.path) {
        if (Object.hasOwnProperty.call(op.path, key) && _.get(op.path[key], 'responses')) {
          Object.keys(op.path[key].responses).forEach(k => result.push(getApiResponse(k)))
        }
      }
    }
    return _.uniq(result).join(', ');
  });

  Handlebars.registerHelper('importDto', (operation) => {
    const result = [];
    for (const op of operation) {
      for (const key in op.path) {
        if (key !== 'endpointName' && _.get(op.path[key], 'requestBody.content.application/json')) {
          const schema = _.get(op.path[key], 'requestBody.content.application/json.schema');
          const dtoSchemaName = getSchemaModel(schema);
          result.push(dtoSchemaName);
        }
      }
    }
    return _.uniq(result)
  });

  Handlebars.registerHelper('getEndPoint', (path) => {
    return path.substr(1);
  });

  Handlebars.registerHelper('getHttpStatus', (responses) => {
    const statusCode2xx = Object.keys(responses).filter(key => key.startsWith('2'));
    return HttpStatus[statusCode2xx];
  });
 
  Handlebars.registerHelper('getApiResponse', getApiResponse);

  Handlebars.registerHelper('getApiResponseProperty', (response, property) => {
    if (response && response.content && response.content['application/json']) {
      const schema = response.content['application/json'].schema;
      switch (property) {
        case 'type':
          return getSchemaModel(schema)
        case 'isArray':
          return schema.type === 'array'
        default:
          break
      };
    };
  });

  Handlebars.registerHelper('getJoiValidation', (route, swagger) => {
    const joiTextObject = swaggerToJoi(_.cloneDeep(route), swagger.components, swagger.openapi)
    for (const key in joiTextObject) {
      if (Object.hasOwnProperty.call(joiTextObject, key)) {
        joiTextObject[key] = joiTextObject[key].replace(/\n/gm, '$&  ');
      }
    }
    if (joiTextObject.path) {
      joiTextObject.param = joiTextObject.path;
      delete joiTextObject.path;
    }
    return joiTextObject;
  });

  Handlebars.registerHelper('getOperationId', (operationId) => {
    return operationId.split('_')[0];
  });

  Handlebars.registerHelper('getControllerParameters', ({ parameters, requestBody }) => {
    const result = [];
    if (Array.isArray(parameters) && parameters.length) {
      for (const parameter of parameters) {
        if (parameter.in === 'path') {
          let type = parameter.schema ? parameter.schema.type : parameter.type;
          if (parameter.schema && parameter.schema.$ref) {
            type = getSchemaModel(parameter.schema);
          }
          result.push(`@Param('${parameter.name}') ${parameter.name}: ${typeMap[type] || 'any'}`);
        }
      }
    }
    if (requestBody && requestBody.content && requestBody.content['application/json']) {
      const schema = requestBody.content['application/json'].schema;
      const dtoSchemaName = getSchemaModel(schema);
      result.push(`@Body() ${_.camelCase(dtoSchemaName)}: ${pascalCase(dtoSchemaName)}`);
    }
    return new Handlebars.SafeString(result.join(', '))
  });

  Handlebars.registerHelper('getServiceParameters', ({ parameters, requestBody }, moduleName) => {
    const result = [];
    if (Array.isArray(parameters) && parameters.length) {
      for (const parameter of parameters) {
        if (parameter.in === 'path') {
          result.push(parameter.name);
        }
      }
    }
    if (requestBody && requestBody.content && requestBody.content['application/json']) {
      const schema = requestBody.content['application/json'].schema;
      const dtoSchemaName = getSchemaModel(schema);
      result.push(`this.mapper.map(${pascalCase(dtoSchemaName)}, ${pascalCase(moduleName)}, ${_.camelCase(dtoSchemaName)})`);
    }
    return new Handlebars.SafeString(result.join(', '))
  });

  Handlebars.registerHelper('modelsForController', (operation) => {
    const models = {};
    operation.forEach(op => {
      Object.keys(op.path)
      .filter(k => k !== 'endpointName')
      .forEach(k => {
        const responses = op.path[k].responses;
        if (responses) {
          Object.keys(responses)
            .forEach(responseKey => {
              const r = responses[responseKey];
              if (  r &&
                    r.content &&
                    r.content['application/json'] &&
                    r.content['application/json'].schema)
              {
                if (r.content['application/json'].schema.$ref) {
                  const modelName =
                    r.content['application/json'].schema.$ref.substr(('#/components/schemas/').length);
                  models[modelName] = modelName;
                }

                if (r.content['application/json'].schema.type === 'array') {
                  const modelName =
                    r.content['application/json'].schema.items.$ref.substr(('#/components/schemas/').length);
                  models[modelName] = modelName;
                }
              }
            });
        }
      });
    });
    return Object.keys(models).map (m => `${m}Model`).join(',');
  });

  Handlebars.registerHelper('colonToCurlyBrace', (path) => {
    const tokens = path.split('/');
    for (let i = 0;  i < tokens.length; i++) {
      if (tokens[i].substr(0, 1) === ':') {
        tokens[i] = `{${tokens[i].substr(1)}}`;
      }
    }

    return tokens.join('/').substr(1);
  });

  Handlebars.registerHelper('debugger', (obj) => { debugger; });
}

module.exports = handlebarsExt;
