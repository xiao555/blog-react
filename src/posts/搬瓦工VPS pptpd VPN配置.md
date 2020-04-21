---
title: "搬瓦工VPS pptpd VPN配置"
tags: ["vps", "pptpd", "vpn"]
slug: bandwagonhost-pptpd-vpn
createDate: 1455155301793
---
本教程适用于CentOS 6

--intro--

## 安装pptp

    wget --no-check-certificate https://raw.githubusercontent.com/teddysun/across/master/pptp.sh
    chmod +x pptp.sh
    ./pptp.sh


[http://www.bandwagong.com/wp-content/uploads/2015/04/258.png](http://www.bandwagong.com/wp-content/uploads/2015/04/258.png)

安装成功后，会有相应信息

[http://www.bandwagong.com/wp-content/uploads/2015/04/259.jpg](http://www.bandwagong.com/wp-content/uploads/2015/04/259.jpg)

增加一个新用户，删除用户，修改密码等可以使用编辑：

    vi /etc/ppp/chap-secrets


按i 编辑，格式如下：

    vpn pptpd 123456 *
    #vpn 用户名
    #123456 密码
    #pptpd 和 * 不变，字符中间必须用一个空格隔开。数字123，选用键盘字母键上方，不要用数字小键盘


[http://www.bandwagong.com/wp-content/uploads/2015/04/230.jpg](http://www.bandwagong.com/wp-content/uploads/2015/04/230.jpg)

如上输入完成，按下键盘左上方ESC键盘，英文状态下输入 “：”再输入字母 wq ，回车即保存好了。
现在只要电脑设置好，就可以自由的畅享网络了。

参考文章：[http://www.bandwagong.com/pptpd-vpn/](http://www.bandwagong.com/pptpd-vpn/)