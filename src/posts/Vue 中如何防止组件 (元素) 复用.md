---
title: "Vue 中如何防止组件 (元素) 复用"
tags: ["Vue"]
slug: How to prevent component (element) reuse in Vue
createDate: 1569834660000
---
看到这个标题，有人可能会疑惑：提高组件复用性不是我们应该拥抱的一件事情吗，为什么要拒绝它？是的，大多数情况下我们需要尽量复用组件，代码层面的组件复用提高了代码的复用性，便于维护。页面渲染层面的组件复用提高了性能。但是，在有些场景下是会遇到不需要组件复用的情况。

--intro--

Vue在渲染页面的时候，就会尽量去复用已有元素，就会出现上个tab的输入框被带到下一个tab中，切换tab后列表中的图片没变等问题。对于这种问题，最简单的办法就是加个key。

> `key` 的特殊属性主要用在 Vue 的虚拟 DOM 算法，在新旧 nodes 对比时辨识 VNodes。如果不使用 key，Vue 会使用一种最大限度减少动态元素并且尽可能的尝试修复/再利用相同类型元素的算法。使用 key，它会基于 key 的变化重新排列元素顺序，并且会移除 key 不存在的元素。

上述是引用Vue官方文档的说法。可以处理绝大部分不想复用的情况。然而前几天却遇到了一个key处理不了(其实可以，但很麻烦，不优雅)的情况。故事是这样的:

我们项目一开始的路由结构：

``` javascript
// 文件结构
- product
  - Index.vue
  - product-list
  - product-detail
- order
  - Index.vue
  - order-list
  - order-detail

// vue-router
{
  path: '/product'
  component: product/Index.vue,
  children: [
	{
	  path: '/'
	  component: product-list
	}.
	{
	  path: '/detail'
	  component: product-detail
	}
  ],
  path: '/order'
  component: order/Index.vue,
  children: [
	{
	  path: '/'
	  component: order-list
	}.
	{
	  path: '/detail'
	  component: order-detail
	}
  ]
}

// Index.vue
<template>
  <main>
	<keep-alive :include='product-list'>
	  <router-view></router-view>
	 </keep-alive>
  </main>
</template>
```

可以看到每一级导航下面都有一个Index.vue，内容也是差不多的，只不过有的支持keepAlive，有的不支持。秉着组件复用的原则，我把它们抽成了一个组件——支持keepAlive的SingleRouterView.vue（论坛的排版好难）:

```
<template>
  <keep-alive :include="keepAliveComponentNames">
	<router-view></router-view>
  </keep-alive>
</template>

<script>
export  default {
  data () {
	return {
	  keepAliveComponentNames: [], // 记录开启keepAlive的组件名
	}
  },
  watch: {
	'$route':  'checkKeepAlive'
  },
  methods: {
	checkKeepAlive () { // 检查是否开启keepAlive
	  let  matched  =  this.$route.matched
	  let  name
	  try {
		name  =  matched[matched.length  -  1].components.default.name
	  } catch (error) {
		return
	  }
	  if (!name) return
	  if (this.$route.meta.keepAlive) { // 开启的加到keepAliveComponentNames
		if (!this.keepAliveComponentNames.includes(name)) {
		  this.keepAliveComponentNames.push(name)
		}
	  } else { // 不开启的从keepAliveComponentNames去掉
		if (this.keepAliveComponentNames.includes(name)) {
		  this.keepAliveComponentNames.splice(this.keepAliveComponentNames.indexOf(name), 1)
		}
	  }
	}
  },
  created () {
	this.checkKeepAlive()
  }
}
<script>
```

这样我们的路由结构就变成了：

``` javascript
// 文件结构
- product
  - product-list
  - product-detail
- order
  - order-list
  - order-detail

// vue-router
{
  path: '/product'
  component: SingleRouterView,
  children: [
	{
	  path: '/'
	  meta: {
		keepAlive: true
	  },
	  component: product-list
	}.
	{
	  path: '/detail'
	  component: product-detail
	}
  ],
  path: '/order'
  component: SingleRouterView,
  children: [
	{
	  path: '/'
	  component: order-list
	}.
	{
	  path: '/detail'
	  component: order-detail
	}
  ]
}
```
这样就省去了很多Index.vue文件，达到了组件复用的目的。而且可以动态配置是否开启keepAlive，如果有些条件下不想keepAlive，把route.meta.keepALive设为false即可，Perfect！

就这样用了好久，知道前端时间做需求时发现了一个问题，当时vue-router的配置是这样的：

