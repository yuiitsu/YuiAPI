![](https://raw.githubusercontent.com/yuiitsu/YuiAPI/master/images/yuiapi-logo-128.png)
# YuiAPI
YuiAPI是一个浏览器扩展，非常简单易用的API调试客户端，你可以随意的使用它。



## 目录
1. [当前版本](#当前版本)
2. [支持浏览器](#支持浏览器)
3. [安装](#安装)

    3.1 [安全的线上版本](#安全的线上版本)
    
    3.2 [离线版本](#离线版本)
    
4. [使用](#使用)

    4.1 [根据HOST筛选历史记录](#根据host筛选历史记录)
    
    4.2 [快速切换API的HOST](#快递切换api的host)
    
    4.3 [快速获取/编辑请求参数](#快速获取/编辑请求参数)
    
    4.4 [编辑URL PARAMS](#编辑url-params)



## 当前版本
v1.1.16 [Update logs](https://www.yuiapi.com)

## 支持浏览器

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](#)<br/> Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://addons.mozilla.org/en-US/firefox/addon/yuiapi/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome |
| --------- | --------- | --------- |
| Edge| latest versions| latest versions|

## 安装
### 安全的线上版本
请在Chrome/Firefox扩展商品搜索YuiAPI进行安装，或点击上面浏览器小图标

### 离线版本
请打开Chrome的**开发者模式**，然后**加载已解压的扩展程序**

## 使用
### 根据HOST筛选历史记录
请求过的API HOST都会在左侧的列表里，选择点击一个HOST，右侧就会只出现该HOST的历史记录
![image](https://www.colorgamer.com/usr/uploads/2019/04/2217338312.png)
### 快速切换API的HOST
点击API URI左而的小图标，会打开已有HOST列表，选择点击一个HOST，表单中的API URL的HOST将会被替换
![image](https://www.colorgamer.com/usr/uploads/2019/04/2279524444.png)
### 快速获取/编辑请求参数
点击Body参数右侧的Edit Parameter，会打开参数编辑对话框，如图
![image](https://www.colorgamer.com/usr/uploads/2019/04/1400452174.png)
该表单支持两个种模式的参数
- query string形式。如：a=1&b=2
- 键值对形式。每一行为一组键值对，键值用英文的:号分隔

如果你使用Chrome浏览器，在开发者工具里，可以直接复制参数，如下：
![image](http://www.colorgamer.com/usr/uploads/2018/10/2993757704.png)

如果Body参数表单里已有参数，它们也会出现在该对话框的文本框里，复制到别处或是编辑都可
### 编辑URL PARAMS
如果你的URL上是带参数的，可以直接在Params表单里进行查看和编辑。在表单里编辑和直接在URL上编辑都会相互更新。想像一下，当API URL很长时，这个表单是多么的贴心
![image](https://www.colorgamer.com/usr/uploads/2019/04/417386759.png)
