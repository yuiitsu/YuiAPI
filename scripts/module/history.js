/**
 * Created by onlyfu on 2017/9/6.
 */
App.extend('history', function() {

    this.host =  '';
    this.listKey = 'history_list';
    this.dataKey = 'history_data';
    this.hostCacheKey = 'host_list';
    this.assert_key = 'assert_data';
    this.assert_default_key = 'assert_default_data';
    this.selected_host = '';
    this.search_key = '';

    this.init = function() {
        this.init_interface();
    };

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
    this.add = function(params) {
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

        // 刷新host和history list
        if($('#history-list-box').length > 0) {
            this.refresh_history_list();
            this.refresh_host_list();
        } else {
            this.init_interface();
        }

        // 加入分组
        if (params['group_id']) {
            App.group.add_history(params['group_id'], dataHashKey);
        }
    };

    /**
     * 保存默认断言
     * @param data
     */
    this.save_default_assert = function(data) {
        this.setItem(this.assert_default_key, data);
    };

    /**
     *
     */
    this.set_default_assert = function() {
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
    };

    /**
     * 存储数据
     * @param key
     * @param data
     */
    this.setItem = function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                this.clearPre();
                localStorage.setItem(key, JSON.stringify(data));
            }
        }
    };

    /**
     * 初始化界面
     */
    this.init_interface = function() {
        // host列表
        let host_list = this.get_host_list();
        let history_list = this.get_history_list(null, null);
        let data = {
            host_list: host_list,
            history_list: history_list
        };
        View.display('history', 'main', data, '#history-content');
        this.show_history_count(history_list);
    };

    /**
     * 刷新host list界面
     */
    this.refresh_host_list = function() {
        let host_list = this.get_host_list(),
            _this = this;
        View.display('history', 'host_list', host_list, '#history-host');
        if (this.selected_host) {
            $('#history-host').find('li').each(function() {
                let host = $(this).attr('data-host');
                if (host === _this.selected_host) {
                    $(this).find('span').trigger('click');
                }
            });
        }
    };

    /**
     * 刷新history list界面
     * @param host
     * @param group_id
     * @param key
     */
    this.refresh_history_list = function(host, group_id, key) {
        let history_list = this.get_history_list(null, host, group_id, key);
        View.display('history', 'main_list', history_list, '#history-list-box');
    };

    /**
     * 获取历史记录数，可根据host筛选
     * @param data
     * @param host
     * @param group_id
     * @param search_key
     * @returns {Array}
     */
    this.get_history_list = function(data, host, group_id, search_key) {
        let hashData = this.getListData(this.listKey),
            historyData = data ? data : this.getData(),
            list = [];

        if (hashData) {
            let len = hashData.length;
            for (let i = len - 1; i >=0; i--) {
                let key = hashData[i];
                if (historyData.hasOwnProperty(key)) {
                    if (host && historyData[key]['host'] !== host) {
                        continue;
                    }
                    if (group_id && historyData[key]['group_id'] !== group_id) {
                        continue;
                    }
                    if (search_key && (search_key.indexOf(key) === -1)) {
                        continue;
                    }
                    historyData[key]['key'] = key;
                    list.push(historyData[key]);
                }
            }
        }
        return list;
    };

    /**
     * 构建界面List
     * @param data 数据，没有值使用所有数据
     * @param host 指定host数据
     */
    this.build_ui_list = function(data, host) {
        if (host) {
            this.selected_host = host;
        }
        let list = this.get_history_list(data, host);
        View.display('history', 'main_list', list, '#history-list-box');

        // 显示历史数据条数，有host的情况下，显示到对应的host位置，没有，则显示在all位置
        this.show_history_count(list, host);
    };

    /**
     * 显示历史记录数量
     * @param list
     * @param host
     */
    this.show_history_count = function(list, host) {
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
    };

    /**
     * 获取host list
     * @returns {*|Array}
     */
    this.get_host_list = function() {
        return this.getListData(this.hostCacheKey);
    };

    /**
     * 获取历史list数据
     * @returns {*|Array}
     */
    this.getHistoryListData = function() {
        return this.getListData(this.listKey);
    };

    /**
     * 获取断言数据
     * @returns {*|{}}
     */
    this.get_assert_data = function() {
        return this.get_obj_data(this.assert_key);
    };

    /**
     * 获取默认断言数据
     * @returns {*|{}}
     */
    this.get_default_assert = function() {
        return this.get_obj_data(this.assert_default_key);
    };


    /**
     * 获取字典数据
     * @returns {{}}
     */
    this.getData = function() {
        let result = null;
        try {
            result =  JSON.parse(localStorage.getItem(this.dataKey));
        } catch (e) {
        }

        return result ? result : {};
    };

    /**
     * 获取列表数据
     * @param key
     * @returns {Array}
     */
    this.getListData = function(key) {
        let result = null;
        try {
            result =  JSON.parse(localStorage.getItem(key));
        } catch (e) {
        }

        return result ? result : [];
    };

    /**
     * 获取对象数据
     * @param key
     * @returns {{}}
     */
    this.get_obj_data = function(key) {
        let result = null;
        try {
            result =  JSON.parse(localStorage.getItem(key));
        } catch (e) {
        }

        return result ? result : {};
    };

    /**
     * 删除数据
     * @param key
     */
    this.del = function(key) {
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
        this.refresh_history_list();
    };

    /**
     * 删除host
     * @param host
     */
    this.del_host = function(host) {
        let host_list = this.get_host_list();
        for (let i in host_list) {
            if (host_list[i] === host) {
                host_list.splice(i, 1);
            }
        }
        this.setItem(this.hostCacheKey, host_list);
        this.refresh_host_list();
    };

    /**
     * 清除较早数据
     */
    this.clearPre = function() {
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
    };
    /**
     * 清除所有数据
     */
    this.clearAll = function() {
        localStorage.removeItem(this.dataKey);
        localStorage.removeItem(this.listKey);
        localStorage.removeItem(this.hostCacheKey);
    };
    /**
     * 搜索
     * @param _obj
     * @param e
     */
    this.search = function(_obj, e) {
        if (e.keyCode === 13) {
            let search_key = $.trim(_obj.val()),
                result_data = {};

            if (search_key) {
                this.search_key = search_key;
                let search_key_list = search_key.split(' '),
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
    };

    /**
     * 添加到分组
     * @param history_key
     * @param group_id
     */
    this.add_to_group = function(history_key, group_id) {
        if (!history_key || !group_id) {
            Common.notification('Error: arguments error.', 'danger');
            return false;
        }

        App.group.add_history(group_id, history_key);
        Common.notification('save ok.');
    };
});
