/**
 * Created by onlyfu on 2017/9/6.
 */

var History = {
    host: '',
    listKey: 'history_list',
    dataKey: 'history_data',
    hostCacheKey: 'host_list',
    assert_key: 'assert_data',
    assert_default_key: 'assert_default_data',
    /**
     * 添加数据
     * @param params
     *      params['url']
     *      params['type']
     *      params['name']
     *      params['data']
     *      params['result']
     *      params['time']
     *      params['status']
     *      params['assertion_data']
     */
    add: function(params) {
        // 获取host
        this.host = Common.getHost(params['url']);
        var dataHashKey = Common.md5(params['url']);
        //
        var historyData = this.getData();
        historyData[dataHashKey] = params;
        historyData[dataHashKey]['host'] = this.host;
        this.setItem(this.dataKey, historyData);
        //
        var historyHashData = this.getListData(this.listKey);
        var index = historyHashData.indexOf(dataHashKey);
        if (index !== -1) {
            historyHashData.splice(index, 1);
        }
        historyHashData.push(dataHashKey);
        this.setItem(this.listKey, historyHashData);
        //
        var hostData = this.getListData(this.hostCacheKey);
        if (hostData.indexOf(this.host) === -1) {
            hostData.push(this.host);
        }
        if (hostData.length > 0) {
            this.setItem(this.hostCacheKey, hostData);
        }

        // assertion
        if (params['assertion_data']) {
            var assert_result = this.get_obj_data(this.assert_key);
            assert_result[dataHashKey] = params['assertion_data'];
            this.setItem(this.assert_key, assert_result);
        }

        //
        this.load();
    },

    /**
     * 保存默认断言
     * @param data
     */
    save_default_assert: function(data) {
        this.setItem(this.assert_default_key, data);
    },

    set_default_assert: function() {
        var default_assert_data = this.get_default_assert();
        if (!$.isEmptyObject(default_assert_data)) {
            var assert_type = default_assert_data['type'];
            var assert_content = default_assert_data['content'];
            if (assert_type) {
                $('input[name=form-data-assert-type]').attr('checked', false).each(function () {
                    var value = $(this).val();
                    if (value === assert_type) {
                        $(this).prop('checked', 'checked');
                        $(this).attr('checked', true);
                    }
                });
                $('#form-data-assert').text(assert_content);
                //$('input[name=form-data-assert-type]').each()
            }
        }
    },

    /**
     * 存储数据
     * @param key
     * @param data
     */
    setItem: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                this.clearPre();
                localStorage.setItem(key, JSON.stringify(data));
            }
        }
    },
    /**
     * 构建history列表
     */
    load: function() {
        // host列表
        this.build_host_ui_list();
        //$('#history-host').append(host_list_html.join(""));
        //
        this.build_ui_list(null);
        //$('#history-content').find('tbody').html(_html.join(""));
        //$('#history-count').html(_html.length);
        //
        //if (hostData) {
        //    _html = [];
        //    for (var i in hostData) {
        //        var select = '';
        //        if (this.host === hostData[i]) {
        //            select = 'selected="selected"';
        //        }
        //        _html.push('<option value="'+ hostData[i] +'" '+ select +'>'+ hostData[i] +'</option>');
        //    }
        //    $('#host-select').html(_html.join(""));
        //}
    },

    /**
     * 构建host list界面
     * @param replace
     */
    build_host_ui_list: function(replace) {
        var host_list = this.get_host_list();
        var len = host_list.length,
            _html = [];
        for (var i = 0; i < len; i++) {
            var _html_item = '<li data-host="'+ host_list[i] +'">' +
                    '<span>'+ host_list[i] +'</span>' +
                    '<i class="mdi mdi-close"></i>' +
                '</li>';
            _html.push(_html_item);
        }
        if (replace) {
            $('#history-host').html(_html.join(""));
        } else {
            $('#history-host').append(_html.join(""));
        }
    },

    /**
     * 构建界面LISt
     * @returns {Array}
     */
    build_ui_list: function(data, host) {
        var hashData = this.getListData(this.listKey);
        var historyData = data ? data : this.getData();
        var _html = [];
        if (hashData) {
            var len = hashData.length;
            for (var i = len - 1; i >=0; i--) {
                var key = hashData[i];
                if (historyData.hasOwnProperty(key)) {
                    if (host && historyData[key]['host'] !== host) {
                        continue;
                    }
                    var request_type_icon = historyData[key]['type'] ? historyData[key]['type'][0] : '-';
                    //var url = historyData[key]['url'].replace(historyData[key]['host'], '');
                    var _htmlItem = '<tr data-key="' + key + '">' +
                        '<td class="w-30 history-item-action" data-key="' + key + '">' +
                            '<i class="mdi mdi-dots-horizontal font-size-20"></i>' +
                        '</td>' +
                        '<td class="w-50 align-center request-type request-type-' + historyData[key]['type'] + '">' +
                            '<span>' + request_type_icon + '</span>' +
                        '</td>' +
                        '<td>' + historyData[key]['name'] + '</td>' +
                        '<td>' + historyData[key]['url'] + '</td>';
                    _html.push(_htmlItem);
                } else {
                    console.log('no kye: ' + key);
                }
            }
        }

        $('#history-content').find('tbody').html(_html.join(""));
        $('#history-count').html(_html.length);
        //return _html;
    },

    /**
     * 获取host list
     * @returns {*|Array}
     */
    get_host_list: function() {
        return this.getListData(this.hostCacheKey);
    },

    /**
     * 获取历史list数据
     * @returns {*|Array}
     */
    getHistoryListData: function() {
        return this.getListData(this.listKey);
    },

    /**
     * 获取断言数据
     * @returns {*|{}}
     */
    get_assert_data: function() {
        return this.get_obj_data(this.assert_key);
    },

    /**
     * 获取默认断言数据
     * @returns {*|{}}
     */
    get_default_assert: function() {
        return this.get_obj_data(this.assert_default_key);
    },


    /**
     * 获取字典数据
     * @returns {{}}
     */
    getData: function() {
        var result = null;
        try {
            result =  JSON.parse(localStorage.getItem(this.dataKey));
        } catch (e) {
        }

        return result ? result : {};
    },

    /**
     * 获取列表数据
     * @param key
     * @returns {Array}
     */
    getListData: function(key) {
        var result = null;
        try {
            result =  JSON.parse(localStorage.getItem(key));
        } catch (e) {
        }

        return result ? result : [];
    },

    /**
     * 获取对象数据
     * @param key
     * @returns {{}}
     */
    get_obj_data: function(key) {
        var result = null;
        try {
            result =  JSON.parse(localStorage.getItem(key));
        } catch (e) {
        }

        return result ? result : {};
    },

    /**
     * 删除数据
     * @param key
     */
    del: function(key) {
        //var historyDataTmp = {};
        var historyData = this.getData();
        for (var i in historyData) {
            if (i === key) {
                delete historyData[i];
            }
        }
        this.setItem(this.dataKey, historyData);
        //
        var hashData = this.getListData(this.listKey);
        for (var i in hashData) {
            if (hashData[i] === key) {
                hashData.splice(i, 1);
            }
        }
        this.setItem(this.listKey, hashData);
        //
        this.load();
    },

    /**
     * 删除host
     * @param host
     */
    del_host: function(host) {
        var host_list = this.get_host_list();
        for (var i in host_list) {
            if (host_list[i] === host) {
                host_list.splice(i, 1);
            }
        }
        this.setItem(this.hostCacheKey, host_list);
        //
        //this.build_host_ui_list('replace');
    },

    /**
     * 清除较早数据
     */
    clearPre: function() {
        var list = this.getListData(this.listKey);
        if (list.length <= 5) {
            // 全部清除
            this.clearAll();
        } else {
            // 清除最早5条
            var data = this.getData();
            for (var i = 0; i < 5; i++) {
                var key = list[i];
                delete data[key];
            }
            list.splice(0, 5);
            localStorage.setItem(this.dataKey, JSON.stringify(data));
            localStorage.setItem(this.listKey, JSON.stringify(list));
        }
    },
    /**
     * 清除所有数据
     */
    clearAll: function() {
        localStorage.removeItem(this.dataKey);
        localStorage.removeItem(this.listKey);
        localStorage.removeItem(this.hostCacheKey);
    },
    /**
     * 搜索
     * @param _obj
     * @param e
     */
    search: function(_obj, e) {
        if (e.keyCode === 13) {
            var search_key = $.trim(_obj.val());

            if (search_key) {
                var search_key_list = search_key.split(' ');
                var result_data = {};
                var history_list = this.getData();
                if (history_list) {
                    for (var i in history_list) {
                        var name = history_list[i]['name'];
                        var url = history_list[i]['url'];
                        for (var j in search_key_list) {
                            var key = search_key_list[j];
                            var is_searched = false;
                            if (name.indexOf(key) !== -1) {
                                history_list[i]['name'] = name.replace(key, '<span class="search-block">' + key + '</span>')
                                is_searched = true;
                            }

                            if (url.indexOf(key) !== -1) {
                                history_list[i]['url'] = url.replace(key, '<span class="search-block">' + key + '</span>')
                                is_searched = true;
                            }

                            if (is_searched) {
                                result_data[i] = history_list[i];
                            }
                        }
                    }
                }
            }

            this.build_ui_list(result_data);
            //$('#history-content').find('tbody').html(_html.join(""));
            //$('#history-count').html(_html.length);
        }
    }
};
