const _ = require('ramda');
const { Handler } = require('../core');
const { Task } = require('@dustinws/fantasy');
const { parallel } = Task;

// A helper function that builds an environment from a list of Handlers.
// Each handler is expected to return an object with properties to be
// merged in to the environment. When all of the loaders have resolved,
// all of their return objects are merged into the environment.
// This is how database connections, cache connections, etc.. can be
// added to the environment prior to running any application code.
//
//:: [Handler] -> Handler
module.exports = (...x) => Handler((env) =>
  parallel(x.reverse().map(y => y.run(env))).map(_.reduce(_.merge, env)));
