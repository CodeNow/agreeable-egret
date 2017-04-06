'use strict'

const rollbar = require('rollbar')
const log = require('util/logger').child({ module: 'runnable-web-panel/util/ErrorHandler' })

module.exports = class ErrorHandler {

  /**
   * Report Error
   *
   */
  static reportErrorToRollbar (err, req) {
    console.log('\n\n\n', err.message, err, '\n\n\n')
    if (err.message === 'org not found') {
      return rollbar.handleErrorWithPayloadData(err, { level: 'info' }, req)
    }
      return rollbar.handleErrorWithPayloadData(err, { level: 'error' }, req)
  }

}
