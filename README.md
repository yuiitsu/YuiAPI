# YuiAPI
YuiAPI是一个基于Chrome extension，非常简单易用的API调试客户端，您可以随意的使用它。

## 目录
1. 当前版本
2. 安装

    [2.1 安全的线上版本](#安全的线上版本)
    
    [2.2 离线版本](#离线版本)
    
3. 使用 
    
    [3.1 根据HOST筛选历史记录](#根据HOST筛选历史记录)
    
    [3.2 快递切换API的HOST](#快递切换API的HOST)
    
    [3.3 快速获取/编辑请求参数](#快速获取/编辑请求参数)
    
    [3.4 编辑URL PARAMS](#编辑URL PARAMS)

## 当前版本
v0.8.1 [Update logs](https://www.yuiapi.com)

1 调整UI
- 调整了表单的背景颜色
- 移除History列表的Name列，name值合到url的上方

2 新功能
- 增加了Authentication Basic类型的设置
- 增加了URL上参数的编辑设置

## 安装
### 安全的线上版本
请直接使用Chrome在线商店安装：[https://chrome.google.com/webstore/detail/yuiapi-a-rest-client-api/bnmefgocpeggmnpkglmkfoidibbcogcf?utm_source=chrome-ntp-icon](https://chrome.google.com/webstore/detail/yuiapi-a-rest-client-api/bnmefgocpeggmnpkglmkfoidibbcogcf?utm_source=chrome-ntp-icon)

### 离线版本
请打开Chrome的**开发者模式**，然后**加载已解压的扩展程序**

## 使用
### 根据HOST筛选历史记录
请求过的API HOST都会在左侧的列表里，选择点击一个HOST，右侧就会只出现该HOST的历史记录
![image](http://www.colorgamer.com/usr/uploads/2018/10/1540561766.png)
### 快速切换API的HOST
点击API URI左而的小图标，会打开已有HOST列表，选择点击一个HOST，表单中的API URL的HOST将会被替换
![image](http://www.colorgamer.com/usr/uploads/2018/10/2701654315.png)
### 快速获取/编辑请求参数
点击Body参数右侧的Edit Parameter，会打开参数编辑对话框，如图
![image](http://www.colorgamer.com/usr/uploads/2018/10/1971341823.png)
该表单支持两个种模式的参数
- query string形式。如：a=1&b=2
- 键值对形式。每一行为一组键值对，键值用英文的:号分隔

如果你使用Chrome浏览器，在开发者工具里，可以直接复制参数，如下：
![image](http://www.colorgamer.com/usr/uploads/2018/10/2993757704.png)

如果Body参数表单里已有参数，它们也会出现在该对话框的文本框里，复制到别处或是编辑都可
### 编辑URL PARAMS
如果你的URL上是带参数的，可以直接在Params表单里进行查看和编辑。在表单里编辑和直接在URL上编辑都会相互更新。想像一下，当API URL很长时，这个表单是多么的贴心
![image](http://www.colorgamer.com/usr/uploads/2018/10/2385088286.png)
