/**
 * Created by onlyfu on 2017/9/6.
 */
App.module.extend('history', function() {

    let self = this;
    let trimCount = 5;

    let isQuotaExceeded = function(error) {
        return error && (error.name === 'QuotaExceededError' ||
            error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            error.code === 22 || error.code === 1014);
    };

    let getStorageSnapshot = function(keys) {
        let snapshot = {};
        for (let i = 0; i < keys.length; i++) {
            snapshot[keys[i]] = localStorage.getItem(keys[i]);
        }
        return snapshot;
    };

    let restoreStorageSnapshot = function(snapshot) {
        let keys = Object.keys(snapshot);
        try {
            for (let i = 0; i < keys.length; i++) {
                localStorage.removeItem(keys[i]);
            }
            for (let i = 0; i < keys.length; i++) {
                if (snapshot[keys[i]] !== null) {
                    localStorage.setItem(keys[i], snapshot[keys[i]]);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };
    this.host =  '';
    this.listKey = 'history_list';
    this.dataKey = 'history_data';
    this.hostCacheKey = 'host_list';
    this.assert_key = 'assert_data';
    this.assert_default_key = 'assert_default_data';
    this.search_key = '';
    this.history_tab_key = 'history_tab';
    this.history_tab_active_key = 'history_tab_active';
    this.tabs = [];
    this.tabDrafts = {};
    this.activeTabKey = '';
    this.tabsReady = false;

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
        this.initTabs();
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
        if (historyData[dataHashKey]) {
            params['group_id'] = historyData[dataHashKey]['group_id'] ? historyData[dataHashKey]['group_id'] : 0;
        }
        historyData[dataHashKey] = params;
        historyData[dataHashKey]['host'] = this.host;

        let historyHashData = this.getListData(this.listKey);
        let index = historyHashData.indexOf(dataHashKey);
        if (index !== -1) {
            historyHashData.splice(index, 1);
        }
        historyHashData.push(dataHashKey);

        // assertion
        let assertResult = this.get_obj_data(this.assert_key);
        if (params['assertion_data']) {
            assertResult[dataHashKey] = params['assertion_data'];
        }

        if (!this.saveHistory(historyData, historyHashData, assertResult, dataHashKey)) {
            this.module.common.notification('Unable to save history data.', 'danger');
            return false;
        }

        Model.set('hostList', this.getHostList());
        this.syncTabAfterSave(dataHashKey, params, historyData);
        // 渲染history list
        this.renderHistoryList();
        return true;
    };

    /**
     * Save all related history indexes together. If storage is full, remove the
     * oldest records from the same in-memory data that will be retried.
     */
    this.saveHistory = function(historyData, historyList, assertData, currentKey) {
        let storageKeys = [this.dataKey, this.listKey, this.hostCacheKey, this.assert_key],
            snapshot = getStorageSnapshot(storageKeys),
            seen = {};

        // Repair stale indexes and orphaned data left by earlier quota failures.
        for (let i = historyList.length - 1; i >= 0; i--) {
            let key = historyList[i];
            if (!historyData.hasOwnProperty(key) || seen.hasOwnProperty(key)) {
                historyList.splice(i, 1);
            } else {
                seen[key] = true;
            }
        }
        for (let key in historyData) {
            if (historyData.hasOwnProperty(key) && !seen.hasOwnProperty(key)) {
                delete historyData[key];
            }
        }
        for (let key in assertData) {
            if (assertData.hasOwnProperty(key) && !seen.hasOwnProperty(key)) {
                delete assertData[key];
            }
        }

        while (true) {
            let hostList = this.buildHostList(historyData, historyList);
            try {
                localStorage.setItem(this.dataKey, JSON.stringify(historyData));
                localStorage.setItem(this.listKey, JSON.stringify(historyList));
                localStorage.setItem(this.hostCacheKey, JSON.stringify(hostList));
                if (Object.keys(assertData).length > 0) {
                    localStorage.setItem(this.assert_key, JSON.stringify(assertData));
                } else {
                    localStorage.removeItem(this.assert_key);
                }
                return true;
            } catch (error) {
                if (!isQuotaExceeded(error)) {
                    console.error(error);
                    restoreStorageSnapshot(snapshot);
                    return false;
                }

                let removed = 0;
                while (historyList.length > 0 && removed < trimCount) {
                    let removeIndex = historyList[0] === currentKey ? 1 : 0;
                    if (removeIndex >= historyList.length) {
                        break;
                    }
                    let removeKey = historyList.splice(removeIndex, 1)[0];
                    delete historyData[removeKey];
                    delete assertData[removeKey];
                    removed++;
                }

                // The current record cannot fit even after every older record is removed.
                if (removed === 0) {
                    restoreStorageSnapshot(snapshot);
                    return false;
                }
            }
        }
    };

    this.buildHostList = function(historyData, historyList) {
        let hostList = [];
        for (let i = 0; i < historyList.length; i++) {
            let item = historyData[historyList[i]],
                host = item ? item['host'] : '';
            if (host && hostList.indexOf(host) === -1) {
                hostList.push(host);
            }
        }
        return hostList;
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
            return true;
        } catch (e) {
            let historyKeys = [this.dataKey, this.listKey, this.hostCacheKey, this.assert_key];
            if (isQuotaExceeded(e) && historyKeys.indexOf(key) === -1 && this.clearPre()) {
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                    return true;
                } catch (retryError) {
                    console.error(retryError);
                }
            } else {
                console.error(e);
            }
        }
        return false;
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
        this.detachHistoryTabs([key]);
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
        this.detachHistoryTabs(delHistoryKey);
        //
        Model.set('hostList', hostList);
        Model.set('historyList', JSON.stringify(historyData));
    };

    /**
     * 清除较早数据
     */
    this.clearPre = function() {
        let list = this.getListData(this.listKey),
            data = this.getData(),
            assertData = this.get_obj_data(this.assert_key),
            removeCount = Math.min(trimCount, list.length),
            removedKeys = list.splice(0, removeCount),
            snapshot = getStorageSnapshot([
                this.dataKey, this.listKey, this.hostCacheKey, this.assert_key
            ]),
            activeKeys = {};

        if (removedKeys.length === 0) {
            return false;
        }

        for (let i = 0; i < removedKeys.length; i++) {
            delete data[removedKeys[i]];
            delete assertData[removedKeys[i]];
        }
        for (let i = 0; i < list.length; i++) {
            activeKeys[list[i]] = true;
        }
        for (let key in data) {
            if (data.hasOwnProperty(key) && !activeKeys.hasOwnProperty(key)) {
                delete data[key];
            }
        }
        for (let key in assertData) {
            if (assertData.hasOwnProperty(key) && !activeKeys.hasOwnProperty(key)) {
                delete assertData[key];
            }
        }

        try {
            localStorage.setItem(this.dataKey, JSON.stringify(data));
            localStorage.setItem(this.listKey, JSON.stringify(list));
            localStorage.setItem(this.hostCacheKey, JSON.stringify(this.buildHostList(data, list)));
            if (Object.keys(assertData).length > 0) {
                localStorage.setItem(this.assert_key, JSON.stringify(assertData));
            } else {
                localStorage.removeItem(this.assert_key);
            }
            this.detachHistoryTabs(removedKeys);
            return true;
        } catch (error) {
            console.error(error);
            restoreStorageSnapshot(snapshot);
            return false;
        }
    };
    /**
     * 清除所有数据
     */
    this.clearAll = function() {
        let historyKeys = this.getListData(this.listKey);
        localStorage.removeItem(this.dataKey);
        localStorage.removeItem(this.listKey);
        localStorage.removeItem(this.hostCacheKey);
        localStorage.removeItem(this.assert_key);
        this.detachHistoryTabs(historyKeys);
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

    this.getTabMeta = function(key, requestData, isDraft) {
        requestData = requestData || {};
        return {
            key: key,
            hash: key,
            name: requestData['name'] || '',
            url: requestData['url'] || '',
            type: requestData['type'] || 'GET',
            draft: isDraft === true
        };
    };

    this.initTabs = function() {
        let historyData = this.getData(),
            storedTabs = this.getListData(this.history_tab_key),
            result = [];

        for (let i = 0; i < storedTabs.length; i++) {
            let key = storedTabs[i]['key'] || storedTabs[i]['hash'];
            if (key && historyData.hasOwnProperty(key)) {
                result.push(this.getTabMeta(key, historyData[key], false));
            }
        }

        this.tabs = result;
        this.activeTabKey = localStorage.getItem(this.history_tab_active_key) || '';
        if (!this.hasTab(this.activeTabKey)) {
            this.activeTabKey = this.tabs.length > 0 ? this.tabs[this.tabs.length - 1]['key'] : '';
        }
        this.tabsReady = true;
        this.renderTabs();
    };

    this.restoreTabs = function() {
        if (!this.tabsReady) {
            this.initTabs();
        }
        if (this.activeTabKey && this.hasTab(this.activeTabKey)) {
            this.activateTab(this.activeTabKey, false, true);
        } else {
            this.newTab(false);
        }
    };

    this.hasTab = function(key) {
        for (let i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i]['key'] === key) {
                return true;
            }
        }
        return false;
    };

    this.getTabIndex = function(key) {
        for (let i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i]['key'] === key) {
                return i;
            }
        }
        return -1;
    };

    this.persistTabs = function() {
        let storedTabs = [];
        for (let i = 0; i < this.tabs.length; i++) {
            if (!this.tabs[i]['draft']) {
                storedTabs.push(this.tabs[i]);
            }
        }
        try {
            localStorage.setItem(this.history_tab_key, JSON.stringify(storedTabs));
            if (this.activeTabKey && !/^draft-/.test(this.activeTabKey)) {
                let activeIndex = this.getTabIndex(this.activeTabKey);
                if (activeIndex !== -1 && !this.tabs[activeIndex]['draft']) {
                    localStorage.setItem(this.history_tab_active_key, this.activeTabKey);
                } else {
                    localStorage.removeItem(this.history_tab_active_key);
                }
            } else {
                localStorage.removeItem(this.history_tab_active_key);
            }
        } catch (error) {
            console.error(error);
        }
    };

    this.renderTabs = function() {
        if (!this.tabsReady) {
            return;
        }
        self.view.display('history', 'history_tab', {
            list: this.tabs,
            activeKey: this.activeTabKey
        }, '#tabbar');
    };

    this.saveActiveTabDraft = function() {
        if (!this.activeTabKey || !this.hasTab(this.activeTabKey) ||
            !this.module.form || !this.module.form.capture_request) {
            return false;
        }
        let state = this.module.form.capture_request(),
            index = this.getTabIndex(this.activeTabKey);
        this.tabDrafts[this.activeTabKey] = state;
        if (index !== -1) {
            let meta = this.getTabMeta(
                this.activeTabKey,
                state['requestData'],
                this.tabs[index]['draft']
            );
            this.tabs[index] = meta;
        }
        this.persistTabs();
        this.renderTabs();
        return true;
    };

    this.canChangeTabs = function() {
        if (Model.get('sending')) {
            this.module.common.notification('Wait for the current request to finish.', 'warring');
            return false;
        }
        return true;
    };

    this.createDraftKey = function() {
        let key = 'draft-' + Date.now();
        while (this.hasTab(key)) {
            key += '-1';
        }
        return key;
    };

    this.newTab = function(saveCurrent) {
        if (!this.canChangeTabs()) {
            return false;
        }
        if (saveCurrent !== false) {
            this.saveActiveTabDraft();
        }
        let key = this.createDraftKey();
        let requestData = this.module.form.get_empty_request();
        this.tabs.push(this.getTabMeta(key, requestData, true));
        this.tabDrafts[key] = {requestData: requestData, responseData: ''};
        this.activeTabKey = key;
        this.persistTabs();
        this.renderTabs();
        this.module.form.load_request(requestData, '');
        return key;
    };

    this.openTab = function(key) {
        if (!this.canChangeTabs()) {
            return false;
        }
        let historyData = this.getData();
        if (!historyData.hasOwnProperty(key)) {
            return false;
        }
        if (this.activeTabKey === key && this.hasTab(key)) {
            return true;
        }
        if (this.activeTabKey !== key) {
            this.saveActiveTabDraft();
        }
        if (!this.hasTab(key)) {
            this.tabs.push(this.getTabMeta(key, historyData[key], false));
        }
        return this.activateTab(key, false, true);
    };

    this.activateTab = function(key, saveCurrent, forceLoad) {
        if (!this.canChangeTabs()) {
            return false;
        }
        if (!this.hasTab(key)) {
            return false;
        }
        if (saveCurrent !== false && this.activeTabKey !== key) {
            this.saveActiveTabDraft();
        }
        if (this.activeTabKey === key && forceLoad !== true) {
            return true;
        }

        this.activeTabKey = key;
        this.persistTabs();
        this.renderTabs();

        if (this.tabDrafts.hasOwnProperty(key)) {
            let state = this.tabDrafts[key];
            this.module.form.load_request(state['requestData'], state['responseData']);
            return true;
        }
        return this.loadHistoryData(key);
    };

    this.closeTab = function(key) {
        if (!this.canChangeTabs()) {
            return false;
        }
        let index = this.getTabIndex(key);
        if (index === -1) {
            return false;
        }
        let wasActive = this.activeTabKey === key;
        this.tabs.splice(index, 1);
        delete this.tabDrafts[key];

        if (!wasActive) {
            this.persistTabs();
            this.renderTabs();
            return true;
        }

        this.activeTabKey = '';
        if (this.tabs.length === 0) {
            this.newTab(false);
        } else {
            let nextIndex = Math.min(Math.max(index - 1, 0), this.tabs.length - 1);
            this.activateTab(this.tabs[nextIndex]['key'], false, true);
        }
        return true;
    };

    this.detachHistoryTabs = function(keys) {
        if (!this.tabsReady || !keys || keys.length === 0) {
            return;
        }
        if (keys.indexOf(this.activeTabKey) !== -1) {
            this.saveActiveTabDraft();
        }
        for (let i = this.tabs.length - 1; i >= 0; i--) {
            if (keys.indexOf(this.tabs[i]['key']) !== -1) {
                if (this.tabDrafts.hasOwnProperty(this.tabs[i]['key'])) {
                    this.tabs[i]['draft'] = true;
                } else {
                    this.tabs.splice(i, 1);
                }
            }
        }
        if (!this.hasTab(this.activeTabKey)) {
            this.activeTabKey = '';
        }
        this.persistTabs();
        this.renderTabs();
    };

    this.syncTabAfterSave = function(key, requestData, historyData) {
        if (!this.tabsReady) {
            return;
        }
        let oldKey = this.activeTabKey,
            oldIndex = this.getTabIndex(oldKey),
            existingIndex = this.getTabIndex(key);

        if (existingIndex !== -1 && existingIndex !== oldIndex) {
            if (this.tabDrafts.hasOwnProperty(key)) {
                let preservedKey = this.createDraftKey(),
                    preservedState = this.tabDrafts[key];
                this.tabs[existingIndex] = this.getTabMeta(
                    preservedKey,
                    preservedState['requestData'],
                    true
                );
                this.tabDrafts[preservedKey] = preservedState;
                delete this.tabDrafts[key];
            } else {
                this.tabs.splice(existingIndex, 1);
                if (existingIndex < oldIndex) {
                    oldIndex--;
                }
            }
        }

        let meta = this.getTabMeta(key, requestData, false);
        if (oldIndex === -1) {
            this.tabs.push(meta);
        } else {
            this.tabs[oldIndex] = meta;
        }
        if (oldKey) {
            delete this.tabDrafts[oldKey];
        }
        delete this.tabDrafts[key];
        this.activeTabKey = key;

        for (let i = this.tabs.length - 1; i >= 0; i--) {
            let tab = this.tabs[i];
            if (!tab['draft'] && !historyData.hasOwnProperty(tab['key'])) {
                if (this.tabDrafts.hasOwnProperty(tab['key'])) {
                    tab['draft'] = true;
                } else {
                    this.tabs.splice(i, 1);
                }
            }
        }
        this.persistTabs();
        this.renderTabs();
    };

    this.loadHistoryData = function(key) {
        let historyData = self.getData();
        if (!historyData[key]) {
            return false;
        }
        let data = historyData[key],
            responseData = {
                headers: data['headers'] || '',
                response: data['result'],
                responseContentType: data['response_content_type'] || '',
                use_time: data['time'],
                status: data['status']
            };
        self.module.form.load_request(data, responseData);
        return true;
    };

    this.open_data = function(key) {
        return this.openTab(key);
    };
});
