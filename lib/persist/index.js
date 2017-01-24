// Plaza Persist Module
//
// NOTE This is currently only configured for MongoDb
//
// This module sets up some useful primitives for interacting with a Mongo
// Database. It wraps native mongodb methods in their own handler objects,
// which allow them to be composed with other handlers.
// The task stored in the handler is the query itself, so mapping over the
// returned Handler allows for updating the results directly. At this point,
// the results from the query still need to be merged back in to the Environment
// by the caller.

const { ObjectId } = require('mongodb');
const { Task } = require('@dustinws/fantasy');
const { curry, compose, merge } = require('ramda');
const { Handler } = require('../core');

// All Primitives that perform updates carry this signature
//:: CollectionName(String) -> Query(Object) -> Update(Object) -> Handler

// While Primitives that don't require an update (insert, find, remove)
// Just accept a query object.
//:: CollectionName(String) -> Query(Object) -> Handler


//:: String -> Object -> Handler(Task(Error, Env))
exports.find = curry((col, query) =>
  Handler((env) =>
    Task((reject, resolve) =>
      env.db
        .collection(col)
        .find(query)
        .toArray()
        .then(resolve)
        .catch(reject))));

//:: String -> Object -> Handler(Task(Error, Env))
exports.findOne = curry((col, query) =>
  Handler((env) =>
    Task((reject, resolve) =>
      env.db
        .collection(col)
        .findOne(query)
        .then(resolve)
        .catch(reject))));

//:: String -> String -> Handler(Task(Error, Env))
exports.findOneById = curry((col, id) =>
  exports.findOne(col, { _id: ObjectId(id) }));

//:: String -> Object -> Handler(Task(Error, Env))
exports.insert = curry((col, doc) =>
  Handler((env) =>
    Task((reject, resolve) =>
      env.db
        .collection(col)
        .insert(doc)
        .then(resolve)
        .catch(reject))));

//:: String -> Object -> Object -> Handler(Task(Error, Env))
exports.update = curry((col, filter, update) =>
  Handler((env) =>
    Task((reject, resolve) =>
      env.db
        .collection(col)
        .updateOne(filter, update)
        .then(resolve)
        .catch(reject))));

//:: String -> Object -> Handler(Task(Error, Env))
exports.remove = curry((col, filter) =>
  Handler((env) =>
    Task((reject, resolve) =>
      env.db
        .collection(col)
        .deleteOne(filter)
        .then(resolve)
        .catch(reject))));

//:: String -> String -> Handler(Task(Error, Env))
exports.removeById = curry((col, id) =>
  exports.remove(col, { _id: ObjectId(id) }));

//:: String -> String -> Object -> Handler(Task(Error, Env))
exports.updateById = curry((col, id, update) => {
  console.log('_id', id);
  return exports.update(col, { _id: ObjectId(id) }, update);
});

// A helper that returns all of the primitives with the collection name
// partially applied.
//
// This allows for
//   Db.find({})
// Instead of
//   Db.find('users', {})
//
// This usually isn't interacted with directly, but is instead used by other
// functions to create new Handlers
//
//:: String -> Object
exports.Db = (collection) => {
  return {
    find: exports.find(collection),
    findOne: exports.findOne(collection),
    findOneById: exports.findOneById(collection),
    update: exports.update(collection),
    insert: exports.insert(collection),
    remove: exports.remove(collection),
    removeById: exports.removeById(collection),
    updateById: exports.updateById(collection),
  };
};

// A convenience Handler that can be dropped in to any Handler composition.
// Given a collection name and a property, attach that collection to the
// nested Environment under the property provided.
//
//:: String -> String -> Reader(Task(Error, Env))
exports.MongoCollection = (collection, name) =>
  Handler(compose(Task.of, merge({ [name || collection]: exports.Db(collection) })));
