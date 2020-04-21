---
title: "JavaScript 笔记"
tags: ["javascript"]
slug: javascript note
createDate: 1504627200000
---
### 1. 对象字面量解析
```javascript
({a: 1}.a)
({a: 1}).a
```
声明对象字面值时，语句开头不应该用{，因为js解释器会认为这是语句块（block）的开始。

### 2. 数字的点操作符
```javascript
(1).toString() // "1"
1..toString()
1 .toString()
```
js解释器会把数字后的.当做小数点而不是点操作符。

### 3.  连等赋值
```javascript
var a = {n: 1};
var b = a;
a.x = a = {n: 2};
console.log(a.x);// --> undefined
console.log(b.x);// --> {n:2}
```
[写了 10 年 Javascript 未必全了解的连续赋值运算](http://justjavac.com/javascript/2012/04/05/javascript-continuous-assignment-operator.html)
`a.x = a = {n:2} `后，b.x检测到了 a.x 指向的 `a = { n: 2 } `的引用，然后由于 a 重新赋值后，b 和 a的引用断裂了，所以 b 的值是 `{ n: 1, x: a }`, 赋值后的 a 已经没有 x 了， 所以 a.x 是 undefined。

### 4. 逗号操作符
```javascript
var x = 20;
var temp = {
    x: 40,
    foo: function() {
        var x = 10;
        return this.x;
    }
};
(temp.foo)(); // 40
(temp.foo, temp.foo)(); // 20，而不是40

var f = (function f(){ return "1"; }, function g(){ return 2; })();

typeof f; // "number"
```
逗号操作符会从左到右计算它的操作数，返回最后一个操作数的值。所以`(temp.foo, temp.foo)();`等价于`var fun = temp.foo; fun();，` fun调用时this指向window，所以返回20。

### 5.  parseInt传入数字
```javascript
parseInt(0.000008) // >> 0
parseInt(0.0000008) // >> 8
```
parseInt(arg)时会调用arg.toString()。
```javascript
(0.000008).toString() // "0.000008"
(0.0000008).toString() // "8e-7"
```

### 6. 利用给定接口获得闭包内部对象
```javascript
var o = (function() {
    var person = {
        name: 'Vincent',
        age: 24,
    };
    return {
        run: function(k) {
            return person[k];
        },
    }
}());
```
在不改变上面的代码情况下， 怎么得到原有的 person 对象？
```javascript
Object.defineProperty(Object.prototype, 'self', {
    get: function () {return this;},
    set: function (value) {return this},
    configurable: true
    // 该属性的存在是确保该属性可被delete方法删除
});

var person = o.run('self');
delete Object.prototype.self;
//由于不推荐使用prototype来扩展自己定义的属性（扩展标准规定的除外），这里把扩展再去掉。

// 其他思路
person = ["name", "age"].reduce(function(obj,k){ obj[k] = o.run(k); return obj }, {})
```
### 7. 位操作符
实现浮点数转整数，或者说取出数字的整数部分。比如-12.921 --> -12，12.921 --> 12等等。
```javascript
function convertToInt(num) {
      return num >> 0;
}
convertToInt(-Math.PI); // -3
convertToInt(12.921); // 12
```
有符号右移>>
[按位操作符
](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators)
### 8. Function.prototype.call/apply 的 this 问题
```javascript
function nsm() {console.log(this);}
nsm(); // Window{top: xxxx}
nsm.call(null/undefined); // Window{top: xxxx}
nsm.call(1); // Number {[[PrimitiveValue]]: 1}

function sm() {'use strict'; console.log(this);}
sm(); // undefined
sm.call(null); // null
sm.call(undefined); // undefined
sm.call(1); // 1
```
[Function.prototype.call()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
非严格模式下，this默认指向全局对象，call/apply显式指定this参数时也会强制转换参数为对象（如果不是对象）。其中，null/undefined被替换为全局对象，基础类型被转换为包装对象。

严格模式下，this默认为undefined，且call/apply显式指定this参数时也不会有强制转换。
### 9. 数组的展开/扁平
`[1,2,[2,3,[4,5]]]`--->`[1,2,2,3,4,5]`
```javascript
function flatten(arr) {
    if(!isArray(arr) || !arr.length) {
        return [];
    } else {
        return Array.prototype.concat.apply([], arr.map(function(val) {
            return isArray(val) ? flatten(val) : val;
        }));
    }

    function isArray(arr) {
        return Object.prototype.toString.call(arr).slice(8, -1).toLowerCase() === 'array';
    }
}
flatten([1,2,[2,3,[4,5]]]);
// [1, 2, 2, 3, 4, 5]
```
[Array.prototype.concat](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)
###  10. delete 操作符
```javascript
 (function(x){
    delete x;
    return x;
})(1);
// 返回 1
```
[delete](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/delete)
对局部变量和函数名delete是无效的，delete只能删除属性。delete obj.propName 才是合法的形式。下面以代码详细解释：
```javascript
// ========例1========
(function(x) {
    'use strict';
    delete x;
})(1);
// Uncaught SyntaxError: Delete of an unqualified identifier in strict mode.
// 在严格模式下，删除不合法的标识符x（x是变量）

// ========例2========
(function () {
    'use strict';
    var obj = {};
    Object.defineProperty(obj, 'x', {
        configurable: false,
        writable: true,
        enumerable: true,
        value: 'hi'
    });
    delete obj.x;
})()
// Uncaught TypeError: Cannot delete property 'x' of #<Object>
// 合法的删除形式，但属性x是non-configurable的，严格模式下报错

// ========例3========
window.x = 100;
window.y = 100;
(function(x) {
    console.log(x, window.x, window.y);
    console.log(delete x, delete y);
    console.log(x, window.x, window.y);
    return x;
})(1);
// 1 100 100
// false true
// 1 100 undefined

// delete x失败，因为x是变量（函数内局部变量x覆盖全局变量x），delete y成功，y是全局对象window的属性。
// 非严格模式下，可以 delete y 的写法，但此时是尝试删除全局对象的同名属性y（y在作用域中不是变量或函数名）。
```
###  11. 找出字符串中出现最多的字母
假设字符串'ababccdeajxac'，请找出出现次数最多的字符？

最先想到的解法是用map纪录每个字符的次数，然后找出最多的即可：
```javascript
function getMaxNumberOfChar(str) {
    return (str + '').split('').reduce(function(pre, cur, index, arr) {
        cur in pre ? pre[cur]++ : (pre[cur] = 1);
        pre[cur] > pre.value && (pre.char = cur, pre.value = pre[cur]);
        return pre;
    }, {value: 0});
}
getMaxNumberOfChar('ababccdeajxac') // Object {value: 4, a: 4, char: "a", b: 2, c: 3…}
```
此外，可以考虑用正则来辅助处理：
```javascript
function getMaxNumberOfChar(str) {
    return (str + '').split('').sort().join('').match(/(\w)\1*/g).reduce(function(pre, cur) {
        return cur.length > pre.value ? {value: cur.length, char: cur[0]} : pre;
    }, {value: 0})
}
getMaxNumberOfChar('ababccdeajxac') // Object {value: 4, char: "a"}
```
### 12.  storage event
当你用`localStorage`或`sessionStorage`的API去更改Storage时，会触发storage事件：
```javascript
window.addEventListener('storage', function(e) {
        console.log('storage', e);
});
```
这里没有什么特别的，但基本所有问题的根源，或者说要特别注意的是：本页面更改Storage只能在同域名的**其它**页面去捕获storage事件。

### 13. 一个函数柯里化问题及更多
要求实现sum函数如下：
```javascript
sum(1) // 1
sum(1)(2) // 3
sum(1)(2)(3) // 6
```

```javascript
function sum(item) {
    var cur = item;
    var inner = function(next) {
        if (next != null) cur += next;
        return inner;
    };
    inner.toString = function() {
        return cur;
    }
    return inner;
}
```
console.log(), 如果传入的是函数，则会调用toString()方法打印函数，这里改写了inner的toString函数，达到输出结果的目的

### 14. typeOf

```javascript
Object.prototype.toString.call(obj).slice(8, -1);
```
### 15.  `==`运算规则的图形化表示
[link](https://camo.githubusercontent.com/af251d0062891ec9d9ff4b9dc7886b4522c743d0/687474703a2f2f7777312e73696e61696d672e636e2f6c617267652f61363630636162326779316663796a666d776330336a323078733067796a7630)
```
前面说得很乱，根据我们得到的最终的图3，我们总结一下==运算的规则：

1. undefined == null，结果是true。且它俩与所有其他值比较的结果都是false。

2. String == Boolean，需要两个操作数同时转为Number。

3. String/Boolean == Number，需要String/Boolean转为Number。

4. Object == Primitive，需要Object转为Primitive(具体通过valueOf和toString方法)。

瞧见没有，一共只有4条规则！是不是很清晰、很简单。
```

原文:   [从'\[\]== ! \[\]'为true来剖析JavaScript各种蛋疼的类型转换](https://github.com/jawil/blog/issues/1)

### 16. 变量提升/预加载
```javascript
var foo = 1;
function bar() {
    if (!foo) {
        var foo = 10;
    }
    console.log(foo);
}
bar(); // 10

faz('faz'); // faz
if(true){
    function foo(x){
        console.log(x);
    }
}
if(false){
    function bar(x){
        console.log(x);
    }
}
function faz(x){
    console.log(x);
}
foo('foo'); // foo
bar('bar'); // Uncaught TypeError: bar is not a function
```
对于变量的定义，无论是否存在逻辑判断，JavaScript都会进行预解析，而对于函数声明，JavaScript并不会对逻辑判断中的进行预加载，只会对函数主体中暴露的进行预加载。

### 17. 预加载顺序
```javascript
console.log(x) // function
var x = 10;
console.log(x) //10
x = 20;
function x(){}
console.log(x) //20

(function(x,y){
    console.log(x); // ƒ x(){}
    console.log(y); //2
    var x = 10,y=20;
    function x(){}
    console.log(x); //10
    console.log(y);  //20
})(2,2)
```

		1. 函数的参数，如果有参数直接赋值
		2. 函数内部的函数声明，如果有则前置，如果函数名与参数重复则覆盖掉参数
		3. 函数内部的变量声明，如果有则前置，如果变量名与 函数声明重复 会忽略该变量声明，只是忽略声明 赋值语句仍有效

### 18. 查找数组中最大/小值
```javascript
var numbers = [5, 458 , 120 , -215 ];
console.log(Math.min.apply(null, numbers));
console.log(Math.max.apply(null, numbers));
```

### 19. 判断一个对象是不是数组
```javascript
function isArray(myArray) {
	return myArray.constructor.toString().indexOf("Array") > -1;
}
```
### 20. this
```javascript
var length = 10;
function fn() {
    console.log(this.length)
};
var obj = {
    length: 5,
    method: function (fn) {
        fn();
        arguments[0]();
        fn.call(obj, 12);
    }
};
obj.method(fn, 1); // 10 2 5
```
[一个小小的JavaScript题目](https://segmentfault.com/a/1190000007964935)

### 21. 运算符优先级问题
```javascript
var str = 'why I am ' + typeof + ''; // so what is str?
```
`str` 是 `why I am number`,  思考一下，上面的代码应该等同于`'why I am ' + (typeof (+ ''))`。
`typeof` 运算符优先级高于`+`，并且是`right-to-left`

### 22. Prefix Increment Operator(++)的问题
关于前自增运算符的一个有意思的问题：
```javascript
++'52'.split('')[0] //返回的是？
```
这道题来自[Another JavaScript quiz](http://www.zhangxinxu.com/wordpress/2013/05/%E7%90%86%E8%A7%A3another-javascript-quiz-%E9%A2%98%E7%9B%AE/)第8题，主要是优先级问题，应该返回6，看完答案应该没什么难理解的。但是，题目的某个注意点:
```javascript
++'5'
// Uncaught ReferenceError: Invalid left-hand side expression in prefix operation
```
却非常有意思。所以问题是为什么++'5'报错而++'52'.split('')[0]可以正确执行？

阅读[http://es5.github.io/#x11.4.4](http://es5.github.io/#x11.4.4)，可以看到_Prefix Increment Operator_操作的第5步PutValue(expr, newValue)要求expr是引用。

而在这里:

* `'5'`是值，不是引用，所以报错。
* `'52'.split('')[0]`返回的是`['5','2'][0]`，对象的属性访问返回的是引用，所以可以正确执行。

```javascript
var x = '5';
++x  // 6

++'5'[0] // 6
```

### 23. 异步的`throw`将不会被`Promise`捕获
我们知道，在`Promise`内部`throw`，`promise`将会变成`rejected`状态，并且通过`catch`可以捕获错误（也就是说，我们可以不用显示调用`reject`）。示例如下：
```javascript
const promise = new Promise((resolve, reject) => {
  // alternative: reject('hi')
  throw 'hi'
})
// 这里的 reason 就是 hi
promise.catch(reason => console.log(reason))
```
但请注意，异步的`throw`将不会被捕获到。
```javascript
function timeoutPromiseThrow(delay) {
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            throw ( "Timeout!" );
        }, delay );
    } );
}

const th = timeoutPromiseThrow(2000).catch((err) => { console.log("throw " + err); })
// th 将永远是 pending 状态。
```
解释：`promise`内部有类似`try{} catch...`的机制，但显然，异步的`throw`是无法被捕获的，异步请显式调用`reject`。

### 24. `JSON.parse` 的一个摸不着头脑的报错`Unexpected token o in JSON`
```javascript
JSON.parse(obj) // obj.toString() ---> "[object Object]"
```
[JSON语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON)
```javascript
JSON.parse('[1, "b"]')
// [1, "b"]
```

### 25. JavaScript 中参数是值传递还是引用传递？
[StackOverflow](https://stackoverflow.com/questions/518000/is-javascript-a-pass-by-reference-or-pass-by-value-language) :
JavaScript 既不是值传递，也不是引用传递，而是 call by sharing .

```javascript
function changeStuff(a, b, c)
{
  a = a * 10;
  b.item = "changed";
  c = {item: "changed"};
}

var num = 10;
var obj1 = {item: "unchanged"};
var obj2 = {item: "unchanged"};

changeStuff(num, obj1, obj2);

console.log(num);   // 10
console.log(obj1.item);    // changed
console.log(obj2.item);    // unchanged
```

```
	1. 传值：参数指向新内存（新内存复制了值），操作参数和原来的变量（指向的内存）没有半毛钱的关系。
	2. 传引用：参数指向同一份内存（没有复制值），操作参数即操作原来的变量（指向的内存）。
	3. call by sharing：参数指向新内存，但新内存复制了原来的内存地址，直接赋值的话相当于覆盖了新内存的内容，不会影响原来的变量；但是改变对象的属性其实还是操作了原来的对象。
```
Java 中传参数的本质是赋值操作，primitive 就是本身的值，object 就是内存地址。

以上问题来自于[JavaScript问题集锦](https://github.com/creeperyang/blog/issues/2), 以及看的时候查阅的其他资料

### 26. JavaScript的操作符优先级,从高到低排序
[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)

### 27.  [一道颇有难度的JavaScript题](https://segmentfault.com/a/1190000007979730)
```javascript
function Foo() {
    getName = function () {
        console.log('1');
    };
    return this;
}
Foo.getName = function () {
    console.log('2');
};
Foo.prototype.getName = function () {
    console.log('3');
};
var getName = function () {
    console.log('4');
};
function getName() {
    console.log(5);
}

Foo.getName();  // 2
getName();    // 4
Foo().getName(); // 1
getName();  // 1
new Foo.getName(); // 2
new Foo().getName();   // 3
new new Foo().getName();   // 3
```
new 优先级？

### 28. 实现 `Function.prototype.bind()`
```javascript
function test(num1, num2) {
    this.num1 = num1;
    this.num2 = num2;
}

obj = {}
test1 = test.bind(obj, 456)
test1(123)
obj.num1 // 456
obj.num2 // 123
```

```javascript
Function.prototype.bind = function(){
    var fn = this;
    var args = Array.prototype.slice.call(arguments);
    var context = args.shift();

    return function(){
        return fn.apply(context,
            args.concat(Array.prototype.slice.call(arguments)));
    };
};
```
[Function.prototype.apply()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
[Function.prototype.bind()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

### 29. 函数节流和函数防抖

```javascript
// 简单的节流函数
//fun 要执行的函数
//delay 延迟
//time  在time时间内必须执行一次
function throttle(fun, delay, time) {
    var timeout,
        startTime = new Date();
    return function() {
        var context = this,
            args = arguments,
            curTime = new Date();
        clearTimeout(timeout);
        // 如果达到了规定的触发时间间隔，触发 handler
        if (curTime - startTime >= time) {
            fun.apply(context, args);
            startTime = curTime;
            // 没达到触发间隔，重新设定定时器
        } else {
            timeout = setTimeout(function(){
	            fun.apply(context, args);
            }, delay);
        }
    };
};
```

```javascript
// 简单的防抖函数
function debounce(fn, delay) {
  // 持久化一个定时器 timer
  let timer = null;
  // 闭包函数可以访问 timer
  return function() {
    // 通过 'this' 和 'arguments'
    // 获得函数的作用域和参数
    let context = this;
    let args = arguments;
    // 如果事件被触发，清除 timer 并重新开始计时
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  }
}
```
[浅谈 Underscore.js 中 _.throttle 和 _.debounce 的差异](https://blog.coding.net/blog/the-difference-between-throttle-and-debounce-in-underscorejs)


### 30.  懒加载 lazyload
```javascript
<script>
    var num = document.getElementsByTagName('img').length;
    var img = document.getElementsByTagName("img");
    var n = 0; //存储图片加载到的位置，避免每次都从第一张图片开始遍历
    lazyload(); //页面载入完毕加载可是区域内的图片
    window.onscroll = lazyload;
    function lazyload() { //监听页面滚动事件
        var seeHeight = document.documentElement.clientHeight; //可见区域高度
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop; //滚动条距离顶部高度
        for (var i = n; i < num; i++) {
            if (img[i].offsetTop < seeHeight + scrollTop) {
                if (img[i].getAttribute("src") == "default.jpg") {
                    img[i].src = img[i].getAttribute("data-src");
                }
                n = i + 1;
            }
        }
    }
</script>
```

使用节流函数进行性能优化

```javascript
// 简单的节流函数
//fun 要执行的函数
//delay 延迟
//time  在time时间内必须执行一次
function throttle(fun, delay, time) {
    var timeout,
        startTime = new Date();
    return function() {
        var context = this,
            args = arguments,
            curTime = new Date();
        clearTimeout(timeout);
        // 如果达到了规定的触发时间间隔，触发 handler
        if (curTime - startTime >= time) {
            fun.apply(context, args);
            startTime = curTime;
            // 没达到触发间隔，重新设定定时器
        } else {
            timeout = setTimeout(function(){
	            fun.apply(context, args);
            }, delay);
        }
    };
};
// 实际想绑定在 scroll 事件上的 handler
function lazyload(event) {}
// 采用了节流函数
window.addEventListener('scroll',throttle(lazyload,500,1000));
```

使用去抖函数进行性能优化

```javascript
// debounce函数用来包裹我们的事件
function debounce(fn, delay) {
  // 持久化一个定时器 timer
  let timer = null;
  // 闭包函数可以访问 timer
  return function() {
    // 通过 'this' 和 'arguments'
    // 获得函数的作用域和参数
    let context = this;
    let args = arguments;
    // 如果事件被触发，清除 timer 并重新开始计时
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  }
}
// 实际想绑定在 scroll 事件上的 handler
function lazyload(event) {}
// 采用了去抖函数
window.addEventListener('scroll',throttle(lazyload,500));
```

[实现图片懒加载(lazyload)](https://i.jakeyu.top//2016/11/26/%E5%AE%9E%E7%8E%B0%E5%9B%BE%E7%89%87%E6%87%92%E5%8A%A0%E8%BD%BD/)

### 31. new 操作符都做了什么？
```
1. 创建一个新的对象
2. 将构造函数的this指向这个新对象
3. 执行构造函数的代码，为这个对象添加属性，方法等
4. 返回新对象
```

### 32. 原生Ajax
```javascript
if(window.ActiveXObject){
    xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
}else if(window.XMLHttpRequest)
    xmlHttp=new XMLHttpRequest();
}

var xhr = new XMLHttpRequest()
xhr.onreadystatechange = function () {
  switch (xhr.readyState) {
    case 0:
      console.log('未初始化, 尚未调用open()');
      break;
    case 1:
      console.log('启动, 已调用open(), 未调用send()');
      break;
    case 2:
      console.log('发送, 已调用send(), 为未收到响应');
      break;
    case 3:
      console.log('接受, 已接受到部分数据');
      break;
    case 4:
      console.log('完成, 已接受全部数据');
      break;
    default:
      break;
  }
}
// xhr.onload = function(e) {
//  var res = e.target.response.message
// }
// xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
// xhr.responseType = 'json';
// 避免缓存： url+时间戳
xhr.open('GET', URL);
xhr.send(null);

httpRequest.open('POST', url);
httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
httpRequest.send('userName=' + encodeURIComponent(userName));
```
[脱离jQuery，使用原生Ajax](https://segmentfault.com/a/1190000004100271)
### 33. 封装一个轮播图组件
```
(function( $ ) {
    $.fn.initCarousel = function() {
      console.log(this.data('target'));
      var self = this,
          target = $(this.data('target')),
          elementName = this.data('element'),
          elements = target.find(elementName),
          time = null,
          timeNav = null,
          curImg = null,
          curIndex = 1,
          init = function() {
            console.log(elements);
            curImg = $(target.find(elementName + '.cur')[0]);
            self.find('li').removeClass('hover');
            self.find('li').eq(curIndex).addClass('hover');
            curImg.fadeOut(10, function() {
              curImg.removeClass('cur');
              elements.eq(curIndex - 1).addClass('cur').fadeIn(500)
            });
            curIndex++;
            curIndex = curIndex == elements.length ? 0 : curIndex++;
            time = setTimeout(init, 3000)
          };
      time = setTimeout(init, 3000);
      this.find('li').bind('mouseenter', function(e) {
        curIndex = $(this).index();
        console.log(curIndex);
        console.log(this)
        self.find("li").removeClass("hover");
        clearTimeout(time);
        clearTimeout(timeNav);
        timeNav = setTimeout(function() {
          elements.hide();
          elements.removeClass('cur');
          elements.eq(curIndex - 1).addClass('cur').show()
        }, 200)
        $(this).addClass('hover');
        curIndex = curIndex == elements.length ? 0 : curIndex + 1;
        time = setTimeout(init, 3000)
      })
    };
})( jQuery );
$('.slide').initCarousel();
```
### 34. 输入某二叉树的前序遍历和中序遍历的结果，请重建出该二叉树。假设输入的前序遍历和中序遍历的结果中都不含重复的数字。例如输入前序遍历序列{1,2,4,7,3,5,6,8}和中序遍历序列{4,7,2,1,5,3,8,6}，则重建二叉树并返回。

```javascript
作者：faremax
链接：https://www.nowcoder.com/discuss/49349
来源：牛客网

/* function TreeNode(x) {
    this.val = x;
    this.left = null;
    this.right = null;
} */
function reConstructBinaryTree(pre, vin){
    if(pre.length == 0 || vin.length == 0){
        return null;
    };
    var index = vin.indexOf(pre[0]);
    var left = vin.slice(0,index);
    var right = vin.slice(index+1);
    var node = new TreeNode(vin[index]);
    node.left = reConstructBinaryTree(pre.slice(1,index+1),left);
    node.right = reConstructBinaryTree(pre.slice(index+1),right);
    return node;
}
```
### 35. 用两个栈来实现一个队列，完成队列的Push和Pop操作。 队列中的元素为int类型。

```javascript
作者：faremax
链接：https://www.nowcoder.com/discuss/49349
来源：牛客网

var stack1 = [];
var stack2 = [];
function push(node){
    stack1.push(node);
}
function pop(){
    var temp = stack1.pop();
    while(temp){
        stack2.push(temp);
        temp = stack1.pop();
    }
    var result = stack2.pop();
    temp = stack2.pop();
    while(temp){
        stack1.push(temp);
        temp = stack2.pop();
    }
    return result;
}
```

### 36. 大家都知道斐波那契数列，现在要求输入一个整数n，请你输出斐波那契数列的第n项。n<=39

```javascript
作者：faremax
链接：https://www.nowcoder.com/discuss/49349
来源：牛客网

function Fibonacci(n){
    var a = 1, b = 1, temp;
    if(n <= 0) return 0;
    for(var i = 2; i <= n; i++){
      temp = b;
      b = a + b;
      a = temp;
    }
    return a;
}
```

### 37. 一只青蛙一次可以跳上1级台阶，也可以跳上2级。求该青蛙跳上一个n级的台阶总共有多少种跳法。

我们可以用21的小矩形横着或者竖着去覆盖更大的矩形。请问用n个21的小矩形无重叠地覆盖一个2*n的大矩形，总共有多少种方法？

```javascript
作者：faremax
链接：https://www.nowcoder.com/discuss/49349
来源：牛客网

function jumpFloor(number){
    if(number < 1){
        return 0;
    }
    if(number === 1){
        return 1;
    }
    if(number === 2){
        return 2;
    }
    var temp = 0, a = 1, b = 2;
    for(var i = 3; i <= number; i++){
        temp = a + b;
        a = b;
        b = temp;
    }
    return temp;
}
```

### 38. 一只青蛙一次可以跳上1级台阶，也可以跳上2级……它也可以跳上n级。求该青蛙跳上一个n级的台阶总共有多少种跳法。

```javascript
function jumpFloorII(number){
	return Math.pow(2, number - 1);
}
```
### 39. 输入一个整数，输出该数二进制表示中1的个数。其中负数用补码表示。
```javascript
作者：faremax
链接：https://www.nowcoder.com/discuss/49349
来源：牛客网

function NumberOf1(n){
    if(n < 0){
        n = n >>> 0;
    }
    var arr = n.toString(2).split('');
    return arr.reduce(function(a,b){
        return b === "1" ? a + 1 : a;
    },0);
}
```

### 40. 输入一个整数数组，实现一个函数来调整该数组中数字的顺序，使得所有的奇数位于数组的前半部分，所有的偶数位于位于数组的后半部分，并保证奇数和奇数，偶数和偶数之间的相对位置不变。
```javascript
作者：faremax
链接：https://www.nowcoder.com/discuss/49349
来源：牛客网

function reOrderArray(array){
    var result = [];
    var even = [];
    array.forEach(function(item){
        if((item & 1) === 1){
            result.push(item);
        } else {
            even.push(item);
        }
    });
    return result.concat(even);
}
```

### 41.
```javascript
ar a = {};
var b = {key: 'b'};
var c = {key: 'c'};
a[b] = 123, a[c] = 456;
console.log(a[b]); // 456
```
### 42.
```javascript
(function(x){
	return (function(y){
		console.log(x);
	})(2);
})(1) // 1
```

### 43.
```javascript
for(var i=0;i<5;i++){
	setTimeout((function(i){console.log(i)})(i),i*1000);
}
// 0 1 2 3 4
```


### 文章：
1. [JavaScript 原型理解与创建对象应用](http://yujiangshui.com/javascript-prototype-and-create-object/)
2. [闭包 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
3. [ECMAScript5.1中文版](http://yanhaijing.com/es5/)
4. [前端基础进阶系列](http://www.jianshu.com/p/cd3fee40ef59)