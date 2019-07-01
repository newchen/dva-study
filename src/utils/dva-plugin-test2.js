export default () => {
  return {
    onEffect(effect, { dispatch }, model, actionType) {
      return async function(...args) {
        console.log('start pluginTest2',actionType)
        await effect(...args);
        console.log('end pluginTest2',actionType)
      }
    },

    onReducer(reducer) {
      return (state, action) => {
        console.log('onReducer2: ******--- ' );
        return { ...state, ...reducer(state, action)};
      }
    }
  }
}