export default () => {
  return {
    onEffect(effect, { dispatch }, model, actionType) {
      return async function(...args) {
        console.log('start onEffect pluginTest3',actionType);
        // console.log(effect)
        await effect(...args);
        console.log('end onEffect  pluginTest3',actionType)
      }
    },

    onReducer(reducer) {
      return (state, action) => {
        console.log('onReducer3: ******--- ' );
        return { ...state, ...reducer(state, action)};
      }
    }
  }
}