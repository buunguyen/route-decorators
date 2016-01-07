import {assert} from 'chai'
import * as decorators from '../src/decorators'

function m1() {}
function m2() {}
function m3() {}
function m4() {}

describe('controller', () => {
  const {controller, route, all, get, post, del} = decorators

  it('should add $routes', () => {
    @controller()
    class Ctrl {}

    assert.deepEqual((new Ctrl()).$routes, [])
  })

  it('should throw if @controller is given non-function middleware', () => {
    assert.throws(() => {
      @controller(1)
      class Ctrl {}
    }, Error, 'Middleware must be function')
  })

  it('should throw if @route is given non-function middleware', () => {
    assert.throws(() => {
      @controller()
      class Ctrl {
        @route('get', 1) _get() {}
      }
    }, Error, 'Middleware must be function')
  })

  it('should define correct $routes', () => {
    @controller()
    class Ctrl {
      @all() _all() {}
    }

    assert.deepEqual((new Ctrl()).$routes, [
      {url: '', middleware: [], method: 'all', fnName: '_all'}
    ])
  })

  it('should define correct $routes when paths are specified', () => {
    @controller('/prefix')
    class Ctrl {
      @all('/all') _all() {}
    }

    assert.deepEqual((new Ctrl()).$routes, [
      {url: '/prefix/all', middleware: [], method: 'all', fnName: '_all'}
    ])
  })

  it('should normalize `del` to `delete`', () => {
    @controller()
    class Ctrl {
      @route('del', '/delete1') _delete1() {}
      @del('/delete2') _delete2() {}
    }

    assert.deepEqual((new Ctrl()).$routes, [
      {url: '/delete1', middleware: [], method: 'delete', fnName: '_delete1'},
      {url: '/delete2', middleware: [], method: 'delete', fnName: '_delete2'}
    ])
  })

  it('should define correct $routes when paths and middleware are specified', () => {
    @controller('/users', m1, m2)
    class Ctrl {
      @all() _all() {}
      @get('/get') _get() {}
      @post('/post', m3) _post() {}
      @route('delete', '/delete', m3, m4) _delete() {}
    }

    assert.deepEqual((new Ctrl()).$routes, [
      {url: '/users', middleware: [m1, m2], method: 'all', fnName: '_all'},
      {url: '/users/get', middleware: [m1, m2], method: 'get', fnName: '_get'},
      {url: '/users/post', middleware: [m1, m2, m3], method: 'post', fnName: '_post'},
      {url: '/users/delete', middleware: [m1, m2, m3, m4], method: 'delete', fnName: '_delete'}
    ])
  })
})
