/**
 * background js
 */
App.extend('background', function() {

    let self = this;

    /**
     * 登录成功，处理用户登录信息缓存
     */
    this.login_success = function() {};

    /**
     * 入口方法，加载文件时会立刻执行
     */
    this.init = function() {
        // 打开主界面
        chrome.browserAction.onClicked.addListener(function (tab) {
            chrome.tabs.create({url: chrome.extension.getURL("index.html")});
        });

        // 监听content script请求
        chrome.extension.onRequest.addListener(function(request, _, sendResponse){

            if ($.isFunction(self[request.method])) {
                self[request.method](request, sendResponse);
            } else {
                sendResponse({
                    'returnValue': 1,
                    'returnMsg': '未找到执行方法'
                });
            }
        });
    }
});