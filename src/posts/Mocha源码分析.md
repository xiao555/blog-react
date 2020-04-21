---
title: "Mocha源码分析"
tags: ["mocha"]
slug: Mocha source code analysis
createDate: 1509552000000
---
## 一、分析目标

分析前端单元测试工具 Mocha, 了解它是怎么进行TDD和BDD的。

--intro--

## 二、测试与Mocha入门简介

### 1. 测试的概念

#### 1.1 单元测试

单元测试（unit testing），是指对软件中的最小可测试单元进行检查和验证。

* 在一些传统的结构化编程语言中，例如C，要进行测试的单元一般是函数或子过程。
* 在面向对象的语言中，要进行测试基本单元是类。

#### 1.2 断言

断言表示一些布尔表达式，在编写代码的时候，我们总是会作出一些假设，断言就是用于代码中捕捉这些假设。

在单元测试中，我们经常使用断言来验证我们的代码是否正常运行。断言可以有两种形式

```javascript
assert Expresstion1
assert Expresstion1:Expresstion2
```

其中Expression1应该总是一个布尔值，Expression2是断言失败时，输出的失败消息的字符串。

#### 1.3 TDD

测试驱动开发是敏捷开发中的一项核心实践和技术，也是一种设计方法论。TDD的原理是在开发功能代码之前，先编写单元测试用例代码，测试代码确定需要编写什么产品代码。TDD的基本思路就是通过测试来推动整个开发的进行，但测试驱动开发并不只是单纯的测试工作，而是把需求分析，设计，质量控制量化的过程。TDD首先考虑使用需求（对象、功能、过程、接口等），主要是编写测试用例框架对功能的过程和接口进行设计，而测试框架可以持续进行验证。

#### 1.4 BDD

行为驱动开发是一种敏捷软件开发的技术，它鼓励软件项目中的开发者、  QA和非技术人员或商业参与者之间的协作。主要是从用户的需求出发，强调系统行为。BDD最初是由Dan North在2003年命名，它包括验收测试和客户测试驱动等的极限编程的实践，作为对测试驱动开发的回应。

### 2. mocha简介

Mocha.js是被广泛使用的Javascript测试框架，在浏览器和Node环境都可以使用。Mocha提供TDD和BDD的测试接口。

Mocha提供了
*	断言单元测试，可以进行功能性测试
*	同步代码测试
*	异步代码测试

#### 2.1 断言

在Mocha中运行你使用任何断言库来进行代码的测试，其中有

| 库 			 		| 描述 																		|
| :-------------- 	| :--------------------------------------------------------  |
| should.js 		| BDD风格的测试接口 											|
| expect.js 		| expect()风格的断言 												|
| chai 		 		| 提供expect(),assert()和should这几种风格的断言 |
| better-assert 	| C语言风格的断言 													|
| unexpected 	| BDD断言的扩展 													|

当然，我们可以用Nodejs内建的assert模块来进行断言。

```javascript
describe("测试数组", function(){
    it("测试indexOf()", function(){
        assert.equal(-1, [1,2,3].indexOf(4));
    });
});
```

#### 2.2 TDD测试接口

TDD测试风格的接口：

*	suite: 定义一组测试用例（也可以是一个，可以嵌套）
*	suiteSetup: 此方法会在这个suite所有测试用例执行前，执行有且只有一次。
*	setup: 此方法会在每个测试用例执行前都执行一遍。
*	test: 具体执行的测试用例实现代码。
*	teardown: 此方法会在这个suite所有测试用例执行后都执行一次，与setup相反
*	suiteTeardown: 此方法会在这个suite所有测试用例执行后执行一次，与suiteTeardown相反。

#### 2.3 BDD测试接口

BDD测试风格的接口

*	describe(): 描述场景，在里面可以设定Context，可包括多个测试用例，也可以嵌套场景
*	it(): 位于场景内，描述测试用例
*	before(): 所有测试用例的统一前置动作
*	after(): 所有测试用例的统一后置动作
*	beforeEach(): 每个测试用例的前置动作
*	aferEach(): 每个测试用例的后置动作

#### 2.4 Mocha支持的特性

