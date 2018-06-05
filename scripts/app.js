/**
 * YuiApi
 * @Author: onlyfu
 * @Date: 2017-07-07
 */
let App = {
    requestType: 'GET',
    host: '',

    run: function() {
        // 获取测试记录
        //Test.init();

        for (let i in this) {
            if (this.hasOwnProperty(i)) {
                if (this[i].hasOwnProperty('init')) {
                    this[i]['init']();
                    console.log('[Module] %s init.', i);
                }
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
