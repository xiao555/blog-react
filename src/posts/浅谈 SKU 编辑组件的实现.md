---
title: "浅谈 SKU 编辑组件的实现"
tags: ["SKU"]
slug: On the implementation of SKU editing components
createDate: 1559552460000
---
商品有两个重要的概念：SPU(Standard Product Unit )和SKU(Stock Keeping Unit)。通俗点说，SPU就是某个商品，比如iPhoneX和iPhoneXR是两个不同的手机，也是两个SPU。SKU是商品的具体型号，比如“黑色-iPhoneX-128G-国行-联通版”，“白色-iPhoneX-256G-国行-联通版”就是iPhoneX这个SPU的两个SKU。

SKU有很多属性，比如上述iPhoneX的SKU属性就包括颜色，容量等等，这种影响到库存和价格的属性也叫销售属性。目前我司前台展示的销售属性就包括Color，Size，Unit，Quantity，Type等等。除了销售属性外，还有很多商品的属性与SKU有关，比如库存，税率等等。

所以，SKU是电商系统的重要组成部分，而编辑SKU也是商品管理最核心最复杂的功能之一。

--intro--

## 业务需求

Seller Central开放平台为印度seller提供自主发布管理商品、管理订单、管理退货退款等服务，属于我们目前比较重要的平台业务。

本文以Seller Central在线商品编辑为例浅谈一下SKU编辑组件的实现。

## 产品需求

最初的prd如下：

