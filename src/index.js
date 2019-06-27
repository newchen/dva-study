import { dva } from './lib/dva'
import { logger, middle2, middle3 } from './utils/asyncMiddleware'

let app = dva({
  onAction: [ logger, middle2, middle3 ],
})

app.router(require('./router').default)

app.start('#root');