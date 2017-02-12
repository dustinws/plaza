const { join } = require('path');
const { pipeHandlers } = require('../../lib/core');
const { Router } = require('../../lib/core');
const { staticServer, requestLogger, bodyParser } = require('../../lib/middleware');

const routes = require('./config/routes');

module.exports = pipeHandlers(
  // Middleware
  staticServer(join(__dirname, 'public')),
  bodyParser,

  // Application Routes
  Router(routes),

  // Run the logger last
  requestLogger
);
