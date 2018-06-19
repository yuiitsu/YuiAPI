/**
 * 模板类
 * Created by Yuiitsu on 2018/05/21.
 */
const View = {
    /**
     * 渲染页面
     * @param model
     * @param name
     * @param data
     * @param target
     */
    display: function(model, name, data, target) {
        this.eval_view_func(model, name);
        $(target).html(this[model + "." + name].init(data));
    },

    /**
     * 获取模板内容
     * @param model
     * @param name
     * @param data
     */
    get_view: function(model, name, data) {
        this.eval_view_func(model, name);
        return this[model + '.' + name].init(data);
    },
    /**
     * 继承
     * @param name
     * @param func
     */
    extend: function(name, func) {
        func.prototype = View;
        this[name] = new func();
    },

    /**
     * 创建View方法
     * @param model
     * @param name
     */
    eval_view_func: function(model, name) {
        let key = model + "." + name;
        if (!View.hasOwnProperty(key)) {
            let content = this[model][name](),
                _html = [];
            let txt = ["View.extend('"+ model +"."+name+"', function() {"];
            txt.push("this.init = function(data) {");
            txt.push("var html = '';");
            content = content.split('\n');
            for (let i in content) {
                _html.push(this.parse(content[i]));
            }
            txt.push(_html.join(""));
            txt.push("return html;");
            txt.push("}");
            txt.push("});");
            eval(txt.join(""));
        }
    },

    /**
     * 解析模板
     * @param line 行代码
     */
    parse: function(line) {
        if (!line || line === '') {
            return null;
        }
        let result = line.trim().replace(new RegExp(/'/g), "\\'"),
            parseStatus = false;

        /**
         * 解析变量
         */
        let parseData = function() {

            let item,
                patt = /\{\{ (.+?) \}\}/i;
            while (item = patt.exec(result)) {
                result = result.replace(item[0], "'+" + item[1].replace(new RegExp(/\\/g), "") + "+'");
            }
        };

        /**
         * 解析定义
         */
        let parseVer = function() {
            let item,
                patt = /\{\{ var (.+?) \}\}/i;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "var " + item[1].replace(new RegExp(/\\/g), "") + ";");
            }
        };

        /**
         * 解析条件
         */
        let parseCondition = function() {
            let item,
                patt = /\{\{ if (.+?) \}\}/i;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "if("+ item[1].replace(new RegExp(/\\/g), "") +"){");
            }

            patt = /\{\{ else if (.+?) \}\}/i;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "} else if("+ item[1].replace(new RegExp(/\\/g), "") +"){");
            }

            patt = /\{\{ else \}\}/i;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "} else {");
            }
        };

        /**
         * 解析循环
         */
        let parseLoop = function() {
            let item,
                patt = /\{\{ for (.+?) \}\}/i;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "for("+ item[1].replace(new RegExp(/\\/g), "") +"){");
            }
        };

        /**
         * 解析结束
         */
        let parseEnd = function() {
            let item,
                patt = /\{\{ end \}\}/i;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "}");
            }
        };


        parseLoop();
        parseCondition();
        parseEnd();
        parseVer();
        parseData();

        if (!parseStatus) {
            result = "html += '" + result + "';";
        }

        return result;
    }
};
