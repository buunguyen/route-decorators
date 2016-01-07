const PREFIX = '$$route_'

function destruct(args) {
  const hasPath = typeof args[0] === 'string'
  const path = hasPath ? args[0] : ''
  const middleware = hasPath ? args.slice(1) : args

  if (middleware.some(m => typeof m !== 'function')) {
    throw new Error('Middleware must be function')
  }

  return [path, middleware]
}

// @route(method, path: optional, ...middleware: optional)
export function route(method, ...args) {
  if (typeof method !== 'string') {
    throw new Error('The first argument must be an HTTP method')
  }

  const [path, middleware] = destruct(args)

  return function (target, name, descriptor) {
    target[`${PREFIX}${name}`] = {method, path, middleware}
  }
}

// @[method](...args) === @route(method, ...args)
const methods = ['head', 'options', 'get', 'post', 'put', 'patch', 'del', 'delete', 'all']
methods.forEach(method => exports[method] = route.bind(null, method))

// @controller(path: optional, ...middleware: optional)
export function controller(...args) {
  const [ctrlPath, ctrlMiddleware] = destruct(args)

  return function (target) {
    const proto = target.prototype
    proto.$routes = Object.getOwnPropertyNames(proto)
      .filter(prop => prop.indexOf(PREFIX) === 0)
      .map(prop => {
        const {method, path, middleware: actionMiddleware} = proto[prop]
        const url = `${ctrlPath}${path}`
        const middleware = ctrlMiddleware.concat(actionMiddleware)
        const fnName = prop.substring(PREFIX.length)
        return {method: method === 'del' ? 'delete' : method, url, middleware, fnName}
      })
  }
}