1. 异步测试
Mocha默认每个测试用例最多2000ms，如果到时没有得到结果，就会报错，对于涉及异步操作的测试用例，我们需要用-t或--timeout参数指定超时门槛。
2. 测试用例管理
在大型项目中，会有很多的测试用例，我们可以通过几个方法来进行管理
	+ only: 表示只运行某个测试套件或测试用例
	+ skip: 表示跳过指定的测试套件或测试用例

### 三、Mocha的使用

首先，mocha的默认模式是BDD，我们以BDD为例看一下mocha是怎么运行的：
这个是要测试的源文件，传入两个数字，返回和

```javascript
// add.js
export default (a, b) => a + b;
这个是测试的文件，用了chai这个断言库，expect(add(1, 1)).to.be.equal(2) 是断言部分
// test.js
import add from "./add"
import { expect } from "chai"

describe('Test Start',() => {
    describe('加法函数测试',() => {
        it('1 + 1 等于 2', () => expect(add(1, 1)).to.be.equal(2))
        it('返回值是Number',() => expect(add(1, 1)).to.be.a('number'))
    })
})
```

因为用了ES6的语法，需要babel转一下

```javascript
// index.js
require("babel-register")({
    presets: [
        "es2015",
        "stage-0"
    ],
    plugins: ["transform-async-to-generator","transform-runtime"]
});

require('./test');
```

命令行运行结果：

