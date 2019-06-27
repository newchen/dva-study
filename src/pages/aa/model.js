import { fetchEat } from './service'

export default {
  namespace: 'aa',

  state: {
    eat: '',
  },

  effects: {
    async fetchEat({ payload }, { dispatch }) {
      console.log('aa payload: ', payload)
      let data = await fetchEat()
      
      dispatch({
        type: 'aa/upadte',
        payload: { eat: data.data }
      })
    },
  },

  reducers: {
    upadte(state, { payload }) {
      return { ...state, ...payload }
    }
  },

  subscriptions: {
    setup({ history, dispatch }) {
      console.log('aa setup')

      dispatch({
        type: 'aa/fetchEat',
        payload: 12
      })
    }
  }
}