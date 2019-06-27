import { dva } from './lib/dva'

let app = dva()

app.router(require('./router').default)

app.start('#root');