import { dva } from './lib/dva'
import { logger, middle2, middle3 } from './utils/middleware'

let app = dva({
  onAction: [ logger, middle2, middle3 ],
})

app.router(require('./router').default)

app.start('#root');