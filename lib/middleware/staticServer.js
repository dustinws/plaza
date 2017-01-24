const R = require('ramda');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const { Task } = require('@dustinws/fantasy');
const { getUrl } = require('../core/router');
const { Handler } = require('../core/handler');
const { setStatus, setContentType, stream } = require('../core');

// This handler serves static files from some location on disk.
// Currently, there's no concept of caching.
//
//:: String -> Reader(Task(Error, Env))
module.exports = (staticDir) => Handler((env) => {
  let absPath = path.join(staticDir, getUrl(env.request.value));

  // Account for base urls with an implicit index.html file.
  if (getUrl(env.request.value).endsWith('/'))
    absPath = path.join(absPath, 'index.html');

  // If there's no file on disk, just bail out.
  if (!fs.existsSync(absPath))
    return Task.of(env);

  // Otherwise, let's end the response with the file.
  env.response = env.response
    .map(setStatus(200))
    .map(setContentType(mime.lookup(absPath)))
    .chain(stream(fs.createReadStream(absPath)));

  // Return a Task of the new Environment
  return Task.of(env);
});
