const R = require('ramda');
const { Handler } = require('../../../../lib/core');

module.exports = (name, fn) =>
  Handler.ask().chain(e =>
    fn(e).map(res => R.merge({ [name]: res }, e)));
