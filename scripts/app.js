/**
 * UnRestClient
 * @Author: onlyfu
 * @Date: 2017-07-07
 */
var App = {
    requestType: 'GET',
    host: '',
    init: function() {
        // 获取历史记录
        History.load();
        this.listenEvent();
    },

    /**
     * 获取表单数据
     * @returns {{}}
     */
    getFormParams: function() {
        var selectObj = $('.form-select');
        var keyObj = $('.form-key');
        var valueObj = $('.form-value');
        var result = {};
        var i = 0;
        selectObj.each(function() {
            if($(this).is(":checked")) {
                var key = $.trim(keyObj.eq(i).val());
                if (key) {
                    result[key] = $.trim(valueObj.eq(i).val());
                }
            }
            i++;
        });
        return result;
    },
    /**
     * 监听事件
     */
    listenEvent: function() {
        var self = this;
        //
        $('.tabs li').click(function() {
            var id = $(this).attr('data-id');
            $('.tabs li').removeClass('focus');
            $(this).addClass('focus');
            $('.left-content').addClass('hide');
            $('#' + id).removeClass('hide');
        });
        //
        $('#form-data').on('input', '.form-data-item', function() {
            var parent = $(this).parent().parent();
            if (parent.index() + 1 === $('#form-data > tr').length) {
                // 创建新的一行
                var _htmlItem = '<tr>' +
                            '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                            '<td><input type="text" class="form-key form-data-item input-text" value="" /> </td>' +
                            '<td><input type="text" class="form-value form-data-item input-text" value="" /> </td>' +
                        '</tr>';
                $('#form-data').append(_htmlItem);
            }
        });
        // history记录项删除
        $('.history-table').on('click', '.history-del', function(e) {
            if (confirm('确定要删除该数据吗？')) {
                var hashKey = $(this).parent().parent().attr('data-key');
                if (hashKey) {
                    History.del(hashKey);
                }
            }
            e.stopPropagation();
        });
        // history记录项点击事件
        $('.history-table').on('click', 'tr', function() {
            var key = $(this).attr('data-key');
            // 从缓存中获取数据
            var historyData = History.getData();
            if (historyData[key]) {
                var url = historyData[key]['url'];
                var requestType = historyData[key]['type'];
                var data = historyData[key]['data'];
                var result = historyData[key]['result'];
                var apiName = historyData[key]['name'];
                var time = historyData[key]['time'];
                $('#request-type').html(requestType);
                self.requestType = requestType;
                $('#url').val(url);
                $('#result').html(Common.syntaxHighlight(JSON.stringify(result, undefined, 4)));
                $('#api-name').val(apiName);
                $('#send-time').html(time);
                $('.tabs li').eq(0).click();
                // 显示参数
                var _html = [];
                for (var i in data) {
                    var _htmlItem = '<tr>' +
                                '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                                '<td><input type="text" class="form-key form-data-item input-text" value="'+ i +'" /> </td>' +
                                '<td><input type="text" class="form-value form-data-item input-text" value="'+ data[i] +'" /> </td>' +
                            '</tr>';
                    _html.push(_htmlItem);
                }
                _html.push('<tr>' +
                            '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                            '<td><input type="text" class="form-key form-data-item input-text" value="" /> </td>' +
                            '<td><input type="text" class="form-value form-data-item input-text" value="" /> </td>' +
                        '</tr>');
                if (_html.length > 0) {
                    $('#form-data').html(_html.join(""));
                }
                // host
                var host = Common.getHost(url);
                $('#host-select').val(host);
            }
        });
        // 选择host
        $('#host-select').change(function() {
            var urlObject = $('#url');
            var value = $(this).val();
            var url = $.trim(urlObject.val());
            var host = Common.getHost(url);
            urlObject.val(url.replace(host, value));
        });
        // 提交
        $('#send').click(function() {
            var $this = $(this);
            var url = $.trim($('#url').val());
            var type = $('#request-type').val();
            var apiName = $.trim($('#api-name').val());
            if (url) {
                if (url.substr(0, 7) !== 'http://' && url.substr(0, 8) !== 'https://') {
                    url = 'http://' + url;
                    $('#url').val(url);
                }
                $('.tabs li').eq(0).click();
                // 获取参数
                var formData = self.getFormParams(self.requestType);
                $this.attr('disabled', true).html('<i class="mdi mdi-refresh mdi-spin"></i> 发送中...');
                Common.request(url, {'type': self.requestType}, formData, function(res) {
                    $('#result').html(Common.syntaxHighlight(JSON.stringify(res, undefined, 4)));
                    $this.attr('disabled', false).html('发送');
                    // 记录历史
                    var date = new Date();
                    var sendTime = date.toLocaleString();
                    $('#send-time').html(sendTime);
                    History.add(url, self.requestType, apiName, formData, res, sendTime);
                });
            }
        });

        // 监听请求类型选择
        this.listenRequestType();
        // 监听url选中
        this.listenUrlSelect();
    },
    listenRequestType: function() {
        var $this = this;
        $('.request-type-in').click(function() {
            $('.request-type-list').show();
        });
        $('.request-type-list > a').click(function(e) {
            var key = $(this).attr('data-key');
            $this.requestType = key;
            $('#request-type').text(key);
            $('.request-type-list').hide();
            e.preventDefault();
        });
    },
    listenUrlSelect: function() {
        $('#url').focus(function() {
            $(this).select();
        })
    }
};

$(function() {
    App.init();
});
