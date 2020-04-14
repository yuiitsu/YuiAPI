/**
 * background js
 */
App.module.extend('background', function() {

    let self = this;

    /**
     * 登录成功，处理用户登录信息缓存
     * login_user['user_id']
     * login_user['account']
     * login_user['account_type']
     * login_user['nickname']
     * login_user['avatar_url']
     * login_user['token']
     */
    this.login_success = function(login_user, send_response) {
        try {
            for (let key in login_user) {
                if (login_user.hasOwnProperty(key)) {
                    localStorage.setItem(key, login_user[key]);
                }
            }
            // 发消息通知main screen.
            let tab_id = parseInt(localStorage.getItem('current_tab_id'));
            chrome.tabs.sendMessage(tab_id, {
                // 'callback_method': callback_method,
                // 'callback_module': callback_module,
                'module': 'user',
                'method': 'check_login',
                // 'response': res,
            }, function (response) {
            });
            send_response({});
        } catch (e) {
            console.log(e);
        }
    };

    /**
     * 入口方法，加载文件时会立刻执行
     */
    this.init = function() {
        // 打开主界面
        chrome.browserAction.onClicked.addListener(function (tab) {
            chrome.tabs.create({url: chrome.extension.getURL("index.html")});
        });

        // 监听content script请求
        self.browser.onMessage();
        //
    }
});