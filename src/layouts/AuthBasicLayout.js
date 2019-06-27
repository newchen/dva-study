import React from 'react';
import BasicLayout from './BasicLayout'

export default (props) => {
  if (localStorage.getItem('login')) {
    return <BasicLayout {...props}></BasicLayout>
  }

  return <div>无权限</div>
}