'use strict'

const log = require('util/logger')
const keypather = require('keypather')()

const statusHash = {
  'exited': 'red',
  'building': 'orange',
  'running': 'green',
  'passed': 'green',
  'failed': 'red'
}

module.exports = class InstanceService {
  static get log () {
    return log.child({
      module: 'InstanceService'
    })
  }

  static getContainerUrl (instance) {
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
      return temporaryPort
    })
    preferredPort = preferredPort || ports[0]
    let hostname = instance.shortHash + '-' + instance.elasticHostname
    if (preferredPort === '443') {
      return 'https://' + hostname
    }
    return 'http://' + hostname + ':' + preferredPort
  }

  static getContainerStatus (instance, isTestingOnly) {
    let container = instance.container
    let failed
    if (isTestingOnly) {
      let exitCode = keypather.get(container, 'inspect.State.ExitCode')
      failed = exitCode > 0
      let testResults = failed ? 'failed' : 'passed'
      return {
        testResults,
        testColor: statusHash[testResults]
      }
    }
    let status = keypather.get(container, 'inspect.State.Status')
    if (!status) {
      failed = keypather.get(instance, 'contextVersion.build.failed')
      status = failed ? 'failed' : 'building'
    }
    let statusColor = statusHash[status]
    let state = status === 'building' ? 'Deploying' : 'Deployed'
    return {
      state,
      status,
      statusColor
    }
  }

  static instanceIsTestInstance (instances) {
    return instances.length === 1 && instances[0].isTesting === true
  }

  static getTestPanelOptions (instance) {
    let testResults = InstanceService.getContainerStatus(instance, true)
    return {
      isTestingOnly: true,
      instance: true,
      instanceName: instance.name,
      repoName: keypather.get(instance, 'contextVersion.appCodeVersions[0].repo').split('/')[1],
      url: process.env.RUNNABLE_URL + instance.owner.username + '\\' + instance.name,
      testColor: testResults.testColor,
      testResults: testResults.testResults
    }
  }

  static getNonTestPanelOptions (instance) {
    let environmentUrl = InstanceService.getContainerUrl(instance)
    let username = instance.owner.username
    let repoName = keypather.get(instance, 'contextVersion.appCodeVersions[0].repo').split('/')[1]
    let containerStatus = InstanceService.getContainerStatus(instance)
    let instanceName = instance.name
    return {
      instance: true,
      instanceName,
      url: process.env.RUNNABLE_URL + username + '\\' + instanceName,
      status: containerStatus.status,
      statusColor: containerStatus.statusColor,
      repoName,
      state: containerStatus.state,
      environmentUrl
    }
  }
}
