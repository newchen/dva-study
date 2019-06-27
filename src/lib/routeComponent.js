// 支持多层嵌套, 只支持加载component, 无法加载model

import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom'
import { dynamic } from './dynamic'

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

function getRoutes(routes) {
  let routesArr = [];

  function travelRoutes(routes, parentRoute = { path: '' }) {
    routes.forEach((route) => {
      const { path, redirect, children, component } = route;
      const { path: parentPath, component: parentComponent } = parentRoute
      let fullPath = joinPath(parentPath, path)

      if(redirect) {
        routesArr.push(
          <Redirect 
            key={fullPath} 
            exact 
            from={path} to={joinPath(parentPath, redirect)}
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
                    .concat(React.createElement(dynamic(component), props))
                    .reverse()
                    .reduce((pre, cur) => {
                      return React.createElement(dynamic(cur), props, pre )
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
                  dynamic(component),
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
            parentComponent.concat(component) :
            [ component ],
          
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
          {/* <Route exact path='/b' component={dynamic(() => import(./b))}/>

          <Route exact path='/a' render={
            (props) => {
              return React.createElement(
                dynamic(() => import('./layouts/BasicLayout')),
                props,
                React.createElement(dynamic(() => import('./a')), props)
              )
            }
          }/>  */}

          { getRoutes(props.routes) }
        </Switch>
    </Router>
  )
}

export default RouteComponent