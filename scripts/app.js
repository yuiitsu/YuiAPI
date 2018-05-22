/**
 * YuiApi
 * @Author: onlyfu
 * @Date: 2017-07-07
 */
let App = {
    requestType: 'GET',
    host: '',
    init: function() {
        // 获取历史记录
        History.load();
        // 获取测试记录
        Test.init();
        // 默认断言
        History.set_default_assert();
        // 表单
        this.form.init();
    },

    /**
     * 表单
     */
    form: {
        init: function() {
            View.display('form', 'form', {}, '#form-data-form');
        }
    }
};

$(function() {
    App.init();
});
