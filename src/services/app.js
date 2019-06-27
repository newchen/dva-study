export async function fetchInit(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: 1111
      })
    }, 300)
  })
}

export async function fetchName(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: 'jsonchen-' + ( +new Date())
      })
    }, 300)
  })
}