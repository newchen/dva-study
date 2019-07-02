// 基于dva-step5版本修改, 还是使用express中间件机制, 添加plugin插件机制

import { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import browserHistory from './history';
import produce from 'immer';
import Plugin from './plugin'

let globalState = {};
let globalModels = {};
let globalUpdaters = [];
let globalComponent = null;
let globalConfig = {};
let globalUnlisten = {}
let globalPlugins = null

export function dva(config = {}) {
  globalConfig = config;
  globalState = config.initialState || {};
  globalPlugins = new Plugin()

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
    },

    use(plugin) {
      globalPlugins.use(plugin)
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

// 中间件机制
function middlewaresDispatch(ns) {
  let i = 0;
  let { useReduxMiddleware } = globalConfig
  let middlewares = getAllHooks('onAction');

  function next (action) {
    const handler = middlewares[i++]

    if (!handler) {
      dispatch(action)
      return;
    }
    
    useReduxMiddleware ?
      handler({ getState, dispatch })(next)(action) :
      handler({ getState, action, dispatch, next })
  }

  return (action) => {
    i = 0;
    next(ns ? addNamespace(ns, action) : action )
  }
}

// 获取插件
export function getPlugin(key) {
  return globalPlugins.get(key)
}

// hooks来源有2个: 1. 通过dva(config)传入;  2. 通过dva.use(plugin)传入
function getAllHooks(key) {
  let hooks = [].concat(globalConfig[key] || []).concat(getPlugin(key))

  // 返回的是一个嵌套函数
  if (key == 'onReducer') {
    return hooks[0]
  }

  return hooks
}

// 添加错误处理
function addErrorHandle(fn, errors) {
  return async (...rest) => {
    try {
      await fn(...rest)
    } catch(e) {
      errors.forEach(v => v(e))
      setTimeout(() => { throw new Error(e.stack || e) }) // 开发版本有这个
    }
  }
}

// 处理extraReducers
function handleExtraReducers(extraReducers) {
  return (globalState, action) => {
    let newState = {};

    for(let ns in extraReducers) {
      let state = globalState[ns]
      newState[ns] = extraReducers[ns](state, action)
    }

    if (Object.keys(newState).length > 0) {
      return { ...globalState, ...newState }
    }

    return globalState
  }
}

// 判断是否async函数
function isAsyncFunction(fn) {
  return Object.prototype.toString.call(fn) == "[object AsyncFunction]"
}

// 最底层的dispatch
export function dispatch(action) {
  let { type = '' } = action;
  let temp = type.split('/')

  if (temp.length !== 2) {
    throw new Error(`dispatch: ${type}错误, 格式: 名称空间/操作`)
  }

  // dva中只要dispatch了就会触发onReducer和extraReducers, 就算该namespace不存在
  let reducerHooks = getAllHooks('onReducer')
  let extraReducers = getPlugin('extraReducers');

  let newState = reducerHooks(
    handleExtraReducers(extraReducers)
  )(globalState, action)

  let [ns, name] = temp
  let model = globalModels[ns] || {} // 防止解构报错
  
  // if (!model) return; // 因为extraReducers和onReducer会更新状态, 需要触发UI视图更新
  let { effects, reducers } = model;

  // 触发onEffect
  if (effects && effects[name]) {
    let errors = getAllHooks('onError')
    let curEffect = addErrorHandle(effects[name], errors)
    let effectHooks = getAllHooks('onEffect')

    let args = [ curEffect, { dispatch }, model, type ]
    
    let params = { 
      dispatch: middlewaresDispatch(ns), 
      state: newState[ns], 
      globalState: newState 
    }

    // 没有注册onEffect插件函数, 只有当前的effects[name], 
    // ps: 数组使用reduce方法, 至少需要1个元素, 不能为空数组
    if (effectHooks.length === 0) {
      return curEffect(action, params)
    }

    // onEffect逻辑
    // 假设use添加的顺序是: [1, 2, 3], 那么执行顺序: 3 -> 2 -> 1 -> 1 -> 2 -> 3
    effectHooks.reduce((pre, cur, index, arr) => {
      if (!isAsyncFunction(pre)) {
        pre = pre( ...args )
      }
      let asyncFn = cur(pre,  ...args.slice(1))

      if (index === arr.length - 1) {
        asyncFn(action, params)
      }

      return asyncFn
    })

    return;
  } else if (reducers && reducers[name]) {
    let reducer = reducers[name]

    newState[ns] = globalConfig.useImmer ?
      produce(newState[ns], (draft) => {
        reducer(draft, action)
      }) : 
      reducer(newState[ns], action)
  }

  // if (newState !== globalState) {
    // onStateChange处理
    const changes = getAllHooks('onStateChange')
    for (const change of changes) {
      change(newState, action);
    }

    globalState = newState;

    // UI视图更新
    globalUpdaters.forEach(([setState, getState]) => {
      setState(getState())
    })
  // }
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