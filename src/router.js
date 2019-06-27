import React from 'react';

import RouteComponent from './lib/routeComponent'
import routeConfig from './config/routeConfig'
import history from './lib/history'

export default function RouterConfig() {
  return <RouteComponent routes={routeConfig} history={history} />
}
