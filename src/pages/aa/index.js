import React from 'react';
import { Link } from 'react-router-dom'

export default () => {
  return (
    <div>
      <p>alayout的子页面: aa</p>
      <Link to="/b">跳转到b页面</Link>
    </div>
  )
}