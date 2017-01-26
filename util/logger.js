'use strict'

require('loadenv')({ project: 'egret', debugName: 'egret:env' })
const bunyan = require('bunyan')

/**
 * Creates a new lib logger with the given name and custom serializers.
 *
 * @param {string}    name        - Name for the bunyan logger.
 * @param {object}    serializers - Custom serializers for the logger.
 * @returns {bunyan}              - A bunyan logger.
 */
function create (name, serializers) {
  return bunyan.createLogger({
    name: 'egret',
    src: true,
    streams: [
      {
        level: process.env.LOG_LEVEL_STDOUT,
        stream: process.stdout
      }
    ],
    serializers: Object.assign(serializers, {
      env: envSerializer,
      err: errorSerializer,
      req: reqSerializer
    }),
    environment: process.env.NODE_ENV
  })
}

/**
 * The node process environment often contains a lot of useless information
 * this reduces the verbosity of a reported environment.
 * @param {object}   env - The environment to report.
 * @return {object}      - A stripped down version with only relevant environment
 *   variables.
 */
function envSerializer (env) {
  var obj = {}

  // Filter out the kinda useless and verbose `npm_*` variables
  Object.keys(env).forEach(function (key) {
    if (key.match(/^npm_/)) { return }
    obj[key] = env[key]
  })
  return obj
}

function errorSerializer (err) {
  var obj = bunyan.stdSerializers.err(err)
  if (err.data) {
    obj.data = err.data
  }
  return obj
}

function reqSerializer (req) {
  return Object.assign({}, {
    params: req.params,
    body: req.body,
    query: req.query,
    path: req.path,
    method: req.method,
    url: req.url,
    headers: req.headers
  })
}

/**
 * Bunyan logger for lib.
 * @module lib:logger
 */
module.exports = create('egret', {})
