'use strict'

const rollbar = require('rollbar')

module.exports = class ErrorHandler {

  /**
   * Report Error
   *
   */
  static reportErrorToRollbar (err, req) {
    if (err.message === 'org not found') {
      return rollbar.handleErrorWithPayloadData(err, { level: 'info' }, req)
    }
      return rollbar.handleErrorWithPayloadData(err, { level: 'error' }, req)
  }

}
