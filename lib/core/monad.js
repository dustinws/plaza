// A Monad macro that accepts a modifier function.
module.exports = (modifier = x => x) => {
  const proto = Object.create(null);

  function unit(value) {
    const monad = Object.create(proto);

    monad.value = value;
    monad.isMonad = true;

    monad.of = unit;

    monad.tap = f =>
      monad.map((x) => {
        f(x);
        return x;
      });

    monad.ap = m =>
      m.chain(monad.map);

    monad.map = f =>
      monad.chain(x => monad.of(f(x)));

    monad.chain = (f, ...args) =>
      f(monad.value, ...args);

    monad.extend = f =>
      f(monad);

    monad.extract = () =>
      monad.value;

    monad.toString = () =>
      `Monad(${value.toString()})`;

    return modifier(monad, monad.value);
  }

  unit.lift = (name, fn) => {
    proto[name] = function (...args) {
      const res = this.chain(fn, ...args);
      return (res && res.isMonad) ? res : unit(res);
    };
    return unit;
  };

  return unit;
};
