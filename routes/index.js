'use strict'

const runnableAPI = require('util/runnable-api-client')
const Promise = require('bluebird')
const Organization = require('models/organization')
const log = require('util/logger').child({ module: 'runnable-web-panel/routes' })
const InstanceService = require('util/InstanceService')
const keypather = require('keypather')()
module.exports = function (app, addon) {

    runnableAPI.login()

    // Root route. This route will serve the `atlassian-connect.json` unless the
    // documentation url inside `atlassian-connect.json` is set
    app.get('/', (req, res) => {
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

    app.get('/runnable-web-panel', addon.authenticate(), (req, res) => {
      let issueNumber = req.headers.referer.substr(req.headers.referer.lastIndexOf('/') + 1)
      let orgName = req.headers.referer.match(/\/\/(.+)\.atlassian/)[1]
      let issueNumberRegex = new RegExp(issueNumber, 'i')
      return Organization
        .where('atlassian_org', orgName)
        .fetch()
        .then((org) => {
          return org.attributes.github_org
        })
        .then((orgName) => {
          return runnableAPI.getAllInstancesWithIssue(issueNumber, orgName)
            .then(function (instances) {
              if (instances.length) {
                let filteredInstances = instances.filter((instance) => {
                  return keypather.get(instance, 'contextVersion.appCodeVersions[0].repo')
                })
                if (InstanceService.instanceIsTestInstance(filteredInstances)) {
                  let testInstance = filteredInstances[0]
                  let testPanelOptions = InstanceService.getTestPanelOptions(testInstance)
                  return res.render('web-panel', testPanelOptions)
                }
                // we either have more than one instance for this issue number, or it is not a test instance
                let nonTestInstance = filteredInstances.find((instance) => {
                  return !instance.isTesting
                })
                let nonTestPanelOptions = InstanceService.getNonTestPanelOptions(nonTestInstance)
                return res.render('web-panel', nonTestPanelOptions)
              }
              // no instances found
              return res.render('web-panel', {
                instance: false,
                text: 'We couldn‘t find an environment for this issue.'
              })
            })
        })
        .catch((err) => {
          log.trace(err)
          return res.render('web-panel', {
            instance: false,
            text: 'We couldn‘t find an environment for this issue.'
          })
        })
      }
    )

    app.post('/organizations', (req, res) => {
      let atlassianOrg = req.body.atlassianOrg
      let githubOrg = req.body.githubOrg
      console.log(req.body)
      return new Organization()
        .save({
          atlassian_org: atlassianOrg,
          github_org: githubOrg
        })
        .then((organization) => {
          res.send(200)
        })
    })

    app.get('/organizations/:atlassianOrgName', (req, res) => {
      let atlassianOrg = req.params.atlassianOrgName;
      console.log(atlassianOrg)
      return Organization
        .where('atlassian_org', atlassianOrg)
        .fetch()
        .then((org) => {
          console.log(org)
          res.send(200)
        })
    })

    // Add any additional route handlers you need for views or REST resources here...
    // load any additional files you have in routes and apply those to the app
    {
        var fs = require('fs');
        var path = require('path');
        var files = fs.readdirSync('routes');
        for(var index in files) {
            var file = files[index];
            if (file === 'index.js') continue;
            // skip non-javascript files
            if (path.extname(file) != '.js') continue;

            var routes = require('./' + path.basename(file));

            if (typeof routes === 'function') {
                routes(app, addon);
            }
        }
    }
};
