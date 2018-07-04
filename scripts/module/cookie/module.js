/**
 * cookie module
 * Created by onlyfu on 2018/06/06.
 */
App.extend('cookies', function() {
    /**
     * 初始化
     */
    this.init = function() {
    };

    /**
     * 获取指定host所有的cookies
     * @param host
     * @param callback
     */
    this.get_all = function(host, callback) {
        chrome.cookies.getAll({
            url: host
        }, function(cookies) {
            callback(cookies)
        });
    };

    /**
     * 移队cookie
     * @param host
     * @param name
     * @param callback
     */
    this.remove = function(host, name, callback) {
        if (!host || !name) {
            return false;
        }

        chrome.cookies.remove({
            url: host,
            name: name
        }, function(res) {
            callback(res);
        });
    }
});

