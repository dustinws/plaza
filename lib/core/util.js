exports.extend = (child, parent) => {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
  Object.assign(child, parent);
  return child;
};
