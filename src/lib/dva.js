// 基于dva-step5版本修改, 将express中间件机制换成了koa中间件机制, 支持在effect中: await dispatch({xxx}), 能够按照顺序执行, 但是增加了实现和使用的复杂度(中间件示例:asyncMiddleware)

import { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import browserHistory from './history';
import produce from 'immer';

let globalState = {};
let globalModels = {};
let globalUpdaters = [];
let globalComponent = null;
let globalConfig = {};
let globalUnlisten = {}

export function dva(config = {}) {
  globalConfig = config;
  globalState = config.initialState || {};

  let history = config.history || browserHistory

  let app = { 
    model(model) {
      model = model.default || model;

      let { namespace: ns, state, subscriptions } = model

      if (globalModels[ns]) {
        throw new Error(`${ns}已被注册`)
      }

      globalModels[ns] = model
      globalUnlisten[ns] = []

      if (!globalState[ns]) {
        globalState[ns] = state
      }

      if (subscriptions) {
        let temp = globalUnlisten[ns]

        for(let key in subscriptions) {
          temp.push(
            subscriptions[key]({ 
              history, 
              dispatch: middlewaresDispatch(ns) 
            })
          )
        }
      }
    },

    unmodel(ns) {
      // 注销model和state
      if (globalModels[ns]) {
        globalModels[ns] = null;
        globalState[ns] = null;
      }
      // 取消数据订阅
      if (globalUnlisten[ns]) {
        globalUnlisten[ns].forEach(v => {
          typeof v === 'function' && v()
        })
      }
    },

    router(getRouterComponent) {
      if (typeof getRouterComponent !== 'function') {
        throw new Error('app.router需要传入的是一个函数')
      }
      globalComponent = getRouterComponent({
        history, app
      })
    },

    start(selector) {
      ReactDOM.render(globalComponent, document.querySelector(selector));
    }
  }

  return app;
}
export default dva;

export function getState() {
  return globalState
}

// 在model中的dispatch, 如果没有namespace前缀, 自动加上当前model的namespace
function addNamespace(ns, action) {
    let { type = '' } = action;
    let temp = type.split('/')

    if(temp.length === 1) {
      temp = [ns, temp[0]]
    }

    return { ...action, type: temp.join('/') }
}

// 包裹了中间件的dispatch
export function middlewaresDispatch(ns) {
  return applyMiddlewaresDispatch(ns)
}

// 中间件机制
function applyMiddlewaresDispatch(ns) {
  let { useReduxMiddleware, onAction } = globalConfig
  let middlewares = [].concat(onAction || []);

  function apply(fn, action, next) {
    if (fn === dispatch) {
      return dispatch(action)
    }
    return useReduxMiddleware ?
      fn({ getState, dispatch })(next)(action) :
      fn({ getState, action, dispatch, next })
  }

  function compose(action, done) {
    // 记录上一次执行中间件的位置 #
    let index = -1
    return next(0)

    function next (i) {
      // 理论上 i 会大于 index，因为每次执行一次都会把 i递增，
      // 如果相等或者小于，则说明next()执行了多次
      if (i <= index) return Promise.reject(new Error('next() 方法被调用了多次'))
      index = i
      // 取到当前的中间件
      let fn = middlewares[i]
      // 最后一个中间件
      if (i === middlewares.length) fn = done
      if (!fn) return Promise.resolve()

      try {
        // return Promise.resolve(fn(action, () => next(i + 1)))
        return Promise.resolve(apply(fn, action, () => next(i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }

    }
  }

  return async (action) => {
    return await compose( ns ? addNamespace(ns, action) : action, dispatch )
  }
}

// 最底层的dispatch
export async function dispatch(action) {
  let { type = '' } = action;
  let temp = type.split('/')

  if (temp.length !== 2) {
    throw new Error(`dispatch: ${type}错误, 格式: 名称空间/操作`)
  }

  let [ns, name] = temp
  let model = globalModels[ns]
  
  if (!model) return;
  let { effects, reducers } = model

  if (effects && effects[name]) {
    return await effects[name](action, { 
      dispatch: middlewaresDispatch(ns), 
      state: globalState[ns], 
      globalState 
    })
  }

  if (reducers && reducers[name]) {
    let reducer = reducers[name]

    globalState[ns] = globalConfig.useImmer ?
      produce(globalState[ns], (draft) => {
        reducer(draft, action)
      }) : 
      reducer(globalState[ns], action)

    globalUpdaters.forEach(([setState, getState]) => {
      setState(getState())
    })
  }
}

// 类似于connect
export function useMapState(mapState, mapDispatch) {
  const getState = useCallback(
    () => mapState ? mapState(globalState) : globalState,
    [mapState]
  )

  const [state, setState] = useState(() => getState())

  useEffect(() => {
    globalUpdaters.push([setState, getState])

    return () => {
      globalUpdaters = globalUpdaters.filter(l => l[0] !== setState);
    }
  }, [getState])

  let middleDispatch = middlewaresDispatch()

  return [ 
    state, 
    mapDispatch ? mapDispatch(middleDispatch) : middleDispatch
  ]
}