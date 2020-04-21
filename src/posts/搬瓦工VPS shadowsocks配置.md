---
title: "搬瓦工VPS shadowsocks配置"
tags: ["vps", "shadowsocks"]
slug: bandwagonhost-vps-shadowsocks
createDate: 1455155263549
---
本文适用于CentOS 6 系统
shadowsocks客户端下载链接：[http://sourceforge.net/projects/shadowsocksgui/files/dist/](http://sourceforge.net/projects/shadowsocksgui/files/dist/)

--intro--

## 安装shadowsocks

root用户运行：

    wget --no-check-certificate http://www.bandwagong.com/vps/ss.sh
    chmod +x ss.sh
    ./ss.sh 2>&1 | tee shadowsocks.log


安装完成后，提示如下：

    Congratulations, shadowsocks install completed!
    Your Server IP:your_server_ip
    Your Server Port:443
    Your Password:your_password
    Your Local IP:127.0.0.1
    Your Local Port:1080
    Your Encryption Method:aes-256-cfb

    Welcome to visit:http://www.bandwagong.com
    Enjoy it!


## 卸载方法

root用户运行：

    ./ss.sh uninstall


#单用户配置文件

配置文件路径：/etc/shadowsocks.json

    {
        "server":"your_server_ip",
        "server_port":443,
        "local_address":"127.0.0.1",
        "local_port":1080,
        "password":"yourpassword",
        "timeout":300,
        "method":"aes-256-cfb",
        "fast_open": false
    }


## 多用户多端口配置文件

配置文件路径：/etc/shadowsocks.json

    {
        "server":"your_server_ip",
        "local_address":"127.0.0.1",
        "local_port":1080,
        "port_password":{
             "8989":"password0",
             "9001":"password1",
             "9002":"password2",
             "9003":"password3",
             "9004":"password4"
        },
        "timeout":300,
        "method":"aes-256-cfb",
        "fast_open": false
    }


## 使用命令

启动：/etc/init.d/shadowsocks start
停止：/etc/init.d/shadowsocks stop
重启：/etc/init.d/shadowsocks restart
状态：/etc/init.d/shadowsocks status