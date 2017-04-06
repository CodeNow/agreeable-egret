'use strict'

require('loadenv')()
const log = require('util/logger').child({ module: 'app' })

// This is the entry point for your add-on, creating and configuring
// your add-on HTTP server

// [Express](http://expressjs.com/) is your friend -- it's the underlying
// web framework that `atlassian-connect-express` uses
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const rollbar = require('rollbar')
// You need to load `atlassian-connect-express` to use her godly powers
const ac = require('atlassian-connect-express');
// Static expiry middleware to help serve static resources efficiently
process.env.PWD = process.env.PWD || process.cwd(); // Fix expiry on Windows :(
const expiry = require('static-expiry');
// We use [Handlebars](http://handlebarsjs.com/) as our view engine
// via [express-hbs](https://npmjs.org/package/express-hbs)
const hbs = require('express-hbs');
// We also need a few stock Node modules
const http = require('http');
const path = require('path');
const os = require('os');

// Anything in ./public is served up as static content
const staticDir = path.join(__dirname, 'public');
// Anything in ./views are HBS templates
const viewsDir = __dirname + '/views';
// Your routes live here; this is the C in MVC
const routes = require('./routes');
// Bootstrap Express
const app = express();
// Bootstrap the `atlassian-connect-express` library
const addon = ac(app);
// You can set this in `config.json`
const port = addon.config.port();
// Declares the environment to use in `config.json`
const devEnv = app.get('env') == 'development';

// The following settings applies to all environments
app.set('port', port);

// Configure the Handlebars view engine
app.engine('hbs', hbs.express3({partialsDir: viewsDir}));
app.set('view engine', 'hbs');
app.set('views', viewsDir);

// Declare any Express [middleware](http://expressjs.com/api.html#middleware) you'd like to use here
// Log requests, using an appropriate formatter by env
app.use(morgan(devEnv ? 'dev' : 'combined'));
// Include request parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
// Gzip responses when appropriate
app.use(compression());

// You need to instantiate the `atlassian-connect-express` middleware in order to get its goodness for free
app.use(addon.middleware());
// Enable static resource fingerprinting for far future expires caching in production
app.use(expiry(app, {dir: staticDir, debug: devEnv}));
// Add an hbs helper to fingerprint static resource urls
hbs.registerHelper('furl', function(url){ return app.locals.furl(url); });
// Mount the static resource dir
app.use(express.static(staticDir));

// Show nicer errors when in dev mode
if (devEnv) app.use(errorHandler());
app.use(rollbar.errorHandler(process.env.ROLLBAR_KEY))
rollbar.handleUncaughtExceptionsAndRejections(process.env.ROLLBAR_KEY)

// Wire up your routes using the express and `atlassian-connect-express` objects
routes(app, addon);

// Boot the damn thing
http.createServer(app).listen(port, function(){
  console.log('Add-on server running at http://' + os.hostname() + ':' + port);
  // Enables auto registration/de-registration of add-ons into a host in dev mode
  if (devEnv) addon.register();
});
