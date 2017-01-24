const qs = require('querystring');
const { Task } = require('@dustinws/fantasy');
const { Handler } = require('../core/handler');

// A simple handler that parses the cookie values associated with a given
// request. These are parsed into a usable javascript object and attached
// to the request.
//:: Reader(Task(Error, Env))
module.exports = Handler((env) => {
  env.request.value.cookies = qs.parse(env.request.value.headers.cookie);
  return Task.of(env);
});
