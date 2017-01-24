const qs = require('querystring');
const { Task } = require('@dustinws/fantasy');
const { Handler } = require('../core/handler');

// The bodyParser Handler attempts to read the incoming request stream,
// and converts the body in to a usable javascript object. This handler
// accounts for the body being UrlEncoded.
//
//:: Reader(Task(Error, Env))
module.exports = Handler((env) => {
  return Task((reject, resolve) => {
    // Collect buffers from the incoming request
    const chunks = [];
    env.request.value.on('data', chunk => chunks.push(chunk));

    // When the stream is finished, attempt to parse the raw request
    // body.
    // NOTE Currently, if the body cannot be parsed as a JSON value or a
    // querystring, the Handler will resolve, but the body will not be
    // set properly.
    env.request.value.on('end', () => {
      const rawBody = Buffer.concat(chunks).toString();
      try {
        env.request.value.body = JSON.parse(rawBody);
      } catch (e) {
        env.request.value.body = qs.parse(rawBody);
      }
      resolve(env);
    });
  });
});
