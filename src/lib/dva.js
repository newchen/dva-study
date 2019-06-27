// 实现model, unmodel, router, start等方法

import ReactDOM from 'react-dom'
import browserHistory from './history';

let globalState = {};
let globalModels = {};
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
              // dispatch // 暂未实现
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
