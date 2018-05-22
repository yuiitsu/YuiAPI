/**
 * Created by onlyfu on 2017/9/6.
 */

let History = {
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
        let dataHashKey = Common.md5(params['url']);
        //
        let historyData = this.getData();
        historyData[dataHashKey] = params;
        historyData[dataHashKey]['host'] = this.host;
        this.setItem(this.dataKey, historyData);
        //
        let historyHashData = this.getListData(this.listKey);
        let index = historyHashData.indexOf(dataHashKey);
        if (index !== -1) {
            historyHashData.splice(index, 1);
        }
        historyHashData.push(dataHashKey);
        this.setItem(this.listKey, historyHashData);
        //
        let hostData = this.getListData(this.hostCacheKey);
        if (hostData.indexOf(this.host) === -1) {
            hostData.push(this.host);
        }
        if (hostData.length > 0) {
            this.setItem(this.hostCacheKey, hostData);
        }

        // assertion
        if (params['assertion_data']) {
            let assert_result = this.get_obj_data(this.assert_key);
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

    /**
     *
     */
    set_default_assert: function() {
        let default_assert_data = this.get_default_assert();
        if (!$.isEmptyObject(default_assert_data)) {
            let assert_type = default_assert_data['type'],
                assert_content = default_assert_data['content'];
            if (assert_type) {
                $('input[name=form-data-assert-type]').attr('checked', false).each(function () {
                    let value = $(this).val();
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
        this.build_ui_list(null);
    },

    /**
     * 构建host list界面
     */
    build_host_ui_list: function() {
        let host_list = this.get_host_list();
        View.display('history', 'sidebar', host_list, '#history-sidebar');
    },

    /**
     * 构建界面List
     * @param data 数据，没有值使用所有数据
     * @param host 指定host数据
     */
    build_ui_list: function(data, host) {
        let hashData = this.getListData(this.listKey),
            historyData = data ? data : this.getData(),
            list = [],
            _html = [];

        if (hashData) {
            let len = hashData.length;
            for (let i = len - 1; i >=0; i--) {
                let key = hashData[i];
                if (historyData.hasOwnProperty(key)) {
                    if (host && historyData[key]['host'] !== host) {
                        continue;
                    }
                    historyData[key]['key'] = key;
                    list.push(historyData[key]);
                }
            }
        }
        View.display('history', 'main_list', list, '#history-list-box');

        // 显示历史数据条数，有host的情况下，显示到对应的host位置，没有，则显示在all位置
        let history_count = list.length;
        if (!host) {
            $('#history-count-all').text(history_count);
        } else {
            $('#history-host').find('li').each(function() {
                let data_host = $(this).attr('data-host');
                if (host === data_host) {
                    let target = $(this).find('em.history-count');
                    if (target.length === 0) {
                        $(this).find('span').append(' <em class="history-count">('+ history_count +')</em>');
                    } else {
                        target.text('(' + history_count + ')');
                    }
                }
            });
        }
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
        let result = null;
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
        let result = null;
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
        let result = null;
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
        let historyData = this.getData();
        for (let i in historyData) {
            if (i === key) {
                delete historyData[i];
            }
        }
        this.setItem(this.dataKey, historyData);
        //
        let hashData = this.getListData(this.listKey);
        for (let i in hashData) {
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
        let host_list = this.get_host_list();
        for (let i in host_list) {
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
        let list = this.getListData(this.listKey);
        if (list.length <= 5) {
            // 全部清除
            this.clearAll();
        } else {
            // 清除最早5条
            let data = this.getData();
            for (let i = 0; i < 5; i++) {
                let key = list[i];
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
            let search_key = $.trim(_obj.val());

            if (search_key) {
                let search_key_list = search_key.split(' '),
                    result_data = {},
                    history_list = this.getData();

                if (history_list) {
                    for (let i in history_list) {
                        let name = history_list[i]['name'],
                            url = history_list[i]['url'];

                        for (let j in search_key_list) {
                            let key = search_key_list[j],
                                is_searched = false;

                            if (name.indexOf(key) !== -1) {
                                history_list[i]['name'] = name.replace(key, '<span class="search-block">' + key + '</span>');
                                is_searched = true;
                            }

                            if (url.indexOf(key) !== -1) {
                                history_list[i]['url'] = url.replace(key, '<span class="search-block">' + key + '</span>');
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
        }
    }
};
