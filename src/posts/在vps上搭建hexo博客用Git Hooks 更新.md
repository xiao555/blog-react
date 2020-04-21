---
title: "在vps上搭建hexo博客用Git Hooks 更新"
tags: ["vps", "hexo", "blog", "git-hooks"]
slug: set up a hexo blog on vps and update it with git hooks
createDate: 1457431802283
---
很早以前就想搭一个博客了，三个月前为了翻越伟大的防火墙，去搬瓦工买了个vps，配了个shadowsocks。既然有了vps，当然也希望搞个博客，这个寒假在家没事就开工了。

之前一直不清楚搭一个博客需要啥，所以用了[hexo](https://hexo.io/zh-cn/)这个静态博客系统。

--intro--

我的vps系统是Centos 6 x86。
本机是windows7.

## 搭建过程

搭建过程分两部分，需要在本机和服务端都安装Hexo和Git，VPS上还需要安装Nginx服务器，配置Git Hooks。

### 本机1

#### 装Git

下载[Git for windows](https://git-scm.com/download/win)，一路默认安装

#### 安装Node.js

在[Node.js](https://nodejs.org/en/)官网下载最新版，一路默认安装

#### 创建网站目录

在你电脑的任意位置创建一个文件夹（我的是D:\\blog，下文以此代替），作为网站目录。

#### 安装Hexo

打开你创建的网站目录，右键git bash here打开命令行。

    $npm install -g hexo-cli
    $hexo init
    $npm install
    $hexo d -fg
    $hexo serve


打开[http://localhost:4000](http://localhost:4000) 如果看到hexo的初始页面证明安装成功。

PS:在我的电脑上4000貌似被占了，如果要改端口的话：

    $hexo serve -p ****


#### 配置Git

在网站目录git bash，执行

    $ git init
    $ git add .
    $ git commit -m "Initial commit"


我们还要给他加个插件
$npm install hexo-deployer-git –save

#### 生成ssh密钥

输入命令 `ssh-keygen -t rsa -C “blog”` ,生成公钥和私钥，打开生成密钥的文件夹，找到id\_rsa.pub。

### VPS(CentOS 6)

我们选择Git仓库+Git Hooks作为服务器端的解决方案.
PS:我操作的用户是root，因为这样可以方便点.

#### 安装Git

    yum update && apt-get upgrade -y #更新内核
    yum install git-core


#### Git仓库

    cd ~
    mkdir blog.git && cd blog.git #创建GIT仓库目录
    git init --bare #初始化一个空仓库


#### SSH公钥配置

为了本机不登录自动部署

    cd ~
    mkdir .ssh && cd .ssh
    vim authorized_keys


然后把id\_rsa.pub里的那一串复制过去。

本机Git Bash里实验一下

    ssh username@yourVps(IP Or URL)


如果配置成功的话不用输入密码就会登陆。

#### 配置本机Hexo

设置git用户名

    $ git config --global user.email "email@example.com"
    $ git config --global user.name "username"


配置站点目录里的\_config.yml

    # Deployment
    # Docs: https://hexo.io/docs/deployment.html
    deploy:
      type: git
      message: update
      repo: root@YOURVPSIP:blog.git
      branch: master


这应该是单用户的设置，多用户请自行google,基本是

    repo:
      s1: root@YOURVPSIP:blog.git,master


运行 `hexo g && hexo d`，如果一切正常，静态文件已经被成功的push到了blog的仓库里

PS:注意配置文件的冒号 ： 后面一定要有空格

#### 配置Nginx

##### 安装Nginx和Node.js

    $yum update && apt-get upgrade -y #更新内核
    $yun install nodejs -y
    $yum install nginx -y
    $cd /etc/nginx/conf.d/
    $vi default.conf


我这里为了方便直接改默认配置文件了，其他博客一般介绍新建一个vhost的方法。

    server {
        listen IP:80 ;
        root /var/www/blog;  # 这里是你网站的路径 路径下包含index.html等一系列文件
        server_name _;   # 如果没有域名就像我这样写，有域名就写域名
        access_log  /var/log/nginx/example_access.log;
        error_log   /var/log/nginx/example_error.log;
        location ~* ^.+\.(ico|gif|jpg|jpeg|png)$ {
                root /var/www/example.com/public;
                access_log   off;
                expires      1d;
            }
        location ~* ^.+\.(css|js|txt|xml|swf|wav)$ {
            root /var/www/example.com/public;
            access_log   off;
            expires      10m;
        }
        location / {
            root /var/www/example.com/public;
            if (-f $request_filename) {
                rewrite ^/(.*)$  /$1 break;
            }
        }
    }


##### 创建目录 分配权限

    $cd /var/www
    $mkdir blog
    $chmod 775 -R /var/www/blog


顺便初始化一下仓库

    git init
    git remote add origin ~/blog.git
    git fetch
    git checkout master


##### 运行Nginx

    $/etc/init.d/nginx restart


#### 配置 Git Hooks

这个是不同于网上搜的大多数方法的git hooks配置，因为他们那种方法我用不成功==

    cd ~/blog.git/hooks
    touch post-receive
    vi post-receive


配置如下

    #!/bin/sh

    unset GIT_DIR

    NowPath=`pwd`
    DeployPath="/var/www/blog"

    cd $DeployPath
    git pull origin master

    cd $NowPath
    exit 0


更改权限

    $ chmod +x post-receive


到这里就配置ok了，回到本机站点目录git bash测试一下，可以略作修改，比如换一下标题 `title: Xiao555`,然后

    hexo g && hexo d


从浏览器打开你的网站或者服务器的ip看看是否成功。
当然，每次更新完都要写这行虽然不多但是还有感觉有点麻烦，在这里我们可以给Git配置一下，编辑~/.bashrc文件，没有会加上：

    vim ~/.bashrc


编辑内容：

    alias blog='cd D:/blog;hexo g && hexo d'


cd 后面是你的本机站点目录。保存并退出，再运行(不然不生效）：

    source ~/.bashrc


这样以后写完一篇文章要更新只需要直接打开git bash输入blog就可以了。

至于hexo站点的配置，参照官网就好。这里添加一项就是站点配置文件里的`auto_detect: false`要改为true，否则代码块行号只有1，其他为空白：

![](https://xiao555.netlify.com/codebug.png)

啊，突然发现写个博客好难啊，记性不好怕写得不对，有错误还希望读者多多指出，参考资料基本就是你能google到的那些有关的博文，就不一一列举了,主要的区别就是git hooks的。