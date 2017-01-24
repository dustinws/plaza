const url = require('url');
const path = require('path');
const { curry, merge } = require('ramda');
const { Task } = require('@dustinws/fantasy');
const pathToRegExp = require('path-to-regexp');
const { Handler } = require('./handler');

// The main 'Router' data type.
// A Router accepts a list of routes up front, and then returns a
// Handler object that can be composed with any other handler(s).
// NOTE This is where checks happen for Closed responses, so it's
// best to break up your sites in to multiple routers. If the handler
// that closes the request is at index 1 out of 19, that means there
// are 18 other handlers that need to run before the router exits.
// While a Closed request ensures that the handlers won't actually be
// called, the composition will run to completion. Routers usually
// won't need more than 5-10 routes, after that they should be broken
// up and re-composed.
const Router = routes =>
  Handler((env) => {
    // Exit immediately if the response is already closed.
    if (env.response.isLeft())
      return Task.of(env);

    // Fetch the route that matches the given request.
    const route = routes.find(x => x.test(env.request.value));

    // If no route exists, exit.
    // Otherwise, extract the description.
    if (!route)
      return Task.of(env);

    // Parse query / route params and update the request.
    const query = getQuery(env.request);
    const params = parseRouteParams(route, env.request);
    env.request = env.request.map(merge({ query, params }));

    // Create a new environment witht the current route and run
    // the route handler.
    return route.run(merge(env, { route }));
  });

// Routes have one to one relationships with http uris for a given http verb.
// Routes carry some metadata about the request, but they are mostly used
// as a convenient interface for fetching the current route. They come wrapped
// in a monad type for advanced composition.
// RouteDescription :: { method :: String | [String], path :: String, handler :: Handler }
//:: Route RouteDescription => { test :: (ClientRequest -> Bool), run :: Handler }
const Route = (value) => {
  const route = {};
  // Create the path regex
  let { path, method, handler, params = [] } = value;
  const regEx = value.regEx || pathToRegExp(path, params);

  // Ensure 'method' is an array. A Route can have any number of associated
  // methods, or use the '*' character to express any method.
  if (!Array.isArray(method)) method = [method];

  // Given a http.ClientRequest, determine if this route should run.
  route.test = (req) => {
    return (
      method.includes(req.method) ||
      method.includes('*')
    ) && regEx.test(getUrl(req));
  };

  route.run = (...args) =>
    handler.run(...args);

  // Store metadata about the route / request
  route.value = { path, method, params, handler, regEx };

  return route;
};

// A domain acts as a macro for route groups. It allows for a single
// handler to act as an entry point (how SubSites are made), or can
// simply act as a route group contained in a router.
//:: String -> Route | [Route] -> Handler
const Domain = (a, b) =>
  Router(routeGroup(a, Array.isArray(b) ? b : [b]));

// A resource is a type of Router Macro that accepts a mapping object and
// a root uri segment. Functions in the map will be called according to
// the uri / http verb used in the request.
const Resource = curry((name, map) => {
  return Domain(name, [
    get('/', map.find),
    get('/:id', map.findOne),
    post('/', map.insert),
    del('/:id', map.remove),
    patch('/:id', map.update),
  ]);
});


// Helpers
// -------

// A getter for the request url
//:: ClientRequest -> String
const getUrl = req =>
  url.parse(req.url).pathname;

// A getter for the request's query parameter
//:: ClientRequest -> QueryParams
const getQuery = req =>
  url.parse(req.value.url, true).query;

// A helper for parsing a route's path parameters.
//:: Route -> Request -> PathParams
const parseRouteParams = curry((route, req) => {
  const ps = {};
  const res = route.value.regEx.exec(req.value.url.split('?')[0])
  route.value.params.forEach((x, i) => {
    if (res) ps[x.name] = (res && res.slice(1)[i]);
  });
  return ps;
});


// Transformers
// ------------

// A route group is a way to group routes around a common uri segment.
// For example, instead of writing:
//
//   Router([
//     Route({ path: '/foo/bar/bing', method: 'GET', handler: MyHandler }),
//     Route({ path: '/foo/bar/baz', method: 'GET', handler: MyHandler }),
//   ])
//
// You can instead do,
//
//   Router(routeGroup('/foo/bar', [
//     Route({ path: '/bing', method: 'GET', handler: MyHandler }),
//     Route({ path: '/baz', method: 'GET', handler: MyHandler }),
//   ]))
//
// It doesn't seem like much benefit at first, but the perks become obvious
// when you try to do composition.
// All this does is append the route's path to the base uri segment and
// recreate the regEx / route params.
//:: String -> [Route] -> [Route]
const routeGroup = curry((base, routes) =>
  routes.map(r => Route({
    method: r.value.method,
    handler: r.value.handler,
    path: path.join(base, r.value.path),
  })));


// Route Macros
// ---------------

const get = curry((path, handler) => Route({ path, handler, method: 'GET' }));
const put = curry((path, handler) => Route({ path, handler, method: 'PUT' }));
const post = curry((path, handler) => Route({ path, handler, method: 'POST' }));
const patch = curry((path, handler) => Route({ path, handler, method: 'PATCH' }));
const del = curry((path, handler) => Route({ path, handler, method: 'DELETE' }));
const all = curry((path, handler) => Route({ path, handler, method: '*' }));

module.exports = {
  // Transformers
  routeGroup,

  // Helpers
  getUrl,
  getQuery,
  parseRouteParams,

  // Route Macros
  all,
  get,
  del,
  put,
  post,
  patch,

  // Constructors
  Router,
  Route,
  Domain,
  Resource,
};