![](https://xiao555.netlify.com/mocha-1.png)

### 四、分析实现

#### 1. Command-line interfaces

首先，Mocha的命令行接口是用 [commander](https://github.com/tj/commander.js/) 写的，在`/bin/_mocha`文件中可以看到。默认ui是bdd，默认文件是test/*

```javascript
// bin/_mocha
program
  ...
  .option('-u, --ui <name>', 'specify user-interface (' + interfaceNames.join('|') + ')', 'bdd')
...
var args = program.args;
// default files to test/*.{js,coffee}
if (!args.length) {
  args.push('test');
}
args.forEach(function (arg) {
  var newFiles;
  try {
    newFiles = utils.lookupFiles(arg, extensions, program.recursive);
  } catch (err) {
    ...
  }

  files = files.concat(newFiles);
});
...
mocha.files = files;
runner = mocha.run(program.exit ? exit : exitLater);
...
```

#### 2. Mocha run entrypoint

```javascript
// lib/mocha.js
Mocha.prototype.run = function (fn) {
  if (this.files.length) {
    this.loadFiles();
  }

  ...
  return runner.run(done);
};
```

其中`loadFiles`是用来加载文件的，我们看一下他的源码：

```javascript
// lib/mocha.j
Mocha.prototype.loadFiles = function (fn) {
  var self = this;
  var suite = this.suite;
  this.files.forEach(function (file) {
    file = path.resolve(file);
    suite.emit('pre-require', global, file, self);
    suite.emit('require', require(file), file, self);
    suite.emit('post-require', global, file, self);
  });
  fn && fn();
};
```

这里通过`emit`触发了`pre-require`事件，那么`pre-require`事件在哪呢？

#### 3. BDD Interfaces

```javascript
// lib/interfaces/bdd.js
suite.on('pre-require', function (context, file, mocha) {
  var common = require('./common')(suites, context, mocha);

  context.before = common.before;
  context.after = common.after;
  context.beforeEach = common.beforeEach;
  context.afterEach = common.afterEach;
  context.run = mocha.options.delay && common.runWithSuite(suite);
  /**
   * Describe a "suite" with the given `title`
   * and callback `fn` containing nested suites
   * and/or tests.
   */

  context.describe = context.context = function (title, fn) {
    ...
  };
  ...
  context.it = context.specify = function (title, fn) {
    ...
  };
});
```

其中`context`是`emit`时候传入的`global`对象，这段代码给`global`定义了一些属性，比如BDD模式的例子里的`describe` 和 `it `，传入的参数都是是`title + fn`。所以`bdd.js`这个文件的作用就是给全局对象注册`bdd`需要的一些接口。

#### 4. Reporter 报告格式

Mocha.run 最后执行的是runner.run(), 那我们继续分析Runner

```javascript
// lib/runner.js
Runner.prototype.run = function (fn) {
  ...
  function start () {
    self.started = true;
    self.emit('start');
    self.runSuite(rootSuite, function () {
      debug('finished running');
      self.emit('end');
    });
  }

  debug('start');
  ...
  return this;
};
```

这里，`emit` 触发 `start`事件，这个具体的处理在哪呢，我们全局搜索一下，发现在`lib/reporters/ `下的每个文件基本都有`on start`事件，到底实际是触发的哪一个呢？我们继续分析一下，在Mocha目录下发现这么一段：

```javascript
// lib/mocha.js
/**
 * Set reporter to `reporter`, defaults to "spec".
 * ...
 */
Mocha.prototype.reporter = function (reporter, reporterOptions) {
    ...
    reporter = reporter || 'spec';
    ...
};
```

所以默认的报告格式是`spec`，我们去 `lib/reporters/spec.js` 看一看：

```javascript
// lib/reporters/spec.js
function Spec (runner) {
  ...
  runner.on('start', function () {
    console.log();
  });
  runner.on('suite', function (suite) {
    ++indents;
    console.log(color('suite', '%s%s'), indent(), suite.title);
  });
  ...
  runner.on('pass', function (test) {
    var fmt;
    if (test.speed === 'fast') {
      fmt = indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s');
      console.log(fmt, test.title);
    } else {
      fmt = indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s') +
        color(test.speed, ' (%dms)');
      console.log(fmt, test.title, test.duration);
    }
  });

  runner.on('fail', function (test) {
    console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);
  });

  runner.on('end', self.epilogue.bind(self));
}
```

可以看到这里是响应一些事件的处理，回到Runner

```javascript
// lib/runner.js
Runner.prototype.run = function (fn) {
  ...
  function start () {
    self.started = true;
    self.emit('start');
    self.runSuite(rootSuite, function () {
      debug('finished running');
      self.emit('end');
    });
  }

  debug('start');
  ...
  return this;
};
```

这样`start`对应的就是`lib/reporters/spec.js`里的 `console.log();` 输出空行。我们继续往下走`runSuite`。

#### 5. RunSuite and RunTest

```javascript
// lib/runner.js
Runner.prototype.runSuite = function (suite, fn) {
  ...
  function next (errSuite) {
  ...
  if (self._grep !== self._defaultGrep) {
    Runner.immediately(function () {
      self.runSuite(curr, next);
    });
  } else {
    self.runSuite(curr, next);
  }
}

  function done (errSuite) {
      ...
      self.hook('afterAll', function () {
        self.emit('suite end', suite);
        fn(errSuite);
      });
    }
  }
  ...
  this.hook('beforeAll', function (err) {
    if (err) {
      return done();
    }
    self.runTests(suite, next);
  });
};
```

基本上是开始测试之前的准备,next作为回调函数不断执行下一个suite，我们再继续看看`runTests`：

```javascript
// lib/runner.js
Runner.prototype.runTests = function (suite, fn) {
  ...
  function next (err, errSuite) {
...
    // next test
    test = tests.shift();
...

    self.hookDown('beforeEach', function (err, errSuite) {
      self.currentRunnable = self.test;
      self.runTest(function (err) {
        ...
        self.emit('pass', test);
        self.emit('test end', test);
        self.hookUp('afterEach', next);
      });
    });
  }
  ...
  next();
};
```

这里是不断调用next，执行runTest，回调函数里触发了pass和test end事件，我们继续看`runTest`：

```javascript
// lib/runner.js
Runner.prototype.runTest = function (fn) {
  ...
  try {
    test.on('error', function (err) {
      self.fail(test, err);
    });
    test.run(fn);
  } catch (err) {
    fn(err);
  }
};
```

终于到了runTest了，可以看到test运行在try catch中，如果抛出错误，捕获错误并传入回调函数。如果成功呢？我们需要知道test.run是个啥东西。

#### 6. Suite and Test

上面的过程中，不断提到`Suite`和`Test`，这两个东西到底是指啥呢？找源码太麻烦了，我们直接命令行输出一下看看，首先是`suite`：我在`runSuite`函数下`console.log`输出了一下`Suite`，结果是:

```javascript
Suite {
    title: '',
        ctx: {},
    suites:
        [ Suite {
            title: 'Test Start',
            ctx: {},
            suites: [Object],
            tests: [],
            ...
            file: '/Users/zhangruiwu/Desktop/demo-learn/newBlog/server/test-example/index.js' } ],
            tests: [],
        ...

Suite {
    title: 'Test Start',
        ctx: {},
    suites:
        [ Suite {
            title: '加法函数测试',
            ctx: {},
            suites: [],
            tests: [Object],
            ...
Test Start
```

可以发现`suite`就是`describe` 生成的对象，我们测试文件中一共两个`describe`，`Test Start`和`加法函数测试`，两者是嵌套关系，在这里也体现出来了。我们继续分析Test：
把`runSuite` 加的`console.log(suite)` 改成`console.log(suite.suites[0])`,结果是:

```javascript
Suite {
    title: '加法函数测试',
        ctx: {},
    suites: [],
        tests:
    [ {
        "title": "1 + 1 等于 2",
        "body": "function () {\n            return (0, _chai.expect)((0, _add2.default)(1, 1)).to.be.equal(2);\n        }",
        ...
    },
      {
        "title": "返回值是Number",
        "body": "function () {\n            return (0, _chai.expect)((0, _add2.default)(1, 1)).to.be.a('number');\n        }",
        ...
      } ],
  ...
```

可以发现`Test`就是`it`生成的对象。`Suite` 和 `Test `对应的文件是 `lib/suite.js`和 `lib/test.js`。我们找一下`test.run` ，`test.js` 里有这么一行

```javascript
// lib/test.js
/**
 * Inherit from `Runnable.prototype`.
 */
Test.prototype = create(Runnable.prototype, {
  constructor: Test
});
```

我们再去Runnable看看：

```javascript
// lib/runnable.js
Runnable.prototype.run = function (fn) {
  ...
  // finished
  function done (err) {
    ...
fn(err);
  }
  ...
  done();
  ...
  };
```

很长我就直接贴最后的代码了。可以看到最后执行回调, 回调的内容在`runTests`里

#### 7. End

```javascript
// lib/runner.js
self.runTest(function (err) {
  ...
  self.emit('pass', test);
  self.emit('test end', test);
  self.hookUp('afterEach', next);
});
```

pass事件在`lib/reporters/spec.js`中：

```javascript
// lib/reporters/spec.js
runner.on('pass', function (test) {
  ...
    fmt = indent() +
      color('checkmark', '  ' + Base.symbols.ok) +
      color('pass', ' %s');
    console.log(fmt, test.title);
  ...
});
```

其中`Base.symbols.ok` 代表通过时候显示的对号

```javascript
// lib/reporters/base.js
exports.symbols = {
  ok: '✓',
  ...
};
```

`test end `在`lib/reporters/base.js `中：

```javascript
// lib/reporters/base.js
runner.on('test end', function () {
  stats.tests = stats.tests || 0;
  stats.tests++;
});
```

是用来统计`test`个数的。回到`Runner`

```javascript
// lib/runner.js
Runner.prototype.run = function (fn) {
  ...
  function start () {
    self.started = true;
    self.emit('start');
    self.runSuite(rootSuite, function () {
      debug('finished running');
      self.emit('end');
    });
  }

  debug('start');
  ...
  return this;
};
```

发现runSuite的回调最终触发了end事件，在`lib/reporters/spec.js`中：

```javascript
// lib/reporters/spec.js
runner.on('end', self.epilogue.bind(self));
self.epiloque在lib/reporters/base.js 中：
// lib/reporters/base.js
Base.prototype.epilogue = function () {
  ...
  // passes
  fmt = color('bright pass', ' ') +
    color('green', ' %d passing') +
    color('light', ' (%s)');

  console.log(fmt,
    stats.passes || 0,
    ms(stats.duration));
  ...
  console.log();
};
```

这就是最终输出的 `2 passing (71ms)` 了。

到这里我们的以例子做的分析结束，但是Mocha远远不止这些功能，篇幅所限更多的我们就不分析了。整体上看很复杂的面向对象编程，但是结构很清晰，功能划分明确，值得我们学习
