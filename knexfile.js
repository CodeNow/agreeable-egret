require('loadenv')() // Required for migrations

module.exports = require('knex')({
  client: 'pg',
  connection: process.env.POSTGRES_CONNECT_STRING,
  migrations: {
    tableName: 'migrations'
  },
  pool: {
    min: process.env.POSTGRES_POOL_MIN,
    max: process.env.POSTGRES_POOL_MAX
  }
})
