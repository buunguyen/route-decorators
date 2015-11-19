## route-decorators for Koa/Express

[![NPM](https://nodei.co/npm/route-decorators.png?compact=true)](https://www.npmjs.com/package/route-decorators)

[![Build Status](https://travis-ci.org/buunguyen/route-decorators.svg?branch=master)](https://travis-ci.org/buunguyen/route-decorators)

[ES7 decorators](https://github.com/wycats/javascript-decorators) that simplify Koa and Express route creation. Using these decorators, you can write your controllers like below and have all the routes populated.

__Koa__
```js
import {controller, get, post} from 'route-decorators'

@controller('/users', middleware1)
class UserCtrl {

  @get('/:id', middleware2, middleware3)
  async get(context, next) {}

  @post(middleware2)
  async post(context, next) {}
}
```

__Express__
```js
import {controller, get, post} from 'route-decorators'

@controller('/users', middleware1)
class UserCtrl {

  @get('/:id', middleware2, middleware3)
  async get(req, res, next) {}

  @post(middleware2)
  async post(req, res, next) {}
}
```

Once the decorators are applied, every controller instance will receive a `$routes` array, which you can use to define actual Koa/Express routes.

Assume the above `UserCtrl` definition, you can define routes in `UserCtrl`'s constructor (although really you can put the code anywhere) as follows:

__Koa__
```js
import Router from 'koa-66'

// Inside controller constructor
this.router = new Router()
for (const {method, url, middleware, fnName} of this.$routes) {
  this.router[method](url, ...middleware, this[fnName].bind(this))
}
```

__Express__
```js
import express from 'express'

// Inside controller constructor
this.router = express.Router()
for (const {method, url, middleware, fnName} of this.$routes) {
  this.router[method](url, ...middleware, (req, res, next) => {
    this[fnName](req, res, next).catch(next)
  })
}
```

You can move the above logic to some base controller in your app and reuse it for every controller. For example:

```js
class BaseCtrl {
  constructor() {
    this.router = new Router()
    for (const {method, url, middleware, fnName} of this.$routes) {
      this.router[method](url, ...middleware, this[fnName].bind(this))
    }
  }
}

@controller(...)
class UserCtrl extends BaseCtrl {
  // decorated methods as above
}
```

### Decorators
 * `@controller(path: optional, ...middleware: optional)`
 * `@route(method, path: optional, ...middleware: optional)`
 * `@head`, `@options`, `@get`, `@post`, `@put`, `@patch`, `@del`, `@delete`, `@all`: wrappers of `@route` that automatically supply the `method` argument.

### Test

```bash
npm install
npm test
```
