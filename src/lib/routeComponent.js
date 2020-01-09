// 实现: setRuntime, patchRoutes, render, onRouteChange 运行时方法

import React, { useState, useEffect } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom'
import dynamic from './dynamic'
import queryString from 'query-string'

// 实现: https://umijs.org/zh/guide/runtime-config.html
// 目前实现了下面3个运行时方法
let patchRoutes = (routes) => routes
let render = (oldRender) => oldRender()
let onRouteChange = ({ location, routes, action }) => {}

function resolve(path) {
  return path.replace('./', '')
}

// 设置runtime运行时
export function setRuntime(config = {}) {
  if(typeof(config) === 'function') {
    config = config() // 此时config大致为: () => require('@/app')
  } 

  if(typeof config === 'object') {
    patchRoutes = config.patchRoutes || patchRoutes;
    render = config.render || render
    onRouteChange = config.onRouteChange || onRouteChange
  } else {
    throw new Error(`
      setRuntime 只支持传入
        function, 例如: () => require('@/app')
        或object, 例如: { patchRoutes, render, onRouteChange } 
    `)
  }

}

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

// 将component和models字符串形式, 转为动态导入方法
function handleImport(route) {
  let { component, models } = route

  if (typeof component === 'string') {
    route.component = () => import(`@/${component}`)
  }

  if (models) {
    route.models = [].concat(models).map(v => {
      if(typeof(v) === 'string') {
        return () => import(`${v}`)
      } else {
        return v
      }
    })
  }

  return route
}

function handleRoutes(routes) {
  function travel(routes, parentPath) {
    routes.forEach((route) => {
      route = handleImport(route)

      // path默认为*, 表示匹配任意路径
      const { path = '*', children, redirect } = route;
      let fullPath = joinPath(parentPath, path)

      route.path = fullPath

      if (redirect) {
        route.redirect = joinPath(parentPath, redirect)
      }

      if( Array.isArray(children) ) {
        travel(children, fullPath)
      }
    })
  }

  travel(routes)
  // patchRoutes运行时
  return patchRoutes(routes) || routes
}

function getRouteComponents(routes, app) {
  let routesArr = [];

  function travelRoutes(routes, parentRoute = {}) {
    routes.forEach((route) => {
      const { path, redirect, children, component, models = [] } = route;

      const { 
        component: parentComponent, 
        models: parentModels = []
      } = parentRoute

      if(redirect) {
        routesArr.push(
          <Redirect 
            key={path} 
            exact 
            from={path} to={redirect}
          />
        )
      }

      let hasChildren = Array.isArray(children) && children.length > 0
      let hasParent = !!parentComponent

      if(component) {
        if (hasParent && !hasChildren) {
          routesArr.push(
            <Route 
              key={path} 
              exact path={path} 
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
              key={path} 
              exact path={path} 
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

          path
        })
      }
    })
  }

  travelRoutes(routes)

  return routesArr;
}

function handleLoc(location) {
  return {
    ...location,
    query: queryString.parse(location.search)
  }
}

function handleRouteChange(history, routes) {
  history.listen((location, action) => {
    onRouteChange({ location: handleLoc(location), routes, action })
  })

  onRouteChange({ 
    location: handleLoc(history.location), 
    routes, 
    action: undefined 
  })
}

export function RouteComponent(props) {
  let routes = handleRoutes(props.routes)

  handleRouteChange(props.history, routes)

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
          { getRouteComponents(routes, props.app) }
        </Switch>
    </Router>
  )
}

export default (props) => {
  let [ Comp, setComp ] = useState(null)

  useEffect(() => {
    // render 运行时
    render(() => setComp(<RouteComponent {...props}/>))
  }, [])

  return Comp
}