import { dva } from './lib/dva'
// import { logger, middle2, middle3 } from './utils/middleware'
import { logger, middle2, middle3 } from './utils/reduxMiddleware'

let app = dva({
  useImmer: true,
  useReduxMiddleware: true,
  onAction: [ logger, middle2, middle3 ],
})

app.router(require('./router').default)

app.start('#root');