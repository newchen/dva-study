import { dva } from './lib/dva'

import pluginTest1 from './utils/dva-plugin-test1';
import pluginTest2 from './utils/dva-plugin-test2';

let app = dva({
  onError(e) {
    console.error('onError', e.message);
  },
})

app.use(pluginTest1())
app.use(pluginTest2())

app.router(require('./router').default)

app.start('#root');