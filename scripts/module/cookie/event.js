/**
 * Cookies事件监听
 * Created by Yuiitsu on 2018/06/06.
 */
Event.extend('cookies', function() {
    /**
     * 事件
     */
    this.event = {

        open_cookie_manager: function() {
            $('body').on('click', '.history-cookies', function(e) {
                let host = $(this).attr('data-host');
                App.cookies.get_all(host, function(cookies) {
                    App.common.module('Cookies', View.get_view('cookies', 'cookies_manager', {
                        'list': cookies,
                        'host': host
                    }), '');
                });
                e.stopPropagation();
            });
        },

        del: function() {
            $('body').on('click', '.cookies-del', function(e) {
                let _this = $(this),
                    host = $(this).attr('data-host'),
                    name = $(this).attr('data-name'),
                    module_id = $(this).attr('data-module-id');

                if (!host || !name) {
                    return false;
                }

                App.common.dialog().confirm('Confirm to delete the data?', function() {
                    App.cookies.remove(host, name, function (res) {
                        console.log(res);
                        _this.parent().remove();
                    });
                });
                e.stopPropagation();
            });
        }
    };
});
