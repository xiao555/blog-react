---
title: "cf-mock-server：前端 mock 数据解决方案"
tags: ["mock"]
slug: cf-mock-server-front-end mock data solution
createDate: 1540133760000
---
### 简介

cf-mock-server 是目前前端二组正在使用的mock数据解决方案，使得前端在开发过程中可自定义接口数据，不依赖后端服务，修改数据热更新，可以方便地测试不同情况的数据，提高了开发效率。

在设计上，既可以单独跑一个Node服务，也可以作为中间件挂载到其他服务上，增强了可扩展性。有比较完善的测试用例，对核心的中间件代码和工具类函数进行单元测试，覆盖率99%。目前放在个人[Github](https://github.com/xiao555/mock-server)上维护，并搭配[Travis Ci](https://travis-ci.org/xiao555/mock-server)部署了持续集成环境，欢迎star。


--intro--

### Features

* 支持中间件方式挂载服务，可用于Express和Koa搭建的Node服务
* 支持单独开启一个Koa服务提供mock数据
* 支持命令行方式启动服务
* 修改配置文件热更新
* 支持自定义Response Header
* 支持请求参数配置使用正则表达式
* 支持请求参数不完全匹配
* 支持RESTful风格的API
* 支持请求路径的模糊匹配

### 代码

项目代码结构：

```
.
|__lib
| |__middleware // node 中间件
| | |__index.js
| | |__parse.js
| | |__match.js
| |__server // node server
| | |__koa.js
| |__utils // 工具类
| | |__log.js
| | |__index.js
| | |__error.js
|__test // 测试
| |__expressMiddleware.test.js
| |__utils.test.js
| |__koaMiddleware.test.js
```
`middleware` 中的`index.js`提供了express和koa的中间件接口，以express为例：

![8c7507eb7f974280b065655bc792b10e_carbon1.png](https://xiao555.netlify.com/8c7507eb7f974280b065655bc792b10e_carbon1.png)

而`parse.js` 负责在注册中间件前将用户的API配置处理成我们需要的格式：

![e3fbe97347384eb98a3a9723d7bf16c1_carbon2.png](https://xiao555.netlify.com/e3fbe97347384eb98a3a9723d7bf16c1_carbon2.png)

`match.js` 则是当请求经过中间件时，去匹配我们处理过的API配置，找到对应的value：

![7c5cd19c5fc4434cbd5af6b8d7a48cf9_carbon3.png](https://xiao555.netlify.com/7c5cd19c5fc4434cbd5af6b8d7a48cf9_carbon3.png)

然后对value进行解析，如果是文件路径则返回文件的内容，如果是JSON字符串则返回json。

同时，我们定义了自己的错误类型去显示及定位错误信息，当配置文件有问题时或请求匹配有问题时都会将错误信息展示出来：

![7d17400db60c42b0ace2c300472cbdcc_carbon4.png](https://xiao555.netlify.com/7d17400db60c42b0ace2c300472cbdcc_carbon4.png)

![9abc17654d9c40ee97c9fb2553dfff62_image.png](https://xiao555.netlify.com/9abc17654d9c40ee97c9fb2553dfff62_image.png)

`utils/index.js` 则是一些工具类函数，例如路径的模糊匹配(这个算法不知道大家有没有更好的解)：
![101305610fb74a18881da94e30618393_carbon5.png](https://xiao555.netlify.com/101305610fb74a18881da94e30618393_carbon5.png)

最后，这一系列的功能需要有完善的测试用例保证其可维护性，以测试koa中间件功能为例：
![fbc52d1cc9054f418d31fce33b864e70_carbon6.png](https://xiao555.netlify.com/fbc52d1cc9054f418d31fce33b864e70_carbon6.png)

测试结果，最后是代码覆盖率：
![df598ff1090441aca47ff476c80e8e81_carbon7.png](https://xiao555.netlify.com/df598ff1090441aca47ff476c80e8e81_carbon7.png)

以上，欢迎各路大神code review，我自己也在不断优化代码，尽量做到简洁，可读性强。`match.js`以及`parse.js`的代码改了N次，因为同组的小伙伴看了直呼看不懂，其实我自己过几天也看不懂==

严格来说不算**线上运行的代码**，但是也解决了平时开发的效率问题，总之晒码大赛分母喜+1
