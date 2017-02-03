'use strict'

const log = require('util/logger').child({ module: 'runnable-web-panel/routes' })
const keypather = require('keypather')()

const statusHash = {
  'exited': 'red',
  'running': 'green'
}

module.exports = class InstanceService {
  static get log () {
    return logger.child({
      module: 'InstanceService'
    })
  }

  static getContainerUrl (instance) {
    // log.trace({instance}, 'this is the instance')
    let preferredPort
    let temporaryPort
    let ports = keypather.get(instance, 'container.inspect.NetworkSettings.Ports')
    if (!ports) {
      return 'http://' + instance.shortHash + '-' + instance.elasticHostname
    }
    ports = Object.keys(ports).map((port) => {
      temporaryPort = port.split('/')[0]
      if (temporaryPort === '443') {
        preferredPort = temporaryPort
      } else if (!preferredPort && temporaryPort === '80') {
        preferredPort = temporaryPort
      }
      return port.split('/')[0]
    })
    preferredPort = preferredPort || ports[0]
    let hostname = instance.shortHash + '-' + instance.elasticHostname
    if (preferredPort === '443') {
      return 'https://' + hostname
    }
    return 'http://' + hostname + ':' + preferredPort
  }

  static getContainerStatus (container, isTesting) {
    let status = keypather.get(container, 'inspect.State.Status')
    let statusColor = statusHash[status]
    let exitCode = keypather.get(container, 'inspect.State.ExitCode')
    let testStatusFailed
    if (isTesting) {
      testStatusFailed = exitCode > 0
    }
    return {
      status,
      statusColor,
      exitCode,
      isTesting,
      testStatusFailed
    }
  }
}
