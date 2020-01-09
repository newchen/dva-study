
export function patchRoutes(routes) {
  console.log('patchRoutes', routes)
}

export function render(oldRender) {
  console.log('render:')

  // setTimeout(() => {
  //   oldRender()
  // }, 2000)
  oldRender()
}

export function onRouteChange({ location, routes, action }) {
  console.log('onRouteChange', location, routes, action)
}