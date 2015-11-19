'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.route = route;
exports.controller = controller;
var PREFIX = '$$route_';

// @route(method, path: optional, ...middleware: optional)

function route(method) {
  if (typeof method !== 'string') {
    throw new Error('The first argument must be an HTTP method');
  }

  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var hasPath = typeof args[0] === 'string';
  var path = hasPath ? args[0] : '';
  var middleware = hasPath ? args.slice(1) : args;

  if (middleware.some(function (m) {
    return typeof m !== 'function';
  })) {
    throw new Error('Middleware must be function');
  }

  return function (target, name, descriptor) {
    target['' + PREFIX + name] = { method: method, path: path, middleware: middleware };
  };
}

// @method === @route(method, ...args)
var methods = ['head', 'options', 'get', 'post', 'put', 'patch', 'del', 'delete', 'all'];
methods.forEach(function (method) {
  return exports[method] = route.bind(null, method);
});

// @controller(path: optional, ...middleware: optional)

function controller() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var hasPath = typeof args[0] === 'string';
  var ctrlPath = hasPath ? args[0] : '';
  var ctrlMiddleware = hasPath ? args.slice(1) : args;

  if (ctrlMiddleware.some(function (m) {
    return typeof m !== 'function';
  })) {
    throw new Error('Middleware must be function');
  }

  return function (target) {
    var proto = target.prototype;
    proto.$routes = Object.getOwnPropertyNames(proto).filter(function (prop) {
      return prop.indexOf(PREFIX) === 0;
    }).map(function (prop) {
      var _proto$prop = proto[prop];
      var method = _proto$prop.method;
      var path = _proto$prop.path;
      var actionMiddleware = _proto$prop.middleware;

      var url = '' + ctrlPath + path;
      var middleware = ctrlMiddleware.concat(actionMiddleware);
      var fnName = prop.substring(PREFIX.length);
      return { method: method, url: url, middleware: middleware, fnName: fnName };
    });
  };
}