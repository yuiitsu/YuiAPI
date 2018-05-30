/**
 * 事件监听父类
 * Created by Yuiitsu on 2018/05/25.
 */
let Event = {

    extend: function(name, func) {
        func.prototype = View;
        this[name] = new func();
    },

    /**
     * 执行监听
     */
    init: function() {
        for (let i in this) {
            if (this[i].hasOwnProperty('event')) {
                this['listen'](this[i]);
                console.log('[Event] %s is listening.', i);
            }
        }
    },

    listen: function(obj) {
        for (let i in obj.event) {
            obj.event[i]();
        }
    }
};

$(function() {
    Event.init();
});
