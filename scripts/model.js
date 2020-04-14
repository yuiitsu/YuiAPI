/**
 * 数据监听
 * Created by Yuiitsu on 2018/05/30.
 */
let Model = {
    default: {},
    data: {},

    /**
     * set data
     * @param key
     * @param value
     * @returns {Model}
     */
    set: function(key, value) {
        let value_type = Object.prototype.toString.call(value);
        switch (value_type) {
            case '[object Object]':
                this.default[key] = Object.assign({}, value);
                this.data[key] = Object.assign({}, value);
                break;
            case '[object Array]':
                this.default[key] = Object.assign([], value);
                this.data[key] = Object.assign([], value);
                break;
            default:
                this.default[key] = value;
                this.data[key] = value;
                break;
        }
        return this;
    },

    /**
     * get data
     * @param key
     * @returns {*}
     */
    get: function(key) {
        return this.data[key];
    },

    /**
     * 监听数据变化
     * @param target
     * @param callback
     */
    watch: function(target, callback) {
        let _this = this;
        Object.defineProperty(this.default, target, {
            set: function(value) {
                _this.data[target] = value;
                callback(value);
                // let value_type = Object.prototype.toString.call(value);
                // let target_type = Object.prototype.toString.call(_this.data[target]);
                // if (value_type !== target_type) {
                //     _this.data[target] = value;
                //     callback(value);
                // } else {
                //     if (value_type === '[object String]' || value_type === '[object Number]') {
                //         if (value !== _this.data[target]) {
                //             _this.data[target] = value;
                //             callback(value);
                //         }
                //     } else if (value_type === '[object Array]' || value_type === '[object Object]') {
                //         let value_length = value_type === '[object Object]' ? _this.object_length(value) : value.length;
                //         let target_length = value_type === '[object Object]' ? _this.object_length(_this.data[target]) : _this.data[target].length;
                //         if (value_length !== target_length) {
                //             _this.data[target] = value;
                //             callback(value);
                //         } else {
                //             for (const i in value) {
                //                 if (!_this.data[target].hasOwnProperty(i) || value[i] !== _this.data[target][i]) {
                //                     _this.data[target] = value;
                //                     callback(value);
                //                     break;
                //                 }
                //             }
                //         }
                //     }
                // }
            }
        });
    },

    /**
     * 获取对象长度
     * @param target
     * @returns {number}
     */
    object_length: function(target) {
        let len = 0;
        for (let i in target) {
            len++;
        }
        return len;
    }
};
