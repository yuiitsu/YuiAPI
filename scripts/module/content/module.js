/**
 * Content Script
 */
App.extend('content', function() {
    //
    let self = this;

    this.init = function() {
        let target = $('#api-bridge');
        if (target.length <= 0) {
            console.log('Login Failed.');
            return false;
        }

        try {
            let login_user = JSON.parse(target.text());
            this.login(login_user);
        } catch (e) {
            console.log(e);
        }
    };

    this.login = function(login_user) {
        if (!login_user) {
            alert('Login User Info Error.');
            return false;
        }
        // 发送查询字发送到background
        let send_message = {
            method: 'login_success',
            data: login_user
        };
        chrome.extension.sendMessage(send_message, function(res) {
            console.log(res);
        });
    }
});
