## dva学习 - 源码相关

```
实现类dva, 步骤6:
  基于dva-step5版本修改, 将express中间件机制换成了koa中间件机制, 支持在effect中: await dispatch({xxx}), 能够按照顺序执行, 但是增加了实现和使用的复杂度(中间件示例:asyncMiddleware)
```