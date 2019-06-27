export default [
  // BasicLayout布局
  {
    path: '/',
    component: () => import('../layouts/BasicLayout'),
    children: [
      { 
        path: 'a', 
        component: () => import('../layouts/APageLayout'),
        children: [
          { 
            path: 'aa',
            component: () => import('../pages/aa/index'),  
          },
          { path: 'bb', component: () => import('../pages/bb') },
        ]
      },
    ],
  },
  // 授权布局
  {
    path: '/auth',
    component: () => import('../layouts/AuthBasicLayout'),
    children: [
      { path: 'b', component: () => import('../pages/b') },
    ],
  },
  // 无布局
  {
    path: '/b',
    component: () => import('../pages/b')
  },
]