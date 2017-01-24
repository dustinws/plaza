const R = require('ramda');
const { Reader, Task } = require('@dustinws/fantasy');
const { modifyResponse } = require('./response');

// Handler (Env -> T) => Reader(Future(Error, Env))
//
// of :: T => Handler T
// map :: (T -> Task U) -> Handler U
// chain :: (T -> Handler U) -> Handler U
const Handler = exports.Handler = Reader.T(Task);

// Accepts a function that accepts an environment and returns a new computed
// environment. The return environment is lifted into a new Handler.
//:: (Env -> Env) -> Reader(Task(Error, Env))
Handler.liftSync = f => Handler(R.compose(Task.of, f));

// This static function returns a new Handler that will update the nested
// response value inside of the environment.
//:: (Response -> Response) -> Reader(Task(Error, Env))
Handler.updateResponse = f => Handler(R.compose(Task.of, modifyResponse(f)));

// Given a set of handlers, create a right to left composition
// that returns a single handler.
//:: [Handler] -> Handler
exports.pipeHandlers = (...x) =>
  Handler(e => x.reduce((a, b) => a.chain(b.run), Task.of(e)));

// Given a set of handlers, create a left to right composition
// that returns a single handler.
//:: [Handler] -> Handler
exports.composeHandlers = (...x) =>
  exports.pipeHandlers(...x.reverse());
