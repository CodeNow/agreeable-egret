'use strict'

const Promise = require('bluebird')
const RunnableClient = require('@runnable/api-client')
// const log = require('util/logger').child({ module: 'runnable-api-client' })

const client = new RunnableClient(process.env.RUNNABLE_API_URL, { userContentDomain: process.env.RUNNABLE_USER_CONTENT_DOMAIN })

module.exports = class RunnableAPIClient {

  /**
   * Login into Runnable API Client
   *
   * @resolves {void}
   * @returns {Promise}
   */
  static login () {
    return Promise.fromCallback(cb => {
      client.githubLogin(process.env.HELLO_RUNNABLE_GITHUB_TOKEN, cb)
    })
  }

  /**
   * Logout from Runnable API Client
   *
   * @resolves {void}
   * @returns {Promise}
   */
  static logout () {
    return Promise.fromCallback(cb => {
      client.logout(cb)
    })
  }

  /**
   * Get all instances for a user
   *
   * @param {Number} githubId - Github ID for organization
   * @resolves {Array<Object>} instances - All instances owned by user
   * @returns {Promise}
   */
  static getAllInstancesWithIssue (issueId, orgId) {
    return Promise.fromCallback(cb => {
      if (orgId) {
        client.fetchAllInstances({issueId, orgId}, cb)
      } else {
        client.fetchAllInstances({issueId}, cb)
      }
    })
  }

}
