---
title: "用 GraphQL 写一个本地文件访问器"
tags: ["GraphQL"]
slug: Writing a local file accessor with GraphQL
createDate: 1554065280000
---
[Vue Cli 3](https://cli.vuejs.org/zh/)发布了UI功能，能够在浏览器上访问本地的Vue Cli创建的项目，安装依赖，运行npm script等等，十分强大。自己在升级[mock-server](https://github.com/xiao555/mock-server)的时候，也希望有一个浏览器界面访问本地的mock配置文件。

--intro--

那么怎么实现浏览器端访问本地文件呢？首先想到的是Node的fs模块，它提供了API可以访问本地的文件。可是能在浏览器端使用fs模块吗？当然不能，不然也太不安全了，随便一个网站都能访问本地的文件...

于是研究了一下Vue Cli 3的做法，发现他是本地开启一个Node服务，访问本地的文件，通过GraphQL来与前端通信。这样就实现了前端访问本地的文件系统。

话不多说，怎么去实现这样一个GraphQL服务呢？    为了方便开发，我们使用[apollo-server](https://github.com/apollographql/apollo-server)来实现graphQL服务。众所周知，GraphQL是一个使用基于类型系统来执行查询的服务端运行时。我们需要定义其数据类型和相应的解析函数，对应apollo-server上就是typeDefs和resolvers。
对于文件类型，我们定义如下：
``` javascript
exports.types  =  gql`

	type  Folder {

		name: String!

		path: String!

		children: [Folder]

		hidden: Boolean

		isDirectory: Boolean

		isMockConfig: Boolean

	}

	type  Query {

		folderCurrent: Folder

	}

	type  Mutation {

		folderOpen(path: String!): Folder

		folderOpenParent: Folder

		getMockConfig(path: String!): [MockItem]

	}

`
```

其中Folder是我们定义的类型，Query和Mutation是查询和变更，类似于GET请求和POST请求，我们定义了其字段和返回的数据类型。我们可以看到相当于一共有三个接口，查询当前目录，打开指定目录，打开上层目录。接下来就是实现他们的解析函数了：
``` javascript
exports.resolves  = {

	Folder: {

		children:  _folder  =>  folder.listChildren(_folder.path)

	},

	Query: {

		folderCurrent: () =>  folder.getCurrent()

	},

	Mutation: {

		folderOpen: (root, { path }) =>  folder.open(path),

		folderOpenParent: () =>  folder.openParent(cwd.get()),

		getMockConfig: (root, { path }) =>  folder.getMockConfig(path)

	}

}
```
folder部分实现如下：
``` javascript
const  generateFolder  =  file  => {

	return {

		name:  path.basename(file),

		path:  file

	}

}

const  listChildren  =  file  => {

	const  files  =  fs.readdirSync(file, 'utf8')

	return  files.map(file  => {

		const  fullPath  =  path.join(cwd.get(), file)

		return {

			path:  fullPath,

			name:  file,

			hidden:  isHidden(fullPath),

			isDirectory:  isDirectory(fullPath),

			isMockConfig:  isMockConfig(fullPath)

		}

	})

}

const  getCurrent  = () => {

	const  base  =  cwd.get()

	return  generateFolder(base)

}

const  open  =  file  => {

	cwd.set(file)

	return  generateFolder(cwd.get())

}

const  openParent  =  file  => {

	const  newFile  =  path.dirname(file)

	cwd.set(newFile)

	return  generateFolder(cwd.get())

}
```
cwd是记录当前目录的一个对象，默认是node进程的当前目录。查询当前目录就是返回cwd目录的各个字段，打开指定目录就是设置cwd为指定目录，打开上层目录就是设置cwd为cwd的上层目录。

``` javascript
let  cwd  =  process.cwd()


module.exports  = {

	get: () =>  cwd,

	set:  file  => {

		file  =  normalize(file)

		if (!fs.existsSync(file)) return

		cwd  =  file

	}

}
```
然后，通过中间件的形式挂载到express服务上，我们的GraphQL就搭建成功了：
``` javascript
const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const typeDefs = require('./graphql/type-defs')
const resolvers = require('./graphql/resolves')
const app = express()

const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({ app })

app.listen(port, host)
```

apollo-server 内置了GraphQL Playground，我们可以检查配置是否正确：

![graphql-playground.png](https://xiao555.netlify.com/graphql-playground.png)

这段查询的意思是我们要获取当前目录的children字段，因为children返回的是folder组成的数组，我们指定需要每个folder的name和path，结果就返回了每个子目录/文件的name和path。    GraphQL的好处就是我们在定义了类型之后，前端需要什么字段后台就返回什么字段，不需要手动处理。缺点就是比较不容易理解，定义类型麻烦，不过也是一劳永逸。

整个文件访问器最终效果如下：

![mock-server-ui.png](https://xiao555.netlify.com/mock-server-ui.png)

项目地址：https://github.com/xiao555/mock-server/tree/master/ui