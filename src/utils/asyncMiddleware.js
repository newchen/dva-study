// 对应dva-step6版本

export async function logger({ next, action }) {
  console.log('中间件 logger: ', action.type);

  await next(action)
  console.log('中间件 logger after: ', action.type);
}

export async function middle2({ next, action, dispatch }) {
  console.log('中间件2: ', action.type);

  // await dispatch(action)
  await next(action)

  console.log('中间件2 after: ', action.type);

}

export async function middle3({ next, action, dispatch }) {
  console.log('中间件3: ', action.type);

  await next(action)

  console.log('中间件3 after: ', action.type);
}