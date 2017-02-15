'use strict'

var debug = require('debug')('egret:migration')

exports.up = function(knex, Promise) {
  const createTable = knex.schema.createTable('organizations', function (table) {
    table.increments('id')
      .primary()
    table.string('atlassian_org')
      .notNullable()
    table.timestamps(true)
    table.string('github_org')
      .unique()
    table.integer('github_org_id')
      .unique()
  })
  debug(createTable.toString())
  return createTable
};

exports.down = function(knex, Promise) {
  var dropTable = knex.schema.dropTable('organizations')
  debug(dropTable.toString())
  return dropTable
};