``` javascript
{
  path: '/rules-management'
  component: SingleRouterView,
  children: [
	{
	  path: '/'
	  meta: {
		keepAlive: true
	  },
	  component: rule-list
	}.
	{
	  path: '/detail'
	  component: rule-detail
	}
  ],
  path: '/violation-management'
  component: SingleRouterView,
  children: [
	{
	  path: '/'
	  meta: {
		keepAlive: true
	  },
	  component: violation-list
	}.
	{
	  path: '/detail'
	  component: violation-detail
	}
  ]
}
```
有规则管理和违规管理两个上级路由，都引用了SingleRouterView组件，他们子路由中都有需要keepAlive的地方。但是页面上会有个问题，就是从rule-list跳到violation-list的时候，rule-list还会被缓存，再跳转回去的时候，缓存的组件会被激活，原来页面上的状态会被保留。但是我们想要的效果是只有列表页跳到详情页再返回的时候，需要缓存列表页之前的状态。从列表页跳到其他路由下再回来应该是一个全新的版本。

![被复用的组件缓存了RulesList组件](https://xiao555.netlify.com/daa2c0bc15554dff9aed856c34216666_image.png)


上图中可以看到从规则管理跳转到违规管理，SingleRouterView还缓存着之前规则列表组件。显然，我们的SingleRouterView被复用了。怎么解决呢？

方法一：也是最简单的，加key。但是问题来了，key的值是什么？路由的path？显然不行，列表页和详情页的path是不同的，这样会导致从列表页跳转到详情页，SingleRouterView就是一个全新的版本了，不会有缓存的组件。所以要保证SingleRouterView下的所有子路由共享一个key，那给meta加个变量吧：

``` js
{
  path: '/rules-management'
  component: SingleRouterView,
  children: [
	{
	  path: '/'
	  meta: {
		keepAlive: true,
		key: 'rules-management'
	  },
	  component: rule-list
	}.
	{
	  path: '/detail'
	  meta: {
		key: 'rules-management'
	  },
	  component: rule-detail
	}
  ],
```
然后，SingleRouterView里用route.meta.key做组件的key。emmm.....可以是可以，但是未免也太麻烦了，每个子路由都要配一下key，而且如果有嵌套多个SingleRouterView的话怎么办？想想就头皮发麻。

方法二：动态创建组件。灵机一动，既然同一个组件会被复用，那我每次用函数动态创建一个组件，你会怎么处理？

```
// createSingleRouterView.js

export  default () => {
return {
  data () {
	return {
	  keepAliveComponentNames: [], // 记录开启keepAlive的组件名
	}
  },
  watch: {
	'$route':  'checkKeepAlive'
  },
  methods: {
	checkKeepAlive () { // 检查是否开启keepAlive
	  let  matched  =  this.$route.matched
	  let  name
	  try {
		name  =  matched[matched.length  -  1].components.default.name
	  } catch (error) {
		return
	  }
	  if (!name) return
	  if (this.$route.meta.keepAlive) { // 开启的加到keepAliveComponentNames
		if (!this.keepAliveComponentNames.includes(name)) {
		  this.keepAliveComponentNames.push(name)
		}
	  } else { // 不开启的从keepAliveComponentNames去掉
		if (this.keepAliveComponentNames.includes(name)) {
		  this.keepAliveComponentNames.splice(this.keepAliveComponentNames.indexOf(name), 1)
		}
	  }
	}
  },
  created () {
	this.checkKeepAlive()
  },
  render() {
	return (
	  <keep-alive  include={this.keepAliveComponentNames}>
		<router-view></router-view>
	  </keep-alive>
	)
  },
}
```

```
// vue-router
{
  path: '/rules-management'
  component: createSingleRouterView(),
  children: [
	{
	  path: '/'
	  meta: {
		keepAlive: true
	  },
	  component: rule-list
	}.
	{
	  path: '/detail'
	  component: rule-detail
	}
  ],
  path: '/violation-management'
  component: createSingleRouterView(),
  children: [
	{
	  path: '/'
	  meta: {
		keepAlive: true
	  },
	  component: violation-list
	}.
	{
	  path: '/detail'
	  component: violation-detail
	}
  ]
}
```

去页面上看一看，列表页到详情页会缓存列表页，跳到其他路由的列表页会生成一个新的router-view组件，这才是真的的Perfect！


总结：对于大部分防止组件(元素)复用的情况可以用key解决，如果key解决不了，就要想想其他办法了，动态创建组件也许是个不错的选择。
