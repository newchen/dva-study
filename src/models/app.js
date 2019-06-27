import { fetchInit, fetchName } from '../services/app'

export default {
  namespace: 'app',

  state: {
    name: 'xxx',
    init: 12
  },

  effects: {
    async fetchInit({ payload }, { dispatch, state, globalState}) {
      console.log('effects state: ', state, globalState)
      console.log('app payload: ', payload)
      let data = await fetchInit();

      dispatch({
        type: 'upadte',
        payload: { init: data.data }
      })
    },
    async fetchName({ payload }, { dispatch, state, globalState}) {
      let data = await fetchName();
      
      // console.info('%c fetchName', 'color: red')

      dispatch({
        type: 'upadte',
        payload: { name: data.data }
      })
    }
  },

  reducers: {
    upadte(state, { payload }) {
      // console.info('%c upadte', 'color: green')

      return { ...state, ...payload }
    }
  },

  subscriptions: {
    setup({ history, dispatch }) {
      console.log('app setup')

      dispatch({
        type: 'fetchInit',
        payload: 12
      })
    }
  }
}