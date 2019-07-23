
const path = require('path');

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}

module.exports = function(config, env) {
  // 别名
  config.resolve.alias = {
    '@': resolve('src')
  }

  return config
}

