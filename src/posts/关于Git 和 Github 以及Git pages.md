---
title: "关于Git 和 Github 以及Git pages"
tags: ["git", "github", "git-pages"]
slug: about git github and git pages
createDate: 1458108281766
---
昨晚在床上发现有学习笔记，也想写一个分享一下，写点什么呢？鉴于有不少人是初次接触Git，干脆就说说这个吧，我只会一些基本的操作，大神可以自动忽略。

--intro--

### 关于github

什么是github(全球最大的同性交友平台，没有性别歧视==)呢？
说白了就是一个仓库，你可以把你的代码放在一个小仓库上，别人也把他们的代码放在一个小仓库上，然后这些小仓库就组成了github，我们可以在里面互相串门，看到喜欢的人可以follow，看到喜欢的项目可以star或者fork。看到这，你是否迫不及待想有一个自己的仓库来保存你成果丰硕的代码呢？去[官网](https://github.com/)注册一个账号吧。

### 关于Git

那么怎么把代码上传到github的仓库上呢？

#### 1、首先我们在github上要建立一个仓库

我们进入自己的官网，可以看见右上角头像左边有个加号,点击选择new repository

![](https://xiao555.netlify.com/005NJVkbjw1f1ymc2ulnuj309h04y3yn.jpg)

进入这样一个页面，填一下名字和描述，然后点击左下角的Creat

![](https://xiao555.netlify.com/005NJVkbjw1f1ymenjrv4j30lj0fhq5w.jpg)

然后进入这样一个页面，这表示这个仓库空空如也，需要我们上传东西，接下来就要用到Git喽，没有Git的去[官网](https://git-scm.com/downloads)下一个吧.图中箭头所指的就是我们新建的这个github仓库的地址，方框中的就是我们一会要用到的git命令。

![](https://xiao555.netlify.com/005NJVkbjw1f1ymkab7fkj30o90hgwjf.jpg)

好，现在我们在桌面新建一个文件夹，里面放了我们要上传的代码，安装好git后鼠标右键会有一个Git Bash here，点击出现一个熟悉的黑框框

![](https://xiao555.netlify.com/005NJVkbjw1f1ymvjn5hnj30il0goq8z.jpg)

`git init` 就是初始化一下，我们会发现文件夹里多了一个`.git`的隐藏文件，这个不要随便改。`git add`就是把本机文件添加进去 `git add .`就是添加所有的意思。添加完了就要提交了，`git commit -m ""`,-m就是message的意思，后面的双引号里写上这次提交的信息。`git remote add ...`添加远程服务器，名字可以随便，地址就是你git仓库的地址，添加一次以后就不用再添加了。然后就是`git push 远程服务器名字 分支`，分支一般是master主分支。回车后会让你输入github账号和密码。可以使用 [credential helper](https://git-scm.com/docs/gitcredentials)来避免每次提交都要输入密码，如何配置可以参见：[https://help.github.com/articles/caching-your-github-password-in-git/](https://help.github.com/articles/caching-your-github-password-in-git/).

```
XIAO555@XIAO555-PC MINGW64 ~/Desktop/新建文件夹 (master)
$ git push origin master
Counting objects: 3, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 1.23 KiB | 0 bytes/s, done.
Total 3 (delta 0), reused 0 (delta 0)
To https://github.com/xiao555/example.git
 * [new branch]      master -> master
```

这样就表示上传完成了，回到你的github上看看吧。

[![](https://xiao555.netlify.com/005NJVkbjw1f1ynaltri1j30sg0ar41g.jpg)](https://xiao555.netlify.com/005NJVkbjw1f1ynaltri1j30sg0ar41g.jpg)

大功告成！咦，要是我们在本地修改了代码要同步到github上怎么办？没关系，继续下列步骤：

```
git add . //会显示有几个改动
git commit -m "..."
git push origin master
```

### 关于github pages

我想让我的代码可以在线演示怎么办？用Github Pages。让我们回到git bash那个黑框框，进行如下操作：

```
XIAO555@XIAO555-PC MINGW64 ~/Desktop/新建文件夹 (master)
$ git checkout -b gh-pages
Switched to a new branch 'gh-pages'
//创建名为gh-pages的分支

XIAO555@XIAO555-PC MINGW64 ~/Desktop/新建文件夹 (gh-pages)
$ git push origin gh-pages
Total 0 (delta 0), reused 0 (delta 0)
To https://github.com/xiao555/example.git
 * [new branch]      gh-pages -> gh-pages
//上传到gh-pages分支
```

我们这时候回到github上刷新一下，会发现这里多了gh-pages的分支

![](https://xiao555.netlify.com/005NJVkbjw1f1ynooepmdj30en0erwgg.jpg)

我们的文件也在这个分支上。github pages需要index.html文件，我在本地新建了一个上传到gh-pages分支上，内容是 `Hello!`.然后我们进入这个链接：[http://xiao555.github.io/example/](http://xiao555.github.io/example/),这不就是刚上传的那个index.html吗，

关于github pages具体可以参考[这个](https://help.github.com/categories/github-pages-basics/).

哈哈，到这里就结束了，不过git使用过程中会遇到一些奇怪的问题，大家可以百度，找我也行.