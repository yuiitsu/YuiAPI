/**
 * YuiApi
 * @Author: onlyfu
 * @Date: 2017-07-07
 */
let App = {
    requestType: 'GET',
    host: '',

    run: function() {
        // 获取历史记录
        History.init_interface();
        // 获取测试记录
        Test.init();
        // 默认断言
        History.set_default_assert();

        for (let i in this) {
            if (this[i].hasOwnProperty('init')) {
                this[i]['init']();
                console.log('[Module] %s init.', i);
            }
        }
    },

    /**
     * 继承
     * @param name
     * @param func
     */
    extend: function(name, func) {
        func.prototype = View;
        this[name] = new func();
    }
};

$(function() {
    App.run();
});
