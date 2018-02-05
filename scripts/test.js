/**
 * Created by onlyfu on 2017/11/28.
 */

var Test = {
    firstListKey: 'test_first_list',
    normalListKey: 'test_normal_list',
    success: 0,
    failed: 0,

    init: function() {
        var firstTestNum = this.loadFirstListData();
        var normalTestNum = this.loadNormalListData();
        var testNum = firstTestNum + normalTestNum;
        $('#test-total-num').html(testNum);
    },

    /**
     * 全部加入普通测试组
     */
    allAdd: function() {
        var historyListData = History.getHistoryListData();
        this.setItem(this.normalListKey, historyListData);
        this.init();
    },

    /**
     * 加入前置测试组
     * @param hashKey
     */
    firstAdd: function(hashKey) {
        var listData = Common.cache.getListData(this.firstListKey);
        if (listData.indexOf(hashKey) === -1) {
            listData.push(hashKey);
        }
        this.setItem(this.firstListKey, listData);
        this.init();
    },

    /**
     * 加载普通测试组
     * @param hashKey
     */
    normalAdd: function(hashKey) {
        var listData = Common.cache.getListData(this.normalListKey);
        if (listData.indexOf(hashKey) === -1) {
            listData.push(hashKey);
        }
        this.setItem(this.normalListKey, listData);
        this.init();
    },

    /**
     * 加载前置测试组
     */
    loadFirstListData: function() {
        var listData = Common.cache.getListData(this.firstListKey);
        var _html = this.buildHtmlList(listData);
        $('.test-first-list-table').find('tbody').html(_html);
        return listData.length;
    },

    /**
     * 加载正常测试组数据
     */
    loadNormalListData: function() {
        var listData = Common.cache.getListData(this.normalListKey);
        var _html = this.buildHtmlList(listData);
        $('.test-normal-list-table').find('tbody').html(_html);
        return listData.length;
    },

    /**
     * 构建HTMl列表
     * @param listData
     * @returns {Array}
     */
    buildHtmlList: function(listData) {
        var historyData = History.getData();
        var _html = [];
        if (listData) {
            var len = listData.length;
            for (var i in listData) {
                var key = listData[i];
                if (historyData.hasOwnProperty(key)) {
                    var _htmlItem = '<tr data-key="' + key + '">' +
                        '<td class="w-30"><i class="mdi mdi-close test-del"></i></td>' +
                        '<td class="w-50 align-center request-type request-type-' + historyData[key]['type'] + '">' +
                            '<span>' + historyData[key]['type'][0] + '</span>' +
                        '</td>' +
                        '<td class="w-200">' + historyData[key]['name'] + '</td>' +
                        '<td>' + historyData[key]['url'] + '</td>' +
                        '<td class="w-50 align-center"></td>' +
                        '<td class="w-50 align-center test-item test-item-'+ key +'">' +
                            '<i class="mdi mdi-loading mdi-spin hide"></i>' +
                            '<i class="mdi mdi-check-circle-outline hide"></i>' +
                            '<i class="mdi mdi-close-circle-outline hide"></i>' +
                        '</td>' +
                        '</tr>';
                    _html.push(_htmlItem);
                } else {
                    console.log('no kye: ' + key);
                }
            }
        }
        return _html;
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
                //this.clearPre();
                localStorage.setItem(key, JSON.stringify(data));
            }
        }
    },

    /**
     * 删除前置测试组数据
     * @param key
     */
    delFirst: function(key) {
        this.del(key, this.firstListKey);
        this.loadFirstListData();
    },

    /**
     * 删除正常测试组数据
     * @param key
     */
    delNormal: function(key) {
        this.del(key, this.normalListKey);
        this.loadNormalListData();
    },

    /**
     * 删除数据
     * @param key
     * @param cacheKey
     */
    del: function(key, cacheKey) {
        var hashData = Common.cache.getListData(cacheKey);
        for (var i in hashData) {
            if (hashData[i] === key) {
                hashData.splice(i, 1);
            }
        }
        this.setItem(cacheKey, hashData);
    },

    /**
     * 清除数据
     */
    clear: function(type) {
        switch (type) {
            case "first":
                localStorage.removeItem(this.firstListKey);
                this.loadFirstListData();
                break;
            case "normal":
                localStorage.removeItem(this.normalListKey);
                this.loadNormalListData();
                break;
        }
        Common.notification('clear success');
        this.init();
    },

    /**
     * 开始测试
     */
    startTest: function(callback) {
        var self = this;
        // init
        this.success = 0;
        this.failed = 0;
        $('#test-success').text(0);
        $('#test-failed').text(0);

        var historyData = History.getData();
        // assert
        var assert_data = History.get_assert_data();

        $('.test-item').find('i').hide();

        var first_list = Common.cache.getListData(this.firstListKey),
            normal_list = Common.cache.getListData(this.normalListKey),
            test_list = first_list.concat(normal_list),
            test_list_len = test_list.length,
            index = 0;

        // 创建进度条
        var bar_obj = $('.test-progress-bar');
        var bar_html = [];
        for (var i = 0; i < test_list_len; i++) {
            bar_html.push('<div class="test-progress-bar-item"><div></div></div>')
        }
        bar_obj.html(bar_html.join(''));

        // 进度条宽度
        var bar_width = bar_obj.outerWidth();
        var bar_item_width = bar_width / test_list_len;

        var get_item = function() {
            test_list_len--;
            var key = test_list[index];
            index++;
            if (historyData.hasOwnProperty(key)) {
                return {'key': key, 'iconItem': $('.test-item-' + key)}
            }

            return false;
        };

        var run = function()  {
            if (test_list_len <= 0) {
                callback();
                return;
            }

            var item = get_item();
            if (item) {
                var key = item['key'],
                    iconItem = item['iconItem'];

                self.request(historyData[key], key, iconItem, function(status) {
                    var color = status ? '#00ff00' : '#ff0000';
                    $('.test-progress-bar-item').eq(index - 1).css('background-color', color).animate({'width': bar_item_width});
                }, assert_data);
            }

            setTimeout(function() {
                run();
            }, 500)
        };

        run();
    },

    /**
     * 请求数据
     * @param data
     * @param key
     * @param iconItem
     * @param callback
     * @param assert_data
     */
    request: function(data, key, iconItem, callback, assert_data) {
        var _this = this;
        var requestType = data['type'];
        var loadingItem = iconItem.find('.mdi-loading');
        var successItem = iconItem.find('.mdi-check-circle-outline');
        var failedItem = iconItem.find('.mdi-close-circle-outline');
        loadingItem.show();
        Common.request(data.url, {'type': requestType, async: 'false'}, data.data, function(res) {

            var use_assert_data = '';
            if (assert_data.hasOwnProperty(key) && assert_data[key]) {
                use_assert_data = assert_data[key];
            } else {
                use_assert_data = History.get_default_assert();
            }

            if (use_assert_data) {
                var assert_type = use_assert_data['type'];
                var assert_content = use_assert_data['content'];
                if (assert_type === 'Json') {
                    assert_content = JSON.parse(assert_content);

                    var assert_status = true;
                    for (var i in assert_content) {
                        if (!res.hasOwnProperty(i)) {
                            assert_status = false;
                        } else {
                            if (res[i] !== assert_content[i]) {
                                assert_status = false;
                            }
                        }
                    }

                    if (assert_status) {
                        _this.success++;
                        _this.setSuccessNum(_this.success);
                        successItem.show();
                        callback(true);
                    } else {
                        _this.failed++;
                        _this.setFailedNum(_this.failed);
                        failedItem.show();
                        callback(false);
                    }
                }
            }

            iconItem.attr('data-result', JSON.stringify(res));
            loadingItem.hide();
        });
    },

    /**
     * 设置成功数
     * @param num
     */
    setSuccessNum: function(num) {
        $('#test-success').html(num);
    },

    /**
     * 设置失败数
     * @param num
     */
    setFailedNum: function(num) {
        $('#test-failed').html(num);
    }
};
