const { connect } = require('mongodb').MongoClient;
const { Task } = require('@dustinws/fantasy');
const { Handler } = require('../core');

// This loader simply connects to a mongo server and returns the connection
// under the 'db' property.
//:: Reader(Task(Error, Env))
module.exports = Handler((env) =>
  Task.liftNode(connect)(env.config.database.mongo.url)).map(db => ({ db }));
