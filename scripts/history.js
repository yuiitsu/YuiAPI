/**
 * Created by onlyfu on 2017/9/6.
 */

var History = {
    host: '',
    listKey: 'history_list',
    dataKey: 'history_data',
    hostCacheKey: 'host_list',
    /**
     * 添加数据
     * @param url
     * @param requestType
     * @param apiName
     * @param data
     * @param result
     * @param time
     */
    add: function(url, requestType, apiName, data, result, time) {
        // 获取host
        this.host = Common.getHost(url);
        var dataHashKey = Common.md5(url);
        //
        var historyData = this.getData();
        historyData[dataHashKey] = {
            host: this.host,
            type: requestType,
            url: url,
            name: apiName,
            data: data,
            result: result,
            time: time
        };
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
        //
        this.load();
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
        var hashData = this.getListData(this.listKey);
        var historyData = this.getData();
        var hostData = this.getListData(this.hostCacheKey);
        var _html = [];
        if (hashData) {
            var len = hashData.length;
            for (var i = len - 1; i >=0; i--) {
                var key = hashData[i];
                if (historyData.hasOwnProperty(key)) {
                    var _htmlItem = '<tr data-key="' + key + '">' +
                        '<td class="request-type request-type-' + historyData[key]['type'] + '">' +
                        historyData[key]['type'] +
                        '</td>' +
                        '<td>' + historyData[key]['name'] + '</td>' +
                        '<td>' + historyData[key]['url'] + '</td>' +
                        '<td><i class="mdi mdi-delete history-del"></i></td>' +
                        '</tr>';
                    _html.push(_htmlItem);
                } else {
                    console.log('no kye: ' + key);
                }
            }
        }
        $('#history-content > table').html(_html.join(""));
        //
        if (hostData) {
            _html = [];
            for (var i in hostData) {
                var select = '';
                if (this.host === hostData[i]) {
                    select = 'selected="selected"';
                }
                _html.push('<option value="'+ hostData[i] +'" '+ select +'>'+ hostData[i] +'</option>');
            }
            $('#host-select').html(_html.join(""));
        }
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
    }
};
