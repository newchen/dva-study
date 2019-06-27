// 添加useImmer和useReduxMiddleware功能配置

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
  let i = 0;
  let { useReduxMiddleware, onAction } = globalConfig
  let middlewares = [].concat(onAction || []);

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

// 最底层的dispatch
export function dispatch(action) {
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
    return effects[name](action, { 
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