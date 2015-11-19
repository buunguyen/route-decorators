## route-decorators for Koa/Express

[ES7 decorators](https://github.com/wycats/javascript-decorators) that simplify Koa and Express route creation. Specifically, you can write your controllers like below and have all the routes populated.

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


### Usage
Once the decorators are applied, every instance of the controller will receive a `$routes` property, which is the array of routes. Although you can do anything with this property, you'll mostly likely use it to define actual Koa/Express routes.

Assume the above `UserCtrl` definition, you can define routes in `UserCtrl`'s constructor (although really you can put the code anywhere), as follows:

__Koa__
```js
@controller(...)
class UserCtrl {
  constructor() {
    this.router = new Router()
    for (const {method, url, middleware, fnName} of this.$routes) {
      this.router[method](url, ...middleware, this[fnName].bind(this))
    }
  }

  // decorated methods as above
}
```

__Express__
```js
import express from 'express'

@controller(...)
class UserCtrl {
  constructor() {
    this.router = express.Router()
    for (const {method, url, middleware, fnName} of this.$routes) {
      this.router[method](url, ...middleware, (req, res, next) => {
        this[fnName](req, res, next).catch(next)
      })
    }
  }

  // decorated methods as above
}
```

Of course, you can move that logic in some base controller in your app and reuse it for every controller. For example:

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
 * `@head`, `@options`, `@get`, `@post`, `@put`, `@patch`, `@del`, `@delete`, `@all`: convenient wrappers of `@route` that automatically supply the first argument (i.e. `method`).

 ### Test

```bash
npm install
npm test
```
