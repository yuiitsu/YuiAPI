/**
 * Created by onlyfu on 2017/9/6.
 */
App.module.extend('history', function() {

    let self = this;
    this.host =  '';
    this.listKey = 'history_list';
    this.dataKey = 'history_data';
    this.hostCacheKey = 'host_list';
    this.assert_key = 'assert_data';
    this.assert_default_key = 'assert_default_data';
    this.search_key = '';
    this.history_tab_key = 'history_tab';

    // 默认数据
    Model.default['historyList'] = '=1';
    Model.default['hostList'] = [];
    Model.default['selectHost'] = '';
    Model.default['searchKey'] = '';
    Model.default['folderGroup'] = '[]';

    /**
     * 模块初始化. 入口方法，加载模块时会立即执行
     */
    this.init = function() {
        // 数据监听
        Model.set('historyList', Model.default.historyList).watch('historyList', this.renderHistoryList);
        Model.set('selectHost', Model.default.selectHost).watch('selectHost', this.renderHistoryList);
        Model.set('searchKey', Model.default.searchKey).watch('searchKey', this.renderHistoryList);
        Model.set('folderGroup', Model.default.folderGroup).watch('folderGroup', this.renderHistoryList);
        // 初始化数据
        this.initData();

    };

    /**
     * 初始化数据，从缓存中获取数据，放入数据对象
     */
    this.initData = function() {
        let hostList = this.getHostList(),
            historyList = this.getHistoryList(null, null);

        // Set Data
        Model.set('hostList', hostList);
        Model.set('historyList', historyList);
    };

    /**
     * 渲染History List
     */
    this.renderHistoryList = function() {
        // host列表
        let selectHost = Model.get('selectHost'),
            historyList = self.getHistoryList(null, selectHost),
            historyListLen = historyList.length,
            searchKey = Model.get('searchKey'),
            searchKeyList = searchKey.split(' '),
            searchKeyListLen = searchKeyList.length,
            groupList = JSON.parse(Model.get('groupList')),
            folderGroup = JSON.parse(Model.get('folderGroup')),
            resultList = [],
            groupHistoryList = ['default'],
            groupHistory = {},
            data = {
                groupHistoryList: [],
                searchKey: searchKey,
                selectHost: selectHost,
                folderGroup: folderGroup
            };

        //

        // Search
        if (searchKey && historyList.length > 0) {
            for (let i = 0; i < historyListLen; i++) {
                let name = historyList[i]['name'],
                    url = historyList[i]['url'];

                for (let j = 0; j < searchKeyListLen; j++) {
                    let key = searchKeyList[j],
                        isSearched = '';

                    if (name.indexOf(key) !== -1) {
                        isSearched = 'name';
                    }

                    if (url.indexOf(key) !== -1) {
                        isSearched = 'url';
                    }

                    if (isSearched) {
                        resultList.push(historyList[i]);
                        switch (isSearched) {
                            case 'name':
                                resultList[resultList.length - 1]['name'] =
                                    resultList[resultList.length - 1]['name']
                                        .replace(key, '<span class="history-search-block">' + key + '</span>');
                                break;
                            case 'url':
                                resultList[resultList.length - 1]['originUrl'] =
                                    resultList[resultList.length - 1]['url'];
                                resultList[resultList.length - 1]['url'] =
                                    resultList[resultList.length - 1]['url']
                                        .replace(key, '<span class="history-search-block">' + key + '</span>');
                                break;
                        }
                    }
                }
            }
        } else {
            resultList = historyList;
        }

        // 根据group分组
        let groupListLen = groupList.length,
            resultListLen = resultList.length,
            groupObject = {};

        for (let i = 0; i < groupListLen; i++) {
            groupObject[groupList[i]['group_id']] = groupList[i];
        }
        //
        for (let i = 0; i < resultListLen; i++) {
            let groupId = resultList[i]['group_id'];
            groupId = groupId ? groupId : 'default';
            if (groupHistoryList.indexOf(groupId) === -1) {
                groupHistoryList.push(groupId);
            }
            if (!groupObject.hasOwnProperty(groupId)) {
                groupId = 'default';
            }
            if (!groupHistory.hasOwnProperty(groupId)) {
                let groupName = 'default';
                if (groupObject.hasOwnProperty(groupId)) {
                    groupName = groupObject[groupId]['name'];
                    //
                    for (let g = 0; g < groupListLen; g++) {
                        if (groupList[g] && groupList[g]['group_id'] === groupId) {
                            delete groupList[g];
                        }
                    }
                }
                groupHistory[groupId] = {
                    groupName: groupName,
                    groupId: groupId,
                    historyList: []
                };
            }
            groupHistory[groupId]['historyList'].push(resultList[i]);
        }

        let groupHistoryListLen = groupHistoryList.length;
        for (let i = 0; i < groupHistoryListLen; i++) {
            if (groupHistory.hasOwnProperty(groupHistoryList[i])) {
                data.groupHistoryList.push(groupHistory[groupHistoryList[i]]);
            }
        }

        //
        if (groupList.length > 0) {
            let notUseGroupListLen = groupList.length;
            for (let i = 0; i < notUseGroupListLen; i++) {
                if (groupList[i]) {
                    data.groupHistoryList.push({
                        groupName: groupList[i]['name'],
                        groupId: groupList[i]['group_id'],
                        historyList: []
                    });
                }
            }
        }
        self.view.display('history', 'main', data, '.history-container');
    };

    /**
     * 渲染host下拉菜单
     */
    this.renderHostList = function($target) {
        let hostList = Model.get('hostList');
        let _html = self.view.getView('history', 'hostList', hostList);
        self.module.common.tips.show($target, _html, {
            width: '279px',
            height: '200px'
        });
    };

    /**
     * 根据host过滤history list
     */
    this.filterHistoryListByHost = function() {
        let selectHost = Model.get('selectHost'),
            historyList = self.getHistoryList(null, selectHost);

        Model.set('historyList', historyList);
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
        this.host = this.module.common.getHost(params['url']);
        let dataHashKey = this.module.common.md5(params['url']);
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

        // 渲染history list
        this.renderHistoryList();
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
     * 获取历史记录数，可根据host筛选
     * @param data
     * @param host
     * @param group_id
     * @param search_key
     * @returns {Array}
     */
    this.getHistoryList = function(data, host, group_id, search_key) {
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
     * 获取host list
     * @returns {*|Array}
     */
    this.getHostList = function() {
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
            console.error(e);
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
        let hashList = this.getListData(this.listKey),
            hashListLen = hashList.length;
        for (let i = 0; i < hashListLen; i++) {
            if (hashList[i] === key) {
                hashList.splice(i, 1);
            }
        }
        this.setItem(this.listKey, hashList);
        //
        Model.set('historyList', JSON.stringify(historyData));
    };

    /**
     * 删除host
     * @param host
     */
    this.delHost = function(host) {
        let hostList = this.getHostList(),
            hostListLen = hostList.length;
        for (let i = 0; i < hostListLen; i++) {
            if (hostList[i] === host) {
                hostList.splice(i, 1);
            }
        }
        this.setItem(this.hostCacheKey, hostList);

        // 删除host对应数据
        let delHistoryKey = [];
        let historyData = this.getData();
        for (let i in historyData) {
            if (historyData[i]['host'] === host) {
                delete historyData[i];
                delHistoryKey.push(i);
            }
        }
        this.setItem(this.dataKey, historyData);
        // 删除数据list中对应的数据
        let hashList = this.getListData(this.listKey),
            hashListLen = hashList.length;

        for (let i = 0; i < hashListLen; i++) {
            if (delHistoryKey.indexOf(hashList[i]) !== -1) {
                hashList.splice(i, 1);
            }
        }
        this.setItem(this.listKey, hashList);
        //
        Model.set('hostList', hostList);
        Model.set('historyList', JSON.stringify(historyData));
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
     * Search
     * @param key
     */


    /**
     * 添加到分组
     * @param historyKey
     * @param groupId
     */
    this.moveToGroup = function(historyKey, groupId) {
        if (!historyKey) {
            this.module.common.notification('Error: arguments error.', 'danger');
            return false;
        }

        //
        let historyData = this.getData();
        for (let i in historyData) {
            if (i === historyKey) {
                historyData[i]['group_id'] = groupId;
            }
        }

        this.setItem(this.dataKey, historyData);
        //
        let historyList = this.getHistoryList(null, null);
        Model.set('historyList', historyList);
        //
        this.module.common.notification('save ok.');
    };

    this.open_data = function(key) {
        let historyData = self.getData();
        if (historyData[key]) {
            let requestType = historyData[key]['type'],
                form_data_type = historyData[key]['data_type'] ? historyData[key]['data_type'] : 'form-data',
                headers = historyData[key]['headers'],
                response_content_type = historyData[key]['response_content_type'],
                result = historyData[key]['result'],
                time = historyData[key]['time'],
                status = historyData[key]['status'];

            let response_data = {
                'headers': headers ? headers : '',
                'response': result,
                'responseContentType': response_content_type,
                'use_time': time,
                'status': status
            };
            Model.set('responseData', response_data);
            Model.set('requestFormType', form_data_type);
            Model.set('requestFormTypeTmp', form_data_type);
            Model.set('requestData', historyData[key]);
            Model.set('requestData_' + form_data_type, historyData[key]['data']);
            Model.set('requestHeaders', historyData[key]['request_headers'] ? historyData[key]['request_headers'] : {});
            Model.set('authentication', historyData[key]['authentication']);
        }
    };
});
