'use strict'

const runnableAPI = require('util/runnable-api-client')
const Promise = require('bluebird')
const log = require('util/logger').child({ module: 'runnable-web-panel/routes' })
const InstanceService = require('util/InstanceService')
const keypather = require('keypather')()
module.exports = function (app, addon) {

    runnableAPI.login()

    // Root route. This route will serve the `atlassian-connect.json` unless the
    // documentation url inside `atlassian-connect.json` is set
    app.get('/', function (req, res) {
      res.format({
        // If the request content-type is text-html, it will decide which to serve up
        'text/html': function () {
            res.redirect('/atlassian-connect.json');
        },
        // This logic is here to make sure that the `atlassian-connect.json` is always
        // served up when requested by the host
        'application/json': function () {
            res.redirect('/atlassian-connect.json');
        }
      });
    });

    app.get('/runnable-web-panel', addon.authenticate(), function (req, res) {
      // let issueNumber = req.headers.referer.substr(req.headers.referer.lastIndexOf('/') + 1)
      let issueNumber = 'node-starter-web'
      let issueNumberRegex = new RegExp(issueNumber, 'i')
      return runnableAPI.getAllInstancesWithIssue(issueNumber)
        .then(function (instances) {
          if (instances.length) {
            let filteredInstances = instances.filter((instance) => {
              return keypather.get(instance, 'contextVersion.appCodeVersions[0].repo')
            })
            let filteredInstance = filteredInstances[0]
            let environmentUrl = InstanceService.getContainerUrl(filteredInstance)
            let username = filteredInstance.owner.username
            let repoName = keypather.get(filteredInstance, 'contextVersion.appCodeVersions[0].repo').split('/')[1]
            let containerStatus = InstanceService.getContainerStatus(filteredInstance.container, filteredInstance.isTesting)
            let instanceName = filteredInstance.name
            log.trace({containerStatus}, 'container status')
            return res.render('web-panel', {
              instance: true,
              instanceName,
              url: 'app.runnable.io/' + username + '\\' + instanceName,
              status: containerStatus.status,
              statusColor: containerStatus.statusColor,
              repoName,
              environmentUrl
            });
          }
          return res.render('web-panel', {
            instance: false,
            text: 'We couldn‘t find an environment for this issue.'
          });
        })
        .catch((err) => {
          log.trace(err)
        })
      }
    );

    // Add any additional route handlers you need for views or REST resources here...
    // load any additional files you have in routes and apply those to the app
    {
        var fs = require('fs');
        var path = require('path');
        var files = fs.readdirSync("routes");
        for(var index in files) {
            var file = files[index];
            if (file === "index.js") continue;
            // skip non-javascript files
            if (path.extname(file) != ".js") continue;

            var routes = require("./" + path.basename(file));

            if (typeof routes === "function") {
                routes(app, addon);
            }
        }
    }
};
