import React from 'react';

export default (props) => {
  console.log('APageLayout:', props)

  return (
    <div>
      a页面
      {props.children}
    </div>
  )
}