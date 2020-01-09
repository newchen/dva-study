// export default [
//   // BasicLayout布局
//   {
//     path: '/',
//     component: () => import('../layouts/BasicLayout'),
//     models: [
//       () => import('../models/app')
//     ],
//     children: [
//       { 
//         path: 'a', 
//         component: () => import('../layouts/APageLayout'),
//         children: [
//           { 
//             path: 'aa', 
//             models: [
//               () => import('../pages/aa/model')
//             ],
//             component: () => import('../pages/aa/index'),  
//           },
//           { path: 'bb/:id', component: () => import('../pages/bb') },
//         ]
//       },
//     ],
//   },
//   // 授权布局
//   {
//     path: '/auth',
//     component: () => import('../layouts/AuthBasicLayout'),
//     children: [
//       { path: 'b', component: () => import('../pages/b') },
//     ],
//   },
//   // 无布局
//   {
//     path: '/b',
//     component: () => import('../pages/b')
//   },
//   // 跳转
//   {
//     path: '/abc',
//     redirect: '/a/aa'
//   },
//   // 404
//   {
//     component: () => import('../pages/404')
//   }
// ]

export default [
  // BasicLayout布局
  {
    path: '/',
    component: '../layouts/BasicLayout',
    models: [
      '../models/app'
    ],
    children: [
      { 
        path: 'a', 
        component: '../layouts/APageLayout',
        children: [
          { 
            path: 'aa', 
            models: [
              '../pages/aa/model'
            ],
            component: '../pages/aa/index',  
          },
          { path: 'bb/:id', component: '../pages/bb' },
        ]
      },
    ],
  },
  // 授权布局
  {
    path: '/auth',
    component: () => import('../layouts/AuthBasicLayout'),
    children: [
      { path: 'b', component: '../pages/b' },
    ],
  },
  // 无布局
  {
    path: '/b',
    component: '../pages/b'
  },
  // 跳转
  {
    path: '/abc',
    redirect: '/a/aa'
  },
  // 404
  {
    component: 'pages/404'
  }
]