export default () => {
  return {
    onEffect(effect, { put }, model, actionType) {
      return async function(...args) {
        console.log('start pluginTest1',actionType)
        await effect(...args);
        console.log('end pluginTest1', actionType)
      }
    },

    onReducer(reducer) {
      return (state, action) => {
        console.log('onReducer1: ******- ', reducer(state, action), state, action );
        return { ...state, ...reducer(state, action)};
      }
    }
  }
}