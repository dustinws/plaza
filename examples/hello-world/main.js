const { chain } = require('ramda');
const { createServer } = require('http');
const { Http } = require('../../lib/serializers');
const { staticServer, bodyParser, cookieParser } = require('../../lib/middleware');
const { pipeHandlers, Handler, Router, Route, ok } = require('../../lib/core');

// Define the Handler
const HelloWorldH = Handler.ask().chain(() =>
  Handler.updateResponse(chain(ok('Hello World!'))));

// Declare the routes
const routes = [
  Route({
    path: '/*',
    method: '*',
    handler: HelloWorldH,
  }),
];

// Compose our application.
const main = pipeHandlers(
  // Middleware
  staticServer(__dirname),
  bodyParser,
  cookieParser,

  // App Routes
  Router(routes)
);

// Create the webapp
const app = Http(main, {});

// Create the web server
const server = createServer(app);

// Start the server
server.listen(3000, () => {
  console.log('Hello World running on port 3000.');
});
