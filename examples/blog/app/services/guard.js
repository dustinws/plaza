const R = require('ramda');
const { Handler, badRequest, getBody, getQuery, getParams } = require('../../../../lib/core');

function baseGuard(getter) {
  return (schema) => Handler.liftSync((env) => {
    let valid = true;
    const inputs = getter(env);
    R.keys(inputs).forEach((input) => {
      if (!schema[input](inputs[input])) valid = false;
    });
    if (!valid) {
      return R.merge(env, {
        response: env.response.chain(badRequest('Invalid Params')),
      });
    }

    return env;
  });
}

module.exports = baseGuard(e => R.merge(getQuery(e), getBody(e)));
module.exports.Params = baseGuard(e => getParams(e));
