# Plaza

#### A library for creating http responses.

Plaza JS is a library that allows you build complex web apps by composing smaller, simpler apps, known as `Handlers`.
In Plaza, the `Handler` type is a special type that represents an asynchronous action that requires some sort of environment / state. Handlers can be composed, sequenced, and mixed / matched to build complex apps in a simple, maintainable way.

### Core Constructs

#### `Serializer`

Application code does not interact with the server directly. Responses returned from Handlers are interpreted by a `Serializer.`

`Serializer`'s are responsible for accepting the request, passing it to the application, and transforming the result into an actual http response.

*This allows for fast tests (no need to lift a server).*

#### `Open / Closed Responses`
In Plaza, a response can be 'open' or 'closed'. When a response is closed, every subsequent action in the composition is essentially skipped. Policies, like auth middleware, work in this way. Instead of 'sending' the requests directly, they 'close' them and pass them back to the application. Every subsequent handler will detect this and exit immediately.


#### `Handlers`
Handlers exist so that application code can be defined in small separate units, and then be re-composed as needed to handle complexity. Handlers are easily composed with other handlers, very much like components on the front end.


## API

### `Handler`

#### Construction
```Javascript
// An asynchronous action
const myHandler = Handler((environment) => {
  const { email, password } = getBody(environment.request);

  return environment.db.users
    .findOne({ email, password })
    .map(Maybe.fromNullable)
    .chain(Maybe.cata({
      // User Exists
      Just: user =>
        updateResponse(chain(ok({ user }))),

      // Invalid Credentials!
      Nothing: () =>
        updateResponse(chain(badRequest('Not Authorized.'))),
    }));
});
```
