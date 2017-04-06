'use strict'

const rollbar = require('rollbar')
const log = require('util/logger').child({ module: 'runnable-web-panel/util/ErrorHandler' })

module.exports = class ErrorHandler {

  /**
   * Report Error
   *
   */
  static reportErrorToRollbar (err, req) {
    return rollbar.handleErrorWithPayloadData(err, { level: 'error' }, req)
  }

}
