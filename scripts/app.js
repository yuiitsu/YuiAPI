/**
 * YuiApi
 * @Author: onlyfu
 * @Date: 2017-07-07
 */
let App = {
    requestType: 'GET',
    host: '',
    selected_object: {
        type: '',
        key: ''
    },

    run: function() {
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
        //func_temp.prototype = this;
        //func.prototype = new func_temp();
        func.prototype = App;
        this[name] = new func();
    }
};

$(function() {
    App.run();
});
