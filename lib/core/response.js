const R = require('ramda');
const { Either } = require('@dustinws/fantasy');

const { Left, Right } = Either;

// Lenses
const RequestL = R.lensProp('request');
const ResponseL = R.lensProp('response');
const BodyL = R.lensProp('body');
const HeadersL = R.lensProp('headers');
const StatusL = R.lensProp('statusCode');
const StreamL = R.lensProp('stream');
const headerLens = x => R.lensPath(['headers', x]);


// Content Types
// -------------

const HTML = 'text/html';
const TEXT = 'text/plain';
const JSON = 'application/json';


// Statuses
// --------

const OK = 200;
const REDIRECT = 301;
const BADREQUEST = 400;
const NOTAUTHORIZED = 401;
const NOTFOUND = 404;
const SERVERERROR = 500;


// Transformers
// ------------

//:: RouteDescription -> RouteDescription
const setStatus = R.set(StatusL);
//:: RouteDescription -> RouteDescription
const setHeader = R.curryN(3, (a, b, c) => R.set(headerLens(a), b, c));
//:: RouteDescription -> RouteDescription
const setContentType = setHeader('Content-type');
//:: RouteDescription -> ClosedResponse
const send = R.curry((a, b) => R.compose(Left, R.set(BodyL, a))(b));
//:: RouteDescription -> ClosedResponse
const stream = R.curry((a, b) => R.compose(Left, R.set(StreamL, a))(b));
//:: (OpenResponse -> ClosedResponse) -> Env -> ClosedResponse
const modifyResponse = R.over(ResponseL);


// Response Macros
// ---------------

//:: ResponseDescription -> ClosedResponse
const ok = x =>
  R.compose(send(x), setStatus(OK), setContentType(JSON));
//:: ResponseDescription -> ResponseDescription
const badRequest = x =>
  R.compose(send(x), setStatus(BADREQUEST), setContentType(JSON));
//:: ResponseDescription -> ResponseDescription
const notAuthorized = x =>
  R.compose(send(x), setStatus(NOTAUTHORIZED), setContentType(JSON));
//:: ResponseDescription -> ResponseDescription
const serverError = x =>
  R.compose(send(x), setStatus(SERVERERROR), setContentType(JSON));


// Getters
const getBody = R.chain(R.view(BodyL));


// Exports
module.exports = {
  // Transformers
  send,
  stream,
  setStatus,
  setHeader,
  setContentType,
  modifyResponse,

  // Content Types
  HTML,
  TEXT,
  JSON,

  // Statuses
  OK,
  REDIRECT,
  BADREQUEST,
  NOTAUTHORIZED,
  NOTFOUND,
  SERVERERROR,

  // Response Macros
  ok,
  badRequest,
  notAuthorized,
  serverError,

  // Lenses
  RequestL,
  ResponseL,
  BodyL,
  HeadersL,
  StatusL,
  StreamL,

  // Getters
  getBody,
};
