'use strict'

const Promise = require('bluebird')

const Bookshelf = require('database')
const logger = require('util/logger')

const Organization = Bookshelf.Model.extend({
  tableName: 'organizations'
})

module.exports = Bookshelf.model('Organization', Organization)
