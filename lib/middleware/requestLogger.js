const qs = require('querystring');
const { Task } = require('@dustinws/fantasy');
const { Handler } = require('../core/handler');

// This handler just logs some information about the request to the console.
//:: Reader(Task(Error, Env))
module.exports = Handler((env) => {
  console.log(
    `(${env.request.value.method})`,
    env.response.value.statusCode,
    env.request.value.url
  );
  return Task.of(env);
});
