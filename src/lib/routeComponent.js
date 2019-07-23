// 支持多层嵌套, 支持加载component和model

import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom'
import dynamic from './dynamic'

function joinPath(parentPath, path) {
  if(!parentPath) return path;

  if (path.charAt(0) === '/') {
    return path
  }

  if (parentPath.slice(-1) !== '/') {
    parentPath = parentPath + '/'
  }

  return parentPath + path;
}

function getRoutes(routes, app) {
  let routesArr = [];

  function travelRoutes(routes, parentRoute = {}) {
    routes.forEach((route) => {
      // path默认为*, 表示匹配任意路径
      const { path = '*', redirect, children, component, models = [] } = route;

      const { 
        path: parentPath = '', 
        component: parentComponent, 
        models: parentModels = []
      } = parentRoute

      let fullPath = joinPath(parentPath, path)

      if(redirect) {
        routesArr.push(
          <Redirect 
            key={fullPath} 
            exact 
            from={fullPath} to={joinPath(parentPath, redirect)}
          />
        )
      }

      let hasChildren = Array.isArray(children) && children.length > 0
      let hasParent = !!parentComponent

      if(component) {
        if (hasParent && !hasChildren) {
          routesArr.push(
            <Route 
              key={fullPath} 
              exact path={fullPath} 
              render={
                (props) => {
                  return parentComponent // 这里是重点
                    .concat(React.createElement(
                      dynamic({
                        app,
                        // models,
                        // 注意: 这里直接全量加载所有需要的model, 而不是按需只加载当前页面的model, 因为这样的话, 页面执行的时候会报错(父组件的model这时候还没加载执行)
                        models: () => {
                          return [...parentModels, ...models].map(item => item()) 
                        },
                        component
                      }), props))
                    .reverse()
                    .reduce((pre, cur, index) => {
                      return React.createElement( 
                        dynamic({
                          app,
                          // models: parentModels[index - 1],
                          component: cur
                        }), props, pre )
                    })
                }
              }
            />
          ) 
        } else if (!hasChildren) {
          routesArr.push(
            <Route 
              key={fullPath} 
              exact path={fullPath} 
              render={ // 按需加载
                (props) => React.createElement(
                  dynamic({
                    app,
                    models,
                    component
                  }),
                  props
                )
              }
            />
          )
        }
      }

      if(hasChildren) {
        travelRoutes(children, {
          ...route,

          component: hasParent ? // 这里是重点
            parentComponent.concat(component) : // component每个路由只有一个
            [ component ],

          models: hasParent ?
            // [ models ].concat([ parentModels ]) :// models每个路由可以是多个
            [ ...parentModels, ...models ] : 
            models,

          path: fullPath
        })
      }
    })
  }

  travelRoutes(routes)

  return routesArr;
}

export function RouteComponent(props) {
  return (
    <Router history={props.history}>
        <Switch>
          {/* 
            // 原理
            <Route exact path='/b' component={asyncComponent(() => import(./b))}/>

            <Route exact path='/a' render={
              (props) => {
                return React.createElement(
                  asyncComponent(() => import('./layouts/BasicLayout')),
                  props,
                  React.createElement(asyncComponent(() => import('./a')), props)
                )
              }
            }/>  
          */}
          { getRoutes(props.routes, props.app) }
        </Switch>
    </Router>
  )
}
export default RouteComponent