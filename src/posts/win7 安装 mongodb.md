---
title: "win7 安装 mongodb"
tags: ["MongoDB", "win7"]
slug: install mongodb on win7
createDate: 1461998526384
---
最近玩node需要用到MongoDB数据库，试过各种方法终于配置好了，记录下来防坑。

--intro--

## 下载

官网地址：[http://www.mongodb.org/downloads](http://www.mongodb.org/downloads)

## 安装

无论是压缩包还是安装程序，都可以放在你想放的位置，然后在目录下建立DB目录存储数据库和Log目录记录日志

```
- bin
- DB
- Log
...
```

## 安装成系统服务

在目录下建立mongo.conf和mongo.cfg

mongo.conf:

```
storage:
   dbPath: "C:\MongoDB\DB"
```

mongo.cfg:

```
logpath=C:\MongoDB\Log\mongo.log
```

然后cmd切换到bin目录下，运行：

```
mongod.exe --config "C:\MongoDB\mongo.cfg" --install
```

这样就安装好了，要启动mongodb服务只需要输入：

```
net start mongodb
```

会提示MongoDB 服务已经启动成功。

然后再输入`mongo`即可进入shell环境。