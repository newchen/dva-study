import React from 'react';

import RouteComponent from './lib/routeComponent'
import routeConfig from './config/routeConfig'

export default function RouterConfig({ history, app }) {
  return <RouteComponent routes={routeConfig} history={history} app={app}/>
}
