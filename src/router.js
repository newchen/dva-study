import React from 'react';

import RouteComponent, { setRuntime } from './lib/routeComponent'
import routeConfig from './config/routeConfig'
import history from './lib/history'

// 设置runtime运行时
setRuntime('./app');

export default function RouterConfig() {
  return <RouteComponent routes={routeConfig} history={history} />
}
