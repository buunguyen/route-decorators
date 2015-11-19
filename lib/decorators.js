'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.route = route;
exports.controller = controller;
var PREFIX = '$$route_';

function destruct(args) {
  var hasPath = typeof args[0] === 'string';
  var path = hasPath ? args[0] : '';
  var middleware = hasPath ? args.slice(1) : args;

  if (middleware.some(function (m) {
    return typeof m !== 'function';
  })) {
    throw new Error('Middleware must be function');
  }

  return [path, middleware];
}

// @route(method, path: optional, ...middleware: optional)

function route(method) {
  if (typeof method !== 'string') {
    throw new Error('The first argument must be an HTTP method');
  }

  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var _destruct = destruct(args);

  var _destruct2 = _slicedToArray(_destruct, 2);

  var path = _destruct2[0];
  var middleware = _destruct2[1];

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

  var _destruct3 = destruct(args);

  var _destruct32 = _slicedToArray(_destruct3, 2);

  var ctrlPath = _destruct32[0];
  var ctrlMiddleware = _destruct32[1];

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