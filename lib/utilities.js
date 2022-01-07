const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const pluralize = require('pluralize');

const pascalCase = (str) => {
  const tokens = str.split(/-|_/);
  const result = tokens.map(t => t.substr(0, 1).toUpperCase() + t.substr(1)).join('');
  return pluralize.singular(result);
}

const kebabCase = (str) => {
  return pluralize.singular(_.kebabCase(str))
}

const ensureDirExists = (root, dir) => {
  return dir.split(/\\|\//).reduce((fullPath, part) => {
    if (part) fullPath = path.join(fullPath, part)
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath)
    return fullPath
  }, root)
}

module.exports = {
  pascalCase,
  kebabCase,
  ensureDirExists
}