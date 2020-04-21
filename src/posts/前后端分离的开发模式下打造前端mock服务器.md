---
title: "前后端分离的开发模式下打造前端mock服务器"
tags: ["mock", "node.js"]
slug: Create front-end mock server in front-end and back-end separated development mode
createDate: 1514822400000
---
项目地址：[cf-mock-server](https://www.npmjs.com/package/cf-mock-server)
Github: [Mock Server](https://github.com/xiao555/mock-server)

## 需求背景
刚来公司实习，了解到有这么一个需求：因为我们是前后端分离的开发模式，了解业务需求后，前后端需要规定好接口，我们用的是`postman`，后端写好接口，请求格式，返回格式等，前端直接参考着用就行。但是在前端后端同时开工的情况下，可能前端需要数据的时候后端接口还没写好，这时候就需要我们自己mock一些数据来测试一下功能是否完成。

在这之前，前端组是用Fiddler等工具通过拦截api请求，根据设置的映射表规则，返回指定静态文件作为http响应来实现的。由于Fiddler对Mac OS不友好，需要找到替代方案。

--intro--

## 方案调研
我当时把这个需求接了下来，因为自己已经有了一个初步的方案，就是本地跑一个node服务器，维护一个api映射关系，根据不同的请求返回对应的静态文件里的数据。

当然，只是我当时想的一种，是不是真要这么做还要研究一下其他公司的方案。于是搜到了这篇文章[前后端分离开发模式的 mock 平台预研](https://github.com/CntChen/cntchen.github.io/issues/1), 文章里提到了几种方案而且列出了各自的优缺点：
1. 硬编码数据
2. 请求拦截 & mock 数据
3. 本地 mock 服务器
4. 代理服务器（ charles or fiddler）

以及提到了一些库和框架，比如[faker.js](https://github.com/marak/Faker.js/),   [RAP](https://github.com/thx/RAP)等等。结合我们自己的情况，我认为本地mock服务器是最好的方案：
1. 硬编码肯定不行，难道要自己频繁的手动增删代码？
2. 请求拦截，mock数据，测试环境，线上环境要切换，而且我们不需要去生成随机的数据，而是将返回的数据保存在静态文件中。所以实际操作起来不如本地mock服务器
3. 代理服务器，要代替的就是这种方案
4. 其他库和框架，用不上，我们只需要一个轻量的代理方案
5. 本地mock服务器，比较方便且自由的实现方式，可以统一管理API配置，更方便的实现跨域，可扩展性高方便以后增加功能

好，就这么确（qin）定了！

## 技术选型

首先需要一个node框架来跑我们的mock服务。虽然市面上相关的工具`Express`占据大多数，我还是选择了`Koa`, koa写起来多优雅，而且我之前用的也基本都是koa。当然`Express`可能更稳定，生态环境更丰富，但是`koa`足够了。

于是把我写[Blog](https://github.com/xiao555/blog/tree/master/blog/server)的后端基本框架搬过来了(所以主要是为了方便 : D

保留了 中间件(cors, bodyparser, helmet), 日志(log4js)，利用fs模块读取API配置文件和数据文件构成router。

## 技术实现

### 核心逻辑
选型定好了，下面开始实现。我们要做的就是根据api配置创建不同的路由，根据不同的参数返回相应的数据。

首先，我们规定的API 配置文件是这样的：
``` javascript
// config.js
// 数据目录
exports.dataFile = '../{YOUDATAFOLDER}'
/**
 * KEY: '{METHOD} {router}'
 * VALUE: 数据文件路径，相对于dataFile
 */
exports.api = {
  // GET all user
  'GET /api/users/all': 'all_users.txt',
  // GET user named 'tom'
  'GET /api/users/?name=tom': 'users/tom.json',
  // GET user whatever the name is
  'GET /api/users/?name=/^A.*\\^$/': 'users/example.json',
}
```
接下来，我们要根据这个配置文件创建路由，由于我们用`koa-router`来配置路由，比如：
``` javascript
router.get('/hello', ctx => { return ctx.body = 'Hello World!' })
```
 简单提炼一下就是
``` javascript
router[$METHOD]($PATH, ctx => { /** Handle Router **/ })
```
所以，读取配置文件时，构建了如下格式的对象：
```
{
	"/users/all": {
		"get":[
			{
				"params":"name=sam",
				"data":"users/example"
			},
			{
				"data":"searchOrder"
			}
		]
	},
	"/api/users/":{
		"get":[
			{
				"params":"name=/^A.*\\^$/",
				"data":"users/example.json"
			},
			{
				"params":"name=tom",
				"data":"users/tom.json"
			}
		]
	}
}
```
这样一个path对应不同的method，方便对每个路径注册不同方法的路由，每个方法后面又对应不同的参数情况，这些就在后面的处理函数中判断当前的请求匹配哪一个情况然后返回对应data文件中的数据。

请求的参数可以通过`ctx.query`获取，如：`{"name":"xiao555","age":"18"}`，根据配置文件解析结果我们也可以很轻松的将`params`字段转化成`Object` 与 `ctx.query` 作对比来判断匹配的是哪种情况。这里有几个问题需要注意：

1. 判断逻辑要符合要求的匹配规则
比如不带参数的请求只会跟不带参数的匹配，不会去跟带参数的情况比较
比如我们想做成优先匹配，那就要从头开始遍历，遇到匹配的就跳出循环返回结果
更灵活一点比如模糊匹配，即只要请求的参数字段跟配置的相应字段都能对上，就算匹配成功，比如：`/user/?name=obama&age=18: xxxx， /user/?name=obama: xxxx`当访问`/user/?name=obama`的时候匹配到了`/user/?name=obama&age=18`就不往下匹配了
2. 请求参数可能会有同名的情况
比如`/user/?name=obama&name=tom`这种情况`ctx.query`的结果会是`{"name":["obama", "tom"]}`, 所以要做好对参数值是数组的情况的判断

功能上实现了，我们可以结合具体使用情况做一些小的改进：
1. 有时候，请求的参数是动态改变的，但是模拟数据可以用同一份。这时候我们可以用`*`做一个占位，如果配置里的参数值是`*`的话，那么无论请求里对应参数的值是什么都算匹配。
2. 实际开发时我们API配置是不断去添加更新的，需要不断的重启mock server，很不方便，于是我们可以做一个监听文件改动自动更新的功能。最初我选择的是用[nodemon](https://github.com/remy/nodemon), 写一个json文件。但是其实有不用重启服务器就可以自动更新router的方法，不过这里不表，后面再说。

### 进阶改造

####  发布到npm

使用过程中我们直接将mock server放到项目文件里：
```
- build/
- config/
- mockServer
	- config.js
	- data/**/*.json
	- router/index.js
	- middleware/*.js
	- utils/*.js
	- app.js
	- package.json
	- nodemon.json
	- ...
- src/
- static/
- ...
```
这么多文件中，在开发过程中我们关心的只有`config.js` 还有`data`目录下的数据文件而已，所以为了达到隐藏其他文件的目的，打算把mock server传到[npm](https://www.npmjs.com/)上，通过引入`node_modules`来实现。那么引入`node_modules`怎么去用呢？

这里我参考的[Mocha](https://github.com/mochajs/mocha)的实现，因为之前还简单分析过它的[源码](https://www.xiao555.com.cn/posts/mocha)。两种方法，一种是命令行接口，一种是手动创建mock server实例。

其实也就是把之前写的mock server封装成一个`Mock`构造函数传出去，用的时候我们需要`new`一个实例，实例里创建并绑定了Koa的一个实例。`Mock`构造函数有一下几个方法：
```
Mock.prototype.setPort // 设置端口
Mock.prototype.getConfig // 获取配置文件
Mock.prototype.createRouter // 创建路由
Mock.prototype.showlog // 配置log
Mock.prototype.startApp // 开启服务
Mock.prototype.watchFile // 监听文件改动
Mock.prototype.rerun // 应用新的路由配置
Mock.prototype.run // 服务启动入口
```
用法示例：
```javascript
// mock.js
const path = require('path')
let Mock = require('cf-mock-server')

let app = new Mock({
  config: path.join(__dirname, './config'), // 配置文件
  watch: true,                    // 观察模式，监听配置文件改动自动应用
})

app.run()
```
而命令行的方法用的[commander.js](https://github.com/tj/commander.js/)
``` javascript
const program = require('commander');

program
  .version(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).version)
  .usage('[options] <file ...>')
  .option('-p, --port <port>', 'Define the mock server started port, default is 8008')
  .option('-w, --watch', 'Listen to the file changes and restart the service')
  .option('-c, --config <file>', 'Custom profiles, default is mock/config.js')
  .option('-l, --log', 'Record the log and save to "mock/log/" and named {date}.log')
  .option('-L, --Log <path>', 'Record the log and save to <path>, default "mock/log/" and named {date}.log')
```
也是先`new`一个`Mock`实例，然后根据不同的参数设置调用不同的方法，具体可以看`bin/_mock`。

#### 热更新路由

最关键的一个改进是监听配置文件改变自动更新路由的功能，这个是参考这篇文章：[Node.js Web应用代码热更新的另类思路](http://fex.baidu.com/blog/2015/05/nodejs-hot-swapping/)
```javascript
Mock.prototype.watchFile = function () {
  console.log('>> Watch mode')
  utils.watch([this.file], () => {
    console.log('File changed!')
    delete require.cache[this.file];
    this.rerun();
  });
}
```
监听到文件改变时，回调函数执行`delete require.cache[this.file];`清除缓存(针对配置文件是JSON的情况)，然后执行`rerun()`：
```javascript
/**
 * Application new config
 */
Mock.prototype.rerun = function () {
  this.getConfig()
  this.createRouter()
}
```
`rerun`获取新的配置，创建新的路由：
```javascript
/**
 * Create router function with config object
 */
Mock.prototype.createRouter = function () {
  this.router = router(this.config)
}

/**
 * Start server
 */
Mock.prototype.startApp = function () {
  ...
  // Application router
  this.app.use(async (ctx, next) => {
    await this.router(ctx, next)
  })
  ...
}
```
这里利用闭包的特性获取最新的router对象，避免app.use缓存router对象。这样就实现了路由配置的热更新。

后面针对需求还做了一些小的改进：
1. 支持访问静态资源
2. 参数支持正则匹配
3. 支持读取txt，内容为响应头+body，即可自定义响应头

## TODO

1. 完善请求拦截方案
2. 跨平台兼容问题（如LF，CRLF）
3. 自动化测试
4. README优化
5. 想搞的更高级一些，将请求响应以及配置路由的增删改查可视化

## 参考资料

1. [前后端分离开发模式的 mock 平台预研](https://github.com/CntChen/cntchen.github.io/issues/1)
2. [Node.js Web应用代码热更新的另类思路](http://fex.baidu.com/blog/2015/05/nodejs-hot-swapping/)