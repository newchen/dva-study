import React from 'react';
import { Link } from 'react-router-dom'

export default () => {
  return (
    <div>
      bbbbb
      <Link to="/a/aa">跳转到aa页面</Link>
      <Link to="/a/bb/123">跳转到/a/bb/123页面</Link>
    </div>
  )
}