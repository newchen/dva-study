export async function fetchEat(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: 'fish'
      })
      // reject(new Error('ddd'))
    }, 300)
  })
}