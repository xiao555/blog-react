---
title: "大三狗实习面经（拿了腾讯offer）"
tags: ["offer", "interview"]
slug: junior-interview
createDate: 1493308800000
---
本人西电软院大三，之前在一个外包团队实习，(广告：我们的团队[WPNinja . Sydney, Australia](https://www.wpninja.com.au/))。
本来不打算大三找实习的, 但是觉得可以参加一下春招为以后积累经验吧。所以投了AT的内推，B说实话不想去，虽然不一定能进去。然后就开始等待，中间看了看前端的一些面试题。

--intro--

### 二面挂了的阿里

3月7日，北京的电话，阿里一面，感觉像是工作没几年的学长，问我什么专业，我说软件工程，然后他就问各种基础知识：

1. OSI七层模型知道吗？   我上学期学的网络已经忘了，也有点懵，为啥问这些。。当时只记得应用层，物理层，数据链路层了...
2. 对TCP/IP有什么了解？   已经完全不知道怎么回答了，现在想想知道什么说什么就是了
3. 知道BFC吗？   这个我确实不知道，虽然我是搞前端的，后来查了一下
4. 数据结构算法之类的。。忘了

基本是问啥啥不会的状态，电话结束看一下时间： 12min。本来以为gg了，结果又接到电话了

3月14日，杭州的电话，感觉应该是部门的leader把，说话很随和，也会引导你，整个面试过程下来感觉很舒服。问的问题比较广，大部分是诸如 让你负责一个项目你怎么安排，怎么设计一个三层的什么什么之类的。。。问我快排会吗，我说忘了。。。最后我还问了一下他的名字，也跟我说了，当时觉得我回答的还可以，结果就没有后文了。

总结：
1. 准备不充分吧，以积累经验为目的面的，没准备多少。数据结构什么的都忘了，快排都不会人家敢要你？感觉阿里挺注重基础的，自己之前看了看的前端面试题反而一个都没用上
2. 是感觉自己最后应该问一下对我有什么看法建议之类的，毕竟人家有多年经验了，能给你一些有用的指导。后面基本每次面试都问了

说实话阿里这个挺打击我的，感觉到了找实习的难度，觉得不能积累经验了，要正八经找个实习。

后面经常关注v2ex的酷工作，投了家上海的[Strikingly](https://www.v2ex.com/t/340614#reply123), 3月28投的，4月10才有反馈，4月13日电话面试，hr，问我职业规划什么的，最后说我可能有些迷茫，挂了....我想说我不迷茫啊，可能语言表达有问题吧。

然后就是在实习僧上投了一些，没有后文或不合适，投了头条，做了笔试题，到现在都是评估中，没有后文，其他像去哪儿，网易等错过了时间，华为根本不知道。

### 腾讯西安现场面（拿到offer）
腾讯我是内推的，然而深圳那边打了两次电话我都没接到，平时手机静音的，然后级就没有然后了。
4月2日做了腾讯的笔试题，编程题怎么也输出不来东西，放弃了，没收到4月16日的面试通知。
然而同学收到了，说我可以霸面，我正纠结要不要去的时候，面试组发了个腾讯校招"<西安>补增需求及霸面"登记表 ，我临时把简历改了改，缩成了一页，填上去了，晚上收到了面试短信，通知4月16日 18:00 去悦豪酒店面试。一个舍友也填了，也收到了面试通知 下午五点，于是那天我们一起去的，结果从4点等到了晚上7点20才轮到我，那天人真的多。我一个同学上午先面的，跟我说了说她问的问题：

1. 解释js继承
2. jsonp原理
3. h5里跨域资源共享
4. ajax原理
5. 原型链
6. 作用域链
7. 服务端客户端获取cookie的方法
8. 用过哪些构建工具
9. 用过哪些压缩工具
10. 项目相关...


然后我就看了好多面试题资料什么的，感觉准备一面的过程中收获了不少知识。分享几个：
1. http://m.blog.csdn.net/article/details?id=47023771
2. http://gcdn.gcpowertools.com.cn/showtopic-36594-1-3.html?utm_source=segmentfault&utm_medium=referral&utm_campaign=20170327
3. http://zhangwenli.com/blog/2015/04/01/2015-front-end-engineer-interview/ 这个我觉得还是要好好看看的，说的很详细，尤其是this那一段，让我感觉看书真有用。。而且我的简历模板也是照着zwl大神来的

到了房间，面试官很年轻，先说抱歉让你久等了，我笑着说没事没事。问的问题也是从项目着手：

1. 我看你项目里有弹出层，怎么用js实现一个弹出层呢？
2. 怎么点击取消弹出层？我说通过增删class来控制吧，他说不用class，然后我们在纸上比比划划半天，最后他说弹出层和document绑定click事件，我才突然明白他想考我的是事件冒泡，我说那就取消冒泡，你想问的是这个吧，面试官感觉是默认了，开始在简历上写东西，还突然问我在哪取消冒泡，我说弹出层...
3. 跨域相关的，jsonp原理，我说了一下，然后说我没用过，我只用过postMessage
4. cookie， 与域名有关，之前的问题忘了，后来问如果同一个域名不同端口能不能共享cookie，我当时回答的是不能，后来回去查了查，是可以的，只与域名有关
5. js异常知道吧，怎么设置一个全局的异常处理，我当时说用try catch？ 回去查了查，是有个error事件的，我感觉可以参考[javascript中的错误处理](http://jixianqianduan.com/article-translation/2016/05/12/proper-error-handler-in-javascript.html)
6. mongoDB 跟 Mysql有什么区别？我说了说自己的理解，但是没说到NoSQL，感觉应该先说这个的
7. 雪碧图用过吗？ 我说用过啊，我说我之前写了个小动画用雪碧图实现的，然后问怎么让他动起来，我说transition
8. 网站优化问题，诸如减少http请求之类的，提到了cdn，他问cdn原理是什么，我说我也不了解，但是人家是专业干这个的，肯定有一套加快访问速度的方法
9. 其他的想不起来了，这些都是我零零碎碎拼起来的，真不知道为啥别人记性这么好。

4月17日晚上11点收到了二面通知，第二天下午2点，舍友是上午9点半，所以我们不能一块走了。
第二天起床十点了，先打开电脑把各种排序写了一遍，好怕会问些其他方面的基础问题，或者让你手写代码什么的。
结果去了之后，面试官应该是个总监级别的，什么技术问题都没问：

1. 你遇到的最大的困难是什么，怎么解决的
2. 平时除了学习还有什么兴趣爱好
3. 平时做的东西有什么总结思考吗
4. 你觉得你有哪些优势？我所项目经验多，学习能力强，有上进心，他说你说的这些太泛了，然后我就挑事例具体说明。
5. 为什么不考研？
6. 先问了他，不像感觉中的问很多技术问题，他说基本是是问这些的，看一面面试官的反馈吧，如果有哪里不清楚会继续问问
7. 最后习惯性的问了对我有什么建议，面试官说你做的东西挺多，在本科生看来项目经验是很丰富了，不过平时要注意多总结思考，反思自己，这样才能不断的进步(具体的我也忘了，说了很多，基本是这个意思，不过我觉得说的很好很有帮助)

我感觉这种考的完全是平时的学习习惯，平时的积累，如果平时多想想这些问题，多思考总结的话，这些问题回答起来肯定没问题

4月19号收到hr面通知，舍友挂了，我感觉有点紧张，那天晚上看了好多hr面的例子，我前几次面试都是背书包带电脑去的，结果电脑一次也没用上，第二天就没带电脑，去了发现简历也没拿，又紧张了，不过前两面面试官都是自备的简历，感觉hr面应该也有吧。等待的地方也换到了一个小会议室，从一面满满的都是人，到二面人大大减少，hr面的时候当时算上我就两三个人。

下午一点收到通知去面试官房间，hr不是想象中的妹子==！ 问的问题是
1. 你工作方向啊，项目里扮演什么角色啊，看看你对你工作的理解，未来发展的方向。
2. 然后总会提一些高并发，数据库什么的，我感觉与部门有关吧，
3. 部门做的东西是面向腾讯内部的，与面向客户那种偏c方向的有什么区别？
4. 你兴趣方向在哪方面？
5. 看你用MongoDB，与Mysql的区别在哪？什么情况下会用MongoDb，什么情况下用Mysql？我说Mysql应该在数据量比较大的情况下用吧，我自己搞的东西数据量都比较小，就怎么方便怎么来
6. 其他数据库有用过吗？oracle，baseocean。。好像是这些，没有用过，我说最近写Blog用了Redis也算吧
7. Linux了解吗？我说我租了vps，搭了ss，然后部署些网站。 那除了这些操作以外有没有深入一些的，内核之类的？我说之前上课有写过一些（正在想写过啥，然后就问下一个问题了...orz）
8. 你觉得有什么需要加强的地方？ 我说我感觉计算机基础，网络，操作系统等等还是要多了解了解，这学期有算法和Java想好好学一下。 算法研究什么，数据结构吗？ 我说各种排序肯定要熟练的，然后主要是一些思想上的，比如最近讲的...（正在想，开始下一个问题）
9. Java会吗？我说正在学
10. 除了前端平时其他方面有了解吗？ 我说我后端也了解一下，express， koa 都用过，怎么跟数据库交互，设计RESTful API啊等等，又提到高并发，我说高并发用Node嘛
11. 看你之前投的的omg，了解吗？我说应该是腾讯视频的，在北京，然后....（沉默）hr说看来你不了解。我说我是内推的，必须选那个。之前的面试官跟你说部门了吗?没有。 然后hr跟我说了一下部门，我问了一下部门做什么产品的等等，他说部门也比较接纳新技术，我觉得挺好的

hr面感觉是我面的最长的了，问的问题也很多
然而接下来就是漫长的等待了。。。加了西安的群和全国的群，天天看一群大佬们等offer，拿到offer的就在群里发红包，哈哈。想着万一我腾讯过不了的话后面也就没什么招聘了吧，实习怎么办呢 ，很紧张的状态。

4月20hr面，4月25号微信状态终于变成了已完成所有面试。4月26号看到好多人拿了offer，虽然不是我们teg的，但是心里好着急啊，什么也做不进去。听说可以找内推人查后台状态，然而我内推人不理我，最后联系上了一个学长，帮我查了，录取已通过！

果然，4月27号下午接到了深圳的电话(第一次跟hr小姐姐交流)，一路恩，对，同意。我的春招之旅也就告一段落。

总结：

1.  感觉腾讯的招聘有一些幸运吧，没问我一些计算机，网络等基础知识，算法也没问，也没让手写代码，就这么过了。
2.  感觉研究生好多啊，我加的群里面大部分都是研究生，本科找个实习也不容易啊，不过研究生薪资应该比本科生高，所以公司也会考虑性价比的

最后，附上我的[简历](https://xiao555.github.io/Resume/), 我语言表达能力可能差一些，说的可能比较随意，欢迎提出意见。