![seller-sku-prd](https://xiao555.netlify.com/seller-sku-prd)

可以看到这是一个表格结构，每行一个sku。我们要实现的功能是：
1. 展示SKU属性值，库存，Seller Sku(唯一标识)，上下架状态，下架原因
2. 可编辑SKU属性值，库存，并进行SKU属性格式化和输入值的校验，校验错误信息展示在每一行的最后。
3. 支持单个SKU上下架
4. 支持选择多个SKU批量上下架
5. 支持新增SKU（上图未体现出来）

因为设计稿规定的主体内容区域宽度有限，不能一次展示这么多列，因此我们最终决定采用首尾列固定，中间部分可以滚动浏览的布局方式。最终效果如下：

![seller-sku-demo](https://xiao555.netlify.com/seller-sku-demo)

复选框一列和Action是固定的，中间的内容可滚动查看。

## 组件划分

首先，我们对组件进行一下分层：

![seller-table-layout-1](https://xiao555.netlify.com/seller-table-layout-1)

我们把SKU编辑模块拆成了五部分：
1. Table Header 负责展示SKU属性名，Stock，上下架状态等等。
2. Table Body 包括Table Row和Add Sku两部分。
3. Table Row 负责单个SKU的所有业务逻辑。
4. Add Sku 负责新增SKU。
5. Table Footer 提供全选和批量上下架的功能。

对应组件分层，我们的文件结构如下：

![seller-folder](https://xiao555.netlify.com/seller-folder)

## UI实现

这里采用Table来实现页面布局，本来一开始想用div手动实现，因为各种复杂的情况发现很难用div去模拟table，为了实现对齐效果导致代码很多很乱，遂放弃改为Table。想了一下本来Table就是为了实现这种布局的，我为什么要去费时间用div去实现呢==！

这里的难点主要是实现首尾列固定，其他都是常规操作。

### 实现首尾列固定

首尾列固定是通过三个table的组合来实现的，一个table正常渲染，一个展示首列，一个展示尾列，表格列的宽度都是固定的，保证三个table宽度一致。

![seller-three-table](https://xiao555.netlify.com/seller-three-table)

首尾列定位也有很多方法，这里利用table外层div绝对定位实现，首列的div left为0，尾列 right为0，宽度各自为首尾列的宽度, 超出部分隐藏。

尾列因为要展示表格的最后一部分，所有尾列的table也通过绝对定位使表格右对齐。同时，绝对定位的table无法撑起外层div的高度，当表格初次渲染或者数据更新的时候，需要计算一下正常table的高度，设置到首尾列表格外层div上。

为了让中间的table滚动起来，需要给每一列设置宽度，当总宽度超过外层div的宽度，table就可以滚动起来了。而且定宽也使得三个table的宽度一致，而不是浏览器根据可用空间自动分配宽度。这里利用colgroup来设置每一列的宽度。

![seller-table-code](https://xiao555.netlify.com/seller-table-colgroup.png)

## 逻辑实现

我们以数据流转为线来说一下逻辑上的实现：

![seller-table-code](https://xiao555.netlify.com/seller-table-code)

SkuEdit是SKU编辑组件的入口，在这里我们首先会做一次数据初始化处理，把后台返回的数据处理成我们需要的一些数据，并放到Vuex里。Vuex是Vue项目里一个状态管理的工具。SKU的各个Table组件都从这里拿数据，而每个组件里数据的更新也会提交到Vuex里同步到其他组件重新渲染，保证了数据的一致性，也使得三个table从视图到数据都是一模一样的，这样才能模拟一个首尾列固定的表格结构。

这里主要说一下数据初始化，数据格式化，数据校验。

### 数据初始化

前端拿到的数据结构是这样的：

``` javascript
"skuDTOs": [{
    "skuId": 100,
    "active": false, // 上下架状态
    "stock": -2, // 库存
    "taxRate": 0, // 税率
    "sellerSku": "test_SellerSku1",
    "offlineReason": "",
    "managerOperation": false,
    "attributes": [{ // sku属性
        "attrName": "Color",
        "attrbuteId": 123123,
        "attrValue": "Yellow"
      },
      {
        "attrName": "Size",
        "attrbuteId": 123124,
        "attrValue": "L"
      },
      {
        "attrName": "Style",
        "attrbuteId": 123124,
        "attrValue": "Fashion"
      }
    ]
  },
  ...
]
```
我们构造了两份数据：
1. `skuAttribute`记录了SKU维度展示编辑的属性名及其字段，包括Color，Size，Stock，Active等等。使得表头标题的展示和表格体数据展示顺序一致。
2. `skuList`在后台数据的基础上做了一些处理，比如统一attributes中各个属性的顺序，增加了一些业务上需要的字段，如`fieldValidateStatus`（记录校验状态），`errorMsg`（记录错误信息）等。

### 数据校验

SKU编辑很重要的一点是对数据进行校验，确保用户输入是正确的值。包括非空校验，是否有非法字符，数字范围校验。校验流程的简化版代码如下：

``` javascript
<input type='text' @input='setValue($event, index, sku, attr)'>

/**
 * 设置sku字段值
 * @param {event} event - input or change 事件
 * @param {number} index - sku索引
 * @param {object} originSku - 原始sku数据
 * @param {object} attr - 修改的sku属性 {label: 'color'}
 */
setValue (event, index, originSku, attr) {
  let value = event.target.value
  let data = { [attr.key]: value }
  // 如果更改了值, 设置sku needConfirm属性为true
  if (originSku[attr.key] !== value) {
    data.needConfirm = true
  }
  commit('manageProducts/SET_SKU_FIELD', { index, data }) // 更新Vuex
  validateField(attr) // 校验
}

// validateField是校验逻辑的入口，根据校验的字段调不同的方法
validateField (attr) {
  switch(attr.label) {
    case 'stock':
      validateStock() // 校验库存
    case 'Tax Rate(%)':
      validateTaxRate() // 校验税率
    // 纯展示的字段不做校验
    case 'seller Sku':
    case 'Status':
    case 'Reason for Inactive':
      return true
    default:
      validateSkuAttribute(attr) // 校验SKU属性
  }
},
```
通过绑定input事件触发流程，先把数据更新到vuex里，再执行校验。`needConfirm`是个优化UX的方法，如果用户编辑后忘了提交就去做其他操作，通过判断这个字段可以提醒用户先把你的改动提交了。

具体校验我们以校验非法字符为例：

``` javascript
// 校验非法字符
let includeInvalidSymbols = validateInvalidSymbols(value)
if (includeInvalidSymbols.length !== 0) {
  this.setSkuField({
    errorMsg: `Invalid Symbol "${includeInvalidSymbols.join(' ')}", please check it.`,
    fieldValidateStatus: { [attr.key]: true }
  })
  return false
}
```
`validateInvalidSymbols`是我们一个校验非法字符的公共工具函数，用在很多地方，返回值是非法字符组成的数组。如果数组长度不为0则说明有非法字符。我们会把非法字符放到报错文案里赋给当前SKU的`errorMsg`字段，展示在这一行最后，这样用户看文案就知道哪些是非法字符。同时`fieldValidateStatus`也会记录当前字段校验不通过。会高亮对应的input输入框，用户也会知道哪里校验失败了。这些也是优化UX的一些小方法。

另外，提交单个SKU编辑和新增SKU的时候，还会校验是否有重复的SKU属性。总之，需要校验的情况很多，也复杂，有的校验条件跟状态有关。前端校验会在向后端发请求之前把问题暴露出来，减少不必要的请求。后端也有兜底的校验，一起确保SKU编辑功能正常。

### 数据格式化

像Color, Size这些SKU属性，用户编辑之后，前端会进行格式化处理比如xl -> XL, xxl -> XXL, 2xl -> 2XL, blue white -> Blue White等等提升用户体验。

``` javascript
<input type='text' @change='formatInputValue(attr)'>

/**
 * 格式化input输入值
 * @param {object} attr - 要校验的属性对象 {key: 'color'}
 */
formatInputValue (attr) {
  let value
  switch (attr.key) {
    case 'stock':
    case 'taxRate':
      value = this.sku[attr.key].toString().trim()
      // 如果非空字符串且可转数字，则转为数字类型
      if (value !== '' && !isNaN(value)) {
        value = Number(value)
      }
      this.$store.commit('manageProducts/SET_SKU_FIELD', {
        index: this.index,
        data: { [attr.key]: value }
      })
      return
    default:
      value = formatSkuAttributeValue(this.sku.attributes[attr.attrIndex].attrValue.trim())
      this.$store.commit(
        'manageProducts/SET_SKU_ATTRIBUTES',
        { index: this.index, attrIndex: attr.attrIndex, value },
      )
  }
}
```
其中`formatSkuAttributeValue` 就是我们格式化SKU属性的工具函数。这里有两个问题值得探讨：
1. 为什么不是监听input事件而是change事件？input是输入的时候就触发，而change是`<input>`失焦后才会触发。
2. 像库存，税率这些数字为什么不用`<input type='number'>`处理，格式化的时候还要转成数字。

第一个问题，其实一开始绑定的就是input事件，这样，用户边输入的时候，就会进行格式化，输入a就会变成A。但是这样有个问题，如果用户想输入Blue White，因为我在格式化的时候会去除首尾空格，所以空格怎么也输不进去(对不起，是我坑了你们)。所以后来改成了监听change事件，当用户输入完成后进行format，即输入`blue white`，输入框失焦后再格式化成`Blue White`。

第二个问题，其实设置`type='number'`只是让浏览器按照数字的方式渲染控件，可以启用内置的验证，步进箭头等等。但是element的value还是字符串类型的并不是数字。而且内置的验证虽然方便，但不可控，还有许多问题，比如科学计数法的`e`是可输入的，但是我们并不需要。所以我们选择用js去控制输入而不是浏览器内置的那一套。

### TODO

需求开发时因为任务重，时间紧，写完之后还是感觉有很多可以优化的地方，只是一直没时间看。写这篇文章的时候就发现了几处：
1. TableHeader和TableBody是分开写在两个Table里的，外层div和table之前其实还有两个div，一个包含header的table，一个包含body的table。我就在想，为什么这么实现来着，好像没什么理由。我就试了一下写在同一个table里，发现可行，而且省掉了不少代码...
2. TableRow里的input输入框，button操作按钮等等其实是写在TableBody里通过slot传进去的。为什么不直接写到TableRow里呢，这样导致TableBody里融合了不少业务逻辑，分层不明确。我们的组件分层设计上TableHeader和TableBody应该是尽量只负责布局，单个SKU操作的业务逻辑放在TableRow里。Slot的方式也增加了逻辑复杂度。

当然，有时间的话可以优化一下。

## 总结

SKU编辑还是很复杂的，也有很多UX优化和细节，这里就简单说了一下。其实SKU维度的每一个字段都可以有一堆业务逻辑。比如最近，对鞋类商品的Size属性进行尺码转换的需求，就基于类目，尺码，尺码单位加了一堆逻辑。所以，像这样的业务组件，也要考虑可扩展性。因为业务是要不断满足需求的，需求又是永远不可能满足的。

第一次写业务组件，很紧张，多多指教！
