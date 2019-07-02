import { dva } from './lib/dva'

import createLoading from './lib/dva-loading';
import pluginTest1 from './utils/dva-plugin-test1';
import pluginTest2 from './utils/dva-plugin-test2';
import pluginTest3 from './utils/dva-plugin-test3';

let app = dva({
  onError(e) {
    console.error('onError', e.message);
  },

  // onStateChange(newState, action) {
  //   console.log('***', newState, action)
  // }
})

app.use(createLoading())
app.use(pluginTest1())
app.use(pluginTest2())
app.use(pluginTest3())

app.router(require('./router').default)

app.start('#root');