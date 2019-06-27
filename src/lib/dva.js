// 实现dispatch和useMapState方法

import { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import browserHistory from './history';

let globalState = {};
let globalModels = {};
let globalUpdaters = [];
let globalComponent = null;
// let globalConfig = {};
let globalUnlisten = {}

export function dva(config = {}) {
  // globalConfig = config;
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
              dispatch
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

// 实现dispatch
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
      dispatch, 
      state: globalState[ns], 
      globalState 
    })
  }

  if (reducers && reducers[name]) {
    let reducer = reducers[name]

    // 更改状态
    globalState[ns] = reducer(globalState[ns], action)

    // 更新视图
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

  return [ 
    state, 
    mapDispatch ? mapDispatch(dispatch) : dispatch
  ]
}
