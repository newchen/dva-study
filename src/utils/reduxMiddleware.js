export const logger = ({ getState, dispatch }) => (next) => (action) => {
  console.log('中间件 logger: ', action.type);

  next(action)
  console.log('中间件 logger after: ', action.type);
}

export const middle2 = ({ getState, dispatch }) => (next) => (action) => {
  console.log('中间件2: ', action.type);

  // dispatch(action)
  next(action)

  console.log('中间件2 after: ', action.type);

}

export const middle3 = ({ getState, dispatch }) => (next) => (action) => {
  console.log('中间件3: ', action.type);

  next(action)

  console.log('中间件3 after: ', action.type);
}