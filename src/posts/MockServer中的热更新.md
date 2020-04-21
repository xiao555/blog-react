---
title: "MockServer中的热更新"
tags: ["node"]
slug: Hot update in MockServer
createDate: 1585220447984
---对于一个mock服务来说，热更新是一个很重要的功能，不用每次更改mock数据之后还要重启一下，提高开发效率。热更新的对象有两种：配置文件和mock数据文件。
--intro--
### 配置文件

以我们目前项目中的使用MockServer方式来说，我们目前是作为express中间件的形式挂载在本地开发时启动的Node服务上：

``` javascript
// vue.config.js
const mock = require('cf-mock-server/express-mw')

module.exports = {
  devServer: {
    after: (app) => {
     app.use(mock({
      config: path.join(__dirname, './mock-server/config.js')
     }))
    }
  }
}
```
传入的config指向配置文件的绝对路径。这里的mock方法根据传入的选项初始化中间件并返回中间件的处理函数：

``` javascript
exports.expressMockMiddleware = (options) => {
  try {
    initMiddleware(options) // 初始化中间件
  } catch (error) {
    console.log('\n')
    handleError(error)
  }

  return async (req, res, next) => {
	...
  }
}
```
初始化方法解析并监听了配置文件，如果文件改动则重新解析配置文件：
``` javascript
/**
 * 初始化中间件
 *
 * @param {object} options
 */
function initMiddleware (options) {
  // 获取完整路径
  let confFile = typeof options.config === 'object'
    ? null
    : utils.getFullPathOfFile(options.config, ['.js', '.json'])
  // 初始化数据
  Object.assign(options, {
    confFile, // mock配置文件路径
    dataFilePath: '', // 数据文件基础路径
    apiConf: null, // API配置
  })

  // 监听mock配置文件改动，热更新API配置
  options.confFile && utils.watch([options.confFile], (file) => {
    log.warning(`${file} changed!`)
    delete require.cache[file]
    handleConfig(options)
  })
  // 解析配置文件
  handleConfig(options)
}
```

解析的结果都挂载到options对象上，然后中间件的处理函数也是从options对象上获取解析后的API配置。所以对于配置文件的热更新其实就是**监听文件改变+更新文件处理结果的引用**。

### Mock数据

最初设计MockServer的时候，mock数据支持多种格式：

``` javascript
let Mock = require('cf-mock-server')

let app = new Mock({
  config: {
    dataFile: './mockData',
    api: {
      'GET /api/users/all': '[{"name":"tom"},{"name":"jerry"}]',
      'GET /api/users/?name=tom': 'users/tom.json',
      'GET /api/users/?name=/^A.*\\^$/': 'users/tom.js',
      'GET /api/users/?name=*': 'users/tom.txt',
      'POST /api/users': (req, res) => {
        if (req.body.name === 'tom') {
          res.status(200).send({ message: 'Create user success!' })
        }
      },
    }
  },
  watch: true,
})

app.run()
```

JSON字符串和函数的就不必说了，跟随配置文件改动。那JS文件，JSON文件，TXT文件这些是怎么支持热更新的呢？可以看一下读取文件的处理：

``` javascript
/**
 * 读取文件
 *
 * @param {string} file - 文件路径
 * @returns {object} {
 *   header: {},
 *   body: Response Data,
 * }
 */
function readFile (file) {
  file = getFullPathOfFile(file, ['.json', '.js', '.txt'])

  let ext = path.extname(file)
  let content = readFileSync(file, 'utf-8')
  switch (ext) {
    case '.json':
      return {
        header: {},
        body: JSON.parse(content)
      }
    case '.txt':
      let [header, body] = $crlf.crlf(content, $crlf.LF).split('\n\n')
      return {
        header: header.split('\n').reduce((obj, item) => {
          if (!item.includes(': ')) return obj
          let [key, value] = item.split(': ')
          obj[key] = value
          return obj
        }, {}),
        body: JSON.parse(body)
      }
    case '.js':
      delete require.cache[file]
      return require(file)
    default:
      return content
  }
}

```
JSON文件和TXT文件都是每次读取文件内容，自然是最新的。而JS文件则先清缓存再重新require.

### require.cache

假如我们有一个js文件,  被引用了两次：

``` javascript
// hello.js
console.log('Hello World!')

// index.js
require('./hello')
require('./hello')
```
执行一下index:

``` javascript
➜  test node index.js
Hello World!
➜  test
```
可以看到console.log只执行了一次。第一次require的时候，node会执行模块的代码，然后缓存起来，第二次require的时候就会从缓存中拿。而这个缓存就是require.cache:

``` javascript
// index.js
console.log(require.cache)
require('./hello')
console.log(require.cache)
require('./hello')

➜  test node index.js
{ '/Users/zhangruiwu/Desktop/test/index.js':
   Module {
     id: '.',
     exports: {},
     parent: null,
     filename: '/Users/zhangruiwu/Desktop/test/index.js',
     loaded: false,
     children: [],
     paths:
      [ '/Users/zhangruiwu/Desktop/test/node_modules',
        '/Users/zhangruiwu/Desktop/node_modules',
        '/Users/zhangruiwu/node_modules',
        '/Users/node_modules',
        '/node_modules' ] } }
Hello World!
{ '/Users/zhangruiwu/Desktop/test/index.js':
   Module { ... },
  '/Users/zhangruiwu/Desktop/test/hello.js':
   Module { ... }
}
➜  test
```
可以看到一开始，require.cache只有`index.js`本身，第一次require后就有了hello.js。
缓存的是Module对象，其中exports是模块输出的内容。第二次require的时候先去缓存中看一下，如果有的话取缓存，没有的话执行模块代码。所以我们需要清空一下缓存才会重新执行新的模块代码。

### 拆分js文件

有时候为了方便维护，会这么配置mock数据
``` javascript
// config.js
'GET XXXX': require('xxx.js')

// xxx.js
module.exports = function(req, res) { ... }
```
这样配置本质上是之前说的函数的方法，只是做了下代码拆分。但是修改`xxx.js`文件后就不会进行热更新了。而且随着项目越来越多，`config.js`也可能越来越大，这时候我们按模块拆分出来的js也不会进行热更新。

为了处理这种情况，我们 需要进一步获取配置文件引用了哪些js文件，监听他们的改动，更新配置。

#### 获取配置文件引用了哪些js文件

首先，如何获取配置文件引用了哪些js文件？观察上面输出的Module对象，发现有个children对，get:

``` javascript
const watchFiles = []

if (options.confFile) {
  watchFiles.push(options.confFile)
  function collectChildren (parent) {
    if (parent.length === 0) return
    parent.children.forEach(children => {
      // 过滤掉第三方依赖
      if (children.filename.includes('node_modules')) return
      watchFiles.push(children.filename)
      collectChildren(children)
    })
  }
  collectChildren(require.cache[options.confFile])
}
```
这是对于有配置文件的情况，如果配置直接传JSON数据的话就不能用这种方法了。所以增加了一个配置项`watchs`, 最终处理方案：

``` javascript
let watchFiles = []

if (options.confFile) {
  watchFiles.push(options.confFile)
  function collectChildren (parent) {
    if (parent.length === 0) return
    parent.children.forEach(children => {
      if (children.filename.includes('node_modules')) return
      watchFiles.push(children.filename)
      collectChildren(children)
    })
  }
  collectChildren(require.cache[options.confFile])
}

if (options.watchs) {
  options.watchs.forEach(filepath => {
    if (fs.statSync(filepath).isDirectory()) {
      watchFiles.push(...utils.files(filepath))
    } else {
      watchFiles.push(filepath)
    }
  })
}

watchFiles = [...new Set(watchFiles)]
```

#### 监听并更新配置

获取了需要监听的文件之后，就要开始监听改动了，一开始我是这么处理的：

``` javascript
// 监听mock配置文件改动，热更新API配置
watchFiles.length > 0 && utils.watch(watchFiles, (file) => {
  log.warning(`${file} changed!`)
  delete require.cache[file]
  handleConfig(options)
})
```
谁改动了清谁的缓存，看着没毛病，可是实际执行起来发现并没有实现热更新的效果。为啥呢？想了一下，虽然清了改动文件的缓存，但是入口的配置文件的缓存并没有清，执行handleConfig时，里面require了配置文件，还是走的缓存。所以改动文件的父文件都要清一下：

``` javascript
// 监听mock配置文件改动，热更新API配置
watchFiles.length > 0 && utils.watch(watchFiles, (file) => {
  log.warning(`${file} changed!`)
  let module = require.cache[file]
  if (options.confFile) {
    while (module.filename !== options.confFile) {
      delete require.cache[module.filename]
      module = module.parent
    }
  }
  delete require.cache[module.filename]
  handleConfig(options)
})
```
OK, MockServer的热更新机制就更加完善了！

npm地址：https://www.npmjs.com/package/cf-mock-server