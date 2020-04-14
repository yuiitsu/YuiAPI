/**
 * CES
 * @Author: onlyfu
 * @Date: 2018-10-23
 */
let App = {
    /**
     * module
     */
    module: {
        /**
         * 继承
         * @param name
         * @param func
         */
        extend: function(name, func) {
            func.prototype = App;
            this[name] = new func();
        },

        /**
         * Call Module Method
         * @param name
         * @param method
         * @param params
         */
        call: function(name, method, params) {
            if (!this.hasOwnProperty(name)) {
                App.log('Error: ' + name + ' not existed');
                return false;
            }

            if (!this[name].hasOwnProperty(method)) {
                App.log('Error: ' + method + ' not existed in ' + name);
                return false;
            }

            try {
                this[name][method](params);
            } catch (e) {
                App.log(e);
            }
        },

        run: function() {
            // 初始化界面
            // 加载module
            for (let i in this) {
                if (this.hasOwnProperty(i)) {
                    if (this[i].hasOwnProperty('init')) {
                        this[i]['init']();
                        App.log('[Module] '+ i +' init.');
                    }
                }
            }
        }
    },

    event: {
        /**
         * 
         */
        extend: function(name, func) {
            func.prototype = App;
            this[name] = new func();
        },

        /**
         * 执行监听
         */
        init: function() {
            for (let i in this) {
                if (this.hasOwnProperty(i)) {
                    if (this[i].hasOwnProperty('event')) {
                        this['listen'](this[i]);
                        App.log('[Event] ' + i + ' is listening.');
                    }
                }
            }
        },

        listen: function(obj) {
            for (let i in obj.event) {
                if (obj.event.hasOwnProperty(i)) {
                    obj.event[i]();
                }
            }
        },

        addListener: function(node) {

        }
    },

    view: {
        /**
         * 渲染页面
         * @param model
         * @param name
         * @param data
         * @param target
         */
        display: function(model, name, data, target) {
            this.eval_view_func(model, name);
            let container = target ? $(target) : $('body');
            container.html(this[model + "." + name].init(data));
        },

        append: function(model, name, data, target) {
            this.eval_view_func(model, name);
            let container = target ? $(target) : $('body');
            container.append(this[model + "." + name].init(data));
        },

        /**
         * 获取模板内容
         * @param name
         * @param method
         * @param data
         */
        getView: function(name, method, data) {
            this.eval_view_func(name, method);
            return this[name + '.' + method].init(data);
        },

        /**
         * 继承
         * @param name
         * @param func
         */
        extend: function(name, func) {
            func.prototype = App;
            this[name] = new func();
        },

        /**
         * 创建View方法
         * @param model
         * @param name
         */
        eval_view_func: function(model, name) {
            let key = model + "." + name;
            if (!this.hasOwnProperty(key)) {
                let content = this[model][name](),
                    _html = [];
                let txt = ["App.view.extend('"+ model +"."+name+"', function() {"];
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
                // will be executed during development mode.
                let f = (new Function('return function v() {' + txt.join('') + '}'))();
                f();
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
    },

    //background_listening: function() {
    //    chrome.extension.onMessage.addListener(function(request, _, response) {
    //        let module = request.callback_module,
    //            method = request.callback_method,
    //            res = request.response;
    //        console.log(res);
    //        if ($.isFunction(App.module[module][method])) {
    //            App.module[module][method](res);
    //        } else {
    //            self.log('method '+ method +' not exist.');
    //        }
    //    });
    //},
    /**
     * this.browser.onMessage(callback);
     * this.browser.sendMessage(callback);
     */
    browser:  {
        onMessage: function() {
            var browser = this.getBrowser();
            if (!this.environment.hasOwnProperty(browser)) {
                App.log('not found browser api: ' + browser);
                return false;
            }
            this.environment[browser]['onMessage']();
        },
        sendMessage: function(message) {
            var browser = this.getBrowser();
            if (!this.environment.hasOwnProperty(browser)) {
                App.log('not found browser api: ' + browser);
                return false;
            }
            this.environment[browser]['sendMessage'](message);
        },
        environment: {
            chrome: {
                onMessage: function() {
                    // chrome.extension.onMessage.addListener(function(request, _, response) {
                    chrome.runtime.onMessage.addListener(function(request, _, response) {
                        let module = request.module, 
                            method = request.method, 
                            data = request.data;
                        if (App.module.hasOwnProperty(module) && App.module[module].hasOwnProperty(method)) {
                            App.module[module][method](data, response);
                        } else {
                            App.log('module: '+ module +', method: '+ method +' not exist.');
                        }
                        response({});
                    });
                },
                sendMessage: function(message) {
                    chrome.runtime.sendMessage(message, function(res) {
                        console.log(res);
                    });
                },
                sendMessageTabs: function(module, method) {
                    chrome.tabs.sendMessage(tab_id, {
                        'module': module,
                        'method': method,
                    }, function (response) {
                    });
                }
            },
            firefox: {
                onMessage: function() {
                    browser.runtime.onMessage.addListener(function(request, _, response) {
                        let module = request.module, 
                            method = request.method,
                            data = request.data;
                        if (App.module.hasOwnProperty(module) && App.module[module].hasOwnProperty(method)) {
                            App.module[module][method](data, response);
                        } else {
                            App.log('module: '+ module +', method: '+ method +' not exist.');
                        }
                        response({});
                    });
                },
                sendMessage: function(message) {
                    console.log(message);
                    browser.runtime.sendMessage(message).then(function(res) {}, function(err){});
                },
                sendMessageTabs: function(module, method) {
                    browser.tabs.sendMessage(tab_id, {
                        'module': module,
                        'method': method,
                    }, function (response) {
                    });
                }
            },
        },
        getBrowser: function() {
            let userAgent = window.navigator.userAgent, 
                browser = '';
            if (userAgent.match(/Chrome\//)) {
                browser = 'chrome';
            } else if (userAgent.match(/Firefox\//)) {
                browser = 'firefox';
            }
            return browser;
        }
    },
    // checkBrowser: function() {
    //     let userAgent = window.navigator.userAgent;
    //     if (userAgent.match(/Chrome\//)) {
    //         App.browser = 'chrome';
    //     } else if (userAgent.match(/Firefox\//)) {
    //         App.browser = 'firefox';
    //     }
    // },

    log: function(msg) {
        console.log('[CES]', msg);
    },

    run: function() {
        // this.checkBrowser();
        this.module.run();
        this.event.init();
        //this.background_listening();
    }
};

$(function() {
    App.run();
});