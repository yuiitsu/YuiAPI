/**
 * User Module
 */
App.extend('user', function() {
    //
    let self = this;

    this.init = function() {
        // listen background script send message.
        chrome.extension.onMessage.addListener(function(request, _, response) {
            let method = request.method;
            if (self.hasOwnProperty(method)) {
                self[method]();
            } else {
                self.log('method '+ method +' not exist.');
            }
        });

        //
        // this.check_login();
        //
    };

    /**
     * 检查用户是否已登录
     */
    this.check_login = function() {
        let token = localStorage.getItem('token');
        if (token) {
            let url = 'http://www.yuiapi.com/api/v1/user/auth/info';
            App.common.request(url, {}, {
                'token': token
            }, function (res) {
                if (res && res.hasOwnProperty('code') && res['code'] === 0) {
                    View.display('user', 'is_login', res.data, '.user-login-bar');
                } else {
                    View.display('user', 'no_login', {}, '.user-login-bar');
                }
            });
        } else {
            View.display('user', 'no_login', {}, '.user-login-bar');
        }
    }
});
