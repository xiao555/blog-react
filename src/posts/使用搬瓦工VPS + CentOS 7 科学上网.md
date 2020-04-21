---
title: "使用搬瓦工VPS + CentOS 7 科学上网 "
tags: ["vps", "CentOS"]
slug: bandwagonhost-vps-centos-shadowsocks
createDate: 1511136000000
---
为了优雅的使用Google，Gmail等折腾过不少VPS, 最初是用的搬瓦工的便宜VPS，半年$12.99，由于流量用不完，开了多账号出租。后来用过香港的，速度不错但是太贵，前一段时间一直用的DigitalOcean的VPS，Github学生优惠可以免费用10个月，美滋滋。

可惜好景不长，因为18+1大，DO的vps ssh都连不上了，于是又回到了搬瓦工，最便宜的没货了，能买到的最便宜的是每月$4.99的，加拿大机房用着还可以。

最近同学那里得到消息，可以一年$29.99，再加上6%的优惠码，最后只需要180+一年。可以说现在看来很便宜了，于是就下单了。

买的时候是洛杉矶的，可以迁移到其他地方(怕被封ip), 然后重装系统，我装的是CentOS 7 x86_64 bbr。

--intro--

### 配置ssh免密登录（mac）

1. 生成密钥

```
ssh-keygen -t rsa
```

一路回车即可，然后执行：

```
ls ~/.ssh
```

会看到两个密钥文件`id_rsa`(私钥), `id_rsa.pub`（公钥）

2. 配置`~/.ssh/config`

在`~/.ssh/config`（没有就新建）里添加：
```
Host {NAME} # 主机名， 别名
	HostName {IP} # 完整的主机名， IP
	User root # 登录用户
	IdentityFile ~/.ssh/id_rsa # 私钥
```

3. 将公钥拷贝到远程主机

ssh登录到远程主机，将公钥内容拷贝到`~/.ssh/authorized_keys`文件后面，如果没有就新建。
然后就可以免密登录到远程主机了。

### 配置Shadowsocks-libev + simple-obfs

1. 关闭防火墙

```
systemctl stop firewalld
systemctl disable firewalld
```

2. 安装依赖

```
yum -y install epel-release
yum -y update
yum -y install wget gcc automake autoconf libtool make m2crypto autoconf libtool curl curl-devel zlib-devel openssl-devel perl perl-devel cpio expat-devel gettext-devel pcre-devel asciidoc xmlto git
```

3. 安装 Libsodium

```
export LIBSODIUM_VER=1.0.13
wget https://download.libsodium.org/libsodium/releases/libsodium-$LIBSODIUM_VER.tar.gz
tar xvf libsodium-$LIBSODIUM_VER.tar.gz
pushd libsodium-$LIBSODIUM_VER
./configure --prefix=/usr && make
sudo make install
popd
sudo ldconfig
```

4. 安装 MbedTLS

```
export MBEDTLS_VER=2.6.0
wget https://tls.mbed.org/download/mbedtls-$MBEDTLS_VER-gpl.tgz
tar xvf mbedtls-$MBEDTLS_VER-gpl.tgz
pushd mbedtls-$MBEDTLS_VER
make SHARED=1 CFLAGS=-fPIC
sudo make DESTDIR=/usr install
popd
sudo ldconfig
```

5. 下载 Shadowsocks-libev 源码

```
cd ~
git clone https://github.com/shadowsocks/shadowsocks-libev.git
cd shadowsocks-libev
git submodule update --init --recursive
```

6. 编译 Shadowsocks-libev

```
cd ~/shadowsocks-libev
./autogen.sh && ./configure --prefix=/usr/local/shadowsocks-libev && make && make install
```

7. 安装 Simple-obfs

```
git clone https://github.com/shadowsocks/simple-obfs.git
cd simple-obfs
git submodule update --init --recursive
./autogen.sh
./configure && make
make install
```
8. Shadowsocks-libev Systemd 配置文件

```
vim /etc/systemd/system/shadowsocks-libev.service
#  This file is part of shadowsocks-libev.
#
#  Shadowsocks-libev is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 3 of the License, or
#  (at your option) any later version.
#
#  This file is default for RPM packaging. See also
#  /etc/sysconfig/shadowsocks-libev for environment variables.
[Unit]
Description=Shadowsocks-libev Default Server Service
Documentation=man:shadowsocks-libev(8)
After=network.target
[Service]
Type=simple
#EnvironmentFile=/etc/sysconfig/shadowsocks-libev
User=nobody
Group=nobody
LimitNOFILE=32768
ExecStart=/usr/local/shadowsocks-libev/bin/ss-server -c /etc/shadowsocks-libev/config.json $DAEMON_ARGS
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
[Install]
WantedBy=multi-user.target
```

9. 创建配置文件

```
vi /etc/shadowsocks-libev/config.json

{
    "server":"0.0.0.0",
    "server_port":8388,
    "local_port":1080,
    "password":"Password",
    "timeout":60,
    "method":"chacha20",
    "plugin": "obfs-server",
    "plugin_opts": "obfs=http"
}
```

10.  Systemd 启动 Shadowsocks-libev

```
systemctl enable shadowsocks-libev.service
systemctl start shadowsocks-libev.service
systemctl status shadowsocks-libev.service
```

OK. 荷兰机房的速度还是不错的，YouTube 1080p 基本不卡。

### 参考资料

1. [Centos7 配置Shadowsocks-libev + simple-obfs](https://www.sundayle.com/2017/10/24/shadowsocks-libev/)
2. [mac配置ssh免密码登录centos7](http://blog.csdn.net/xiaomengxiaoqiu/article/details/76408329)
3. [编译错误 Cannot find pcre library by CentOS 6 请指教谢谢](https://www.v2ex.com/t/325885)