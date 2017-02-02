'use strict'

const runnableAPI = require('util/runnable-api-client')
const Promise = require('bluebird')
const log = require('util/logger').child({ module: 'runnable-web-panel/routes' })
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
      let issueNumber = req.headers.referer.substr(req.headers.referer.lastIndexOf('/') + 1)
      let issueNumberRegex = new RegExp(issueNumber, 'i')
      return runnableAPI.getAllInstancesWithIssue(issueNumber)
        .then(function (instances) {
          if (instances.length) {
            let filteredInstance = instances[0]
            let username = filteredInstance.owner.username
            let containerStatus = keypather.get(filteredInstance, 'container.inspect.State.Status')
            return res.render('web-panel', {
              instance: true,
              url: 'app.runnable.io/' + username + '\\' + filteredInstance.name,
              status: containerStatus
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
