require('ts-node').register({
  project: __dirname + '/tsconfig.json',
  transpileOnly: true,
});

module.exports = require('./mikro-orm.config.ts').default;
