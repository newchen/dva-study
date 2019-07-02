import React from 'react';
import { Link } from 'react-router-dom'
import { useMapState } from '../../lib/dva'

export default () => {
  let [ state, dispatch ] = useMapState(state => ({ ...state.app, ...state.aa, loading: state.loading }))
  console.log('state', state)

  return (
    <div>
      <p>alayout的子页面: aa</p>

      {
        state.loading.models.app ?
          <div>正在加载...</div> :
          <div>姓名: { state.name }</div>
      }
     
      <div>吃: { state.eat }</div>

      <button onClick={() => dispatch({type: 'app/fetchName'})}>改变姓名</button>

      <Link to="/b">跳转到b页面</Link>
    </div>
  )
}