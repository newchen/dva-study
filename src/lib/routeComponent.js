// 只支持到2级, 无法支持多层嵌套

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
    routes.forEach((route)=>{
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
        if (hasParent) {
          routesArr.push(
            <Route 
              key={fullPath} 
              exact path={fullPath} 
              render={
                (props) => {
                  return React.createElement( // 这里是重点
                    dynamic(parentComponent),
                    props,
                    React.createElement(dynamic(component), props)
                  )
                }
              }
            />
          ) 
        } else if (!hasChildren) {
          routesArr.push(
            <Route 
              key={fullPath} 
              exact path={fullPath} 
              component={dynamic(component)}
            />
          )
        }
      }

      if(hasChildren) {
        travelRoutes(children, { ...route, path: fullPath})
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