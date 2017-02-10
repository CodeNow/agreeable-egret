'use strict'

require('loadenv')()

/**
 * Database connection via knex query builder.
 * @module big-poppa:database
 */
const knex = require('knex')({
  client: 'pg',
  connection: process.env.POSTGRES_CONNECT_STRING,
  pool: {
    min: process.env.POSTGRES_POOL_MIN,
    max: process.env.POSTGRES_POOL_MAX
  }
})

const bookshelf = require('bookshelf')(knex)

bookshelf.plugin('registry');

module.exports = bookshelf
