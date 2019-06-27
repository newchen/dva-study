import React from 'react';

export default (props) => {
  console.log('BasicLayout:', props)
  return (
    <div>
      <span style={{color:'red', fontSize: '30px'}}>BasicLayout</span>
      {props.children}
    </div>
  )
}