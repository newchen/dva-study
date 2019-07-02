export default () => {
  return {
    onEffect(effect, { dispatch }, model, actionType) {
      // console.log('fffff',effect )
      return async function(...args) {
        console.log('start onEffect pluginTest1',actionType)
        await effect(...args);
        console.log('end onEffect pluginTest1', actionType)
      }
    },

    onReducer(reducer) {
      return (state, action) => {
        console.log('onReducer1: ******- ');
        return { ...state, ...reducer(state, action)};
      }
    }
  }
}