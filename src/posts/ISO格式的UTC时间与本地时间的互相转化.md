---
title: "ISO格式的UTC时间与本地时间的互相转化"
tags: ["iso", "utc"]
slug: Conversion between UTC time and local time in ISO format
createDate: 1514822400000
---
最近遇到了这样一个需求，将后端传过来的ISO格式的UTC时间转换成ISO格式的本地时间。

--intro--

## UTC 和 ISO

首先，我们先了解一下什么是UTC时间，什么是ISO格式。

> 协调世界时（英语：Coordinated Universal Time，法语：Temps Universel Coordonné，简称UTC）是最主要的世界时间标准，其以原子时秒长为基础，在时刻上尽量接近于格林尼治标准时间。                              —— [维基百科](https://zh.wikipedia.org/wiki/%E5%8D%8F%E8%B0%83%E4%B8%96%E7%95%8C%E6%97%B6)

整个地球分为二十四时区，每个时区都有自己的本地时间，同一时刻每个时区的时间都不一样，所以就用UTC来统一标准的。

> 国际标准ISO 8601，是国际标准化组织的日期和时间的表示方法，全称为《数据存储和交换形式·信息交换·日期和时间的表示方法》。目前是第三版“ISO8601:2004”以替代第一版“ISO8601:1988”与第二版“ISO8601:2000”。   —— [维基百科](https://zh.wikipedia.org/wiki/ISO_8601)

当前的UTC时间是2018-01-02T06:29Z（ISO 8601 表示法。）其中Z是4位数字格式的时间偏移量，不写的时候默认不偏移。

## UTC时间转本地时间
### 第一种方法

我们可以在控制台中看一下：
``` javascript
new Date()
Tue Jan 02 2018 16:42:02 GMT+0800 (CST)

new Date('2018-01-02T00:00')
Tue Jan 02 2018 00:00:00 GMT+0800 (CST)

new Date('2018-01-02T00:00+0800')
Tue Jan 02 2018 00:00:00 GMT+0800 (CST)

new Date('2018-01-02T00:00-0800')
Tue Jan 02 2018 16:00:00 GMT+0800 (CST)

new Date('2018-01-02T00:00+0000')
Tue Jan 02 2018 08:00:00 GMT+0800 (CST)
```
可以看到, `new Date()`返回的是当前本地时间。`new Date('2018-01-02T00:00')` 传入的是ISO格式的字符串，但是没有加偏移量，可以看到结果本地时间跟传入的时间一致，但是上面说**其中Z是4位数字格式的时间偏移量，不写的时候默认不偏移**， 转化成本地时间不应该是`Tue Jan 02 2018 08:00:00 GMT+0800 (CST)`吗？

原来`new Date()`对传入的字符串调用`Date.parse()`来解析, 如果没有指定时区，默认使用本地时区。

> parse 方法接受一个表示时间的字符串，返回相应的时间值。该方法可以接受符合 RFC2822 / IETF 日期语法 (RFC2822 Section 3.3) 的字符串，如 "Mon, 25 Dec 1995 13:30:00 GMT"。该方法能够理解美国大陆时区的缩写，但是为了更通用，应该使用时区偏移，如 "Mon, 25 Dec 1995 13:30:00 +0430" （格林威治的子午线向东偏移4小时30分钟）。如果没有指定时区，默认使用本地时区。—— [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date/parse)

后面例子中`+0800`，`-0800`，`+0000` 就更好理解了。

所以， UTC 时间与 本地时间的关系就是：
``` javascript
UTC + 时区差 = 本地时间
```
于是，我们只需要知道时区差就可以转换时间了, 可以利用`Date.prototype.getTimezoneOffset()`:

> 时区偏差（time-zone offset）表示协调世界时（UTC）与本地时区之间的差值，单位为分钟。需要注意的是如果本地时区晚于协调世界时，则该差值为正值，如果早于协调世界时则为负值。 --[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset)
``` javascript
var x = new Date();
var currentTimeZoneOffsetInHours = x.getTimezoneOffset() / 60;
```
然后进行简单的加减即可，不过要注意晚于UTC是正，早是负。

### 第二种方法

然而这样就结束了吗？ No，还有更简单的方法。

从上面的例子中我们还可以看到， `new Date()`返回的都是本地时间，所以我们看一下`Date.prototype.toString()`:
> Return an implementation-dependent String value that represents tv as a date and time in the current time zone using a convenient, human-readable form.  --[Standard ECMA-262](http://www.ecma-international.org/ecma-262/6.0/#sec-date.prototype.tostring)

可以看到toString返回的时间就是基于系统当前所在时区的，即本地时间，所以直接调用toString即可转化为本地时间:
``` javascript
let value = '2018-01-02T00:00+0000'
new Date(value).toString()
```
然后再将得到的时间字符串解析成ISO格式：
```javascript
/**
 * 把 JS datetime 值转为指定日期时间格式
 * @param  {string} value - Js datetime string
 * @return {string} - ISO Dates YYYY-MM-DDTHH:mm:ss
 */
export function getISOdatetime (value) {
  var tmpStr = new Date(value),
    year = tmpStr.getFullYear(),
    month = pad(tmpStr.getMonth() + 1), // 月份取值0-11
    date = pad(tmpStr.getDate()),
    hour = pad(tmpStr.getHours()),
    minute = pad(tmpStr.getMinutes()),
    second = pad(tmpStr.getSeconds())

  return `${year}-${month}-${date}T${hour}:${minute}:${second}`
}

/**
 * 把 UTC时间 转换成 本地时间
 * @param  {string} value - UTC datetime string
 * @return {string} - ISO Dates YYYY-MM-DDTHH:mm:ss
 */
export function getLocalISODatetime (value) {
  return getISOdatetime(new Date(value).toString())
}
```
## 本地时间转UTC时间
那本地时间转换成UTC时间也很简单：
```
new Date() //Wed Jan 24 2018 11:06:29 GMT+0800 (CST)
new Date().toISOString() // "2018-01-24T03:06:22.861Z"
```
> toISOString() 方法返回一个 ISO（ISO 8601 Extended Format）格式的字符串： YYYY-MM-DDTHH:mm:ss.sssZ。时区总是UTC（协调世界时），加一个后缀“Z”标识。  ------ [Date.prototype.toISOString() | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)

哈哈，其实最终的实现很简单，但是要搞清楚原理需要深入了解一下标准是怎么去定义实现的。

## 参考资料
1. [ISO日期格式标准](http://www.zoucz.com/blog/2016/01/29/date-iso/)
2. [Convert UTC date time to local date time](https://stackoverflow.com/questions/6525538/convert-utc-date-time-to-local-date-time)
3. [协调世界时 | 维基百科](https://zh.wikipedia.org/wiki/%E5%8D%8F%E8%B0%83%E4%B8%96%E7%95%8C%E6%97%B6)
4. [ISO 8601 | 维基百科](https://zh.wikipedia.org/wiki/ISO_8601)
5. [Date.parse() | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date/parse)
6. [Date.prototype.getTimezoneOffset() | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset)
7. [Date.prototype.toString ( ) | Standard ECMA-262](http://www.ecma-international.org/ecma-262/6.0/#sec-date.prototype.tostring)
8. [Date.prototype.toISOString() | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)