const { Either, Identity } = require('@dustinws/fantasy');

// This function runs a computation on each request, and serializes it's
// return value into a ServerResponse that can be sent back to the client.
//:: (Handler, Environment) -> (ClientRequest, ServerResponse) -> Void
module.exports = (main, env = {}) => (req, res) => {
  // New responses are initialized as 'Open'
  // This means that operations applied to the response will be applied
  // In contrast, a 'Closed' response ignores any updates given to it.
  const response = Either.Right({ headers: {} });
  const request = Identity(req);

  // Merge the request / response into the Environment
  const ctx = Object.assign({ response, request }, env);

  // Run the handler and the nested task. This is where errors should
  // be handled but right now we're lazy.
  return main.run(ctx).fork(console.log, (output) => {
    const { headers, stream, body, statusCode } = output.response.value;

    // Set any applicable headers
    Object.keys(headers).forEach(x => res.setHeader(x, headers[x]));

    // Set the status code, or default to 200.
    res.statusCode = statusCode || 200;

    // Default to a 'text/html' content type.
    if (!headers['Content-type'])
      res.setHeader('Content-type', 'text/html');

    // If the response contains a stream, pipe it to the client
    if (stream) {
      stream.pipe(res);
    }
    // Otherwise, try to send the body
    else {
      // If this fails, it means the body is not a buffer / string
      try { res.end(body); }
      // Currently the only other format we support is JSON
      catch (e) { res.end(JSON.stringify(body)); }
    }

    // Return the Environment
    return env;
  });
};
