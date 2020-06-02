/**
 * User Module
 */
App.module.extend('user', function() {
    //
    let self = this;

    this.init = function() {
        // this.check_login();
    };

    /**
     * 检查用户是否已登录
     */
    this.check_login = function() {
        let token = localStorage.getItem('token');
        if (token) {
            let url = 'http://www.yuiapi.com/api/v1/user/auth/info';
            self.module.common.request(url, {}, {
                'token': token
            }, function (res) {
                if (res && res.hasOwnProperty('code') && res['code'] === 0) {
                    self.view.display('user', 'is_login', res.data, '.user-login-bar');
                } else {
                    self.view.display('user', 'no_login', {}, '.user-login-bar');
                }
            });
        } else {
            self.view.display('user', 'no_login', {}, '.user-login-bar');
        }
    }
});
