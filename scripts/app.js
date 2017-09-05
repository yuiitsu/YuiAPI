/**
 * UnRestClient
 * @Author: onlyfu
 * @Date: 2017-07-07
 * @type {{requestType: string, init: App.init, syntaxHighlight: App.syntaxHighlight, listenEvent: App.listenEvent, listenRequestType: App.listenRequestType, listenUrlSelect: App.listenUrlSelect}}
 */
var App = {
    requestType: 'GET',
    host: '',
    init: function() {
        // 获取历史记录
        this.history().load();
        this.listenEvent();
    },
    syntaxHighlight: function(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'code-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'code-key';
                } else {
                    cls = 'code-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'code-boolean';
            } else if (/null/.test(match)) {
                cls = 'code-null';
            }
            return '<span class="'+ cls +'">' + match + '</span>';
        });
    },
    getFormParams: function(requestType) {
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
    getHost: function(url) {
        var parselUrl = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
        var urlResult = parselUrl.exec(url);
        return urlResult[1] + ':' + urlResult[2] + urlResult[3] + (urlResult[4] ? ':' + urlResult[4] : '');
    },
    history: function() {
        var self = this;
        var hashKey = 'history_list';
        var cacheKey = 'history_data';
        var hostCacheKey = 'host_list';
        return {
            add: function(url, requestType, apiName, data, result, time) {
                // 获取host
                self.host = self.getHost(url);
                var dataHashKey = md5(url);
                //
                var historyData = this.getData();
                historyData[dataHashKey] = {
                    host: self.host,
                    type: requestType,
                    url: url,
                    name: apiName,
                    data: data,
                    result: result,
                    time: time
                };
                localStorage.setItem(cacheKey, JSON.stringify(historyData));
                //
                var historyHashData = this.getHashData(hashKey);
                var index = historyHashData.indexOf(dataHashKey);
                if (index !== -1) {
                    historyHashData.splice(index, 1);
                }
                historyHashData.push(dataHashKey);
                localStorage.setItem(hashKey, JSON.stringify(historyHashData));
                //
                var hostData = this.getHashData(hostCacheKey);
                if (hostData.indexOf(self.host) === -1) {
                    hostData.push(self.host);
                }
                localStorage.setItem(hostCacheKey, JSON.stringify(hostData));
                //
                this.load();
            },
            load: function() {
                var hashData = this.getHashData(hashKey);
                var historyData = this.getData();
                var hostData = this.getHashData(hostCacheKey);
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
                                '<td><i class="mdi mdi-delete history-del" /></td>' +
                                '</tr>';
                            _html.push(_htmlItem);
                        }
                    }
                }
                $('#history-content > table').html(_html.join(""));
                //
                if (hostData) {
                    _html = [];
                    for (var i in hostData) {
                        var select = '';
                        if (self.host === hostData[i]) {
                            select = 'selected="selected"';
                        }
                        _html.push('<option value="'+ hostData[i] +'" '+ select +'>'+ hostData[i] +'</option>');
                    }
                    $('#host-select').html(_html.join(""));
                }
            },
            getData: function() {
                var result = null;
                try {
                    result =  JSON.parse(localStorage.getItem(cacheKey));
                } catch (e) {
                }

                return result ? result : {};
            },
            getHashData: function(key) {
                var result = null;
                try {
                    result =  JSON.parse(localStorage.getItem(key));
                } catch (e) {
                }

                return result ? result : [];
            },
            del: function(key) {
                var historyDataTmp = {};
                var historyData = this.getData();
                for (var i in historyData) {
                    if (i !== key) {
                        historyDataTmp[i] = historyData[i];
                    }
                }
                localStorage.setItem(cacheKey, JSON.stringify(historyDataTmp));
                //
                var hashData = this.getHashData(hashKey);
                for (var i in hashData) {
                    if (hashData[i] === key) {
                        hashData.splice(i, 1);
                    }
                }
                localStorage.setItem(hashKey, JSON.stringify(hashData));
                //
                this.load()
            }
        };
    },
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
        $('#form-data').on('keyup', '.form-data-item', function() {
            var parent = $(this).parent().parent();
            if (parent.index() + 1 === $('#form-data > tr').length) {
                // 创建新的一行
                var _htmlItem = '<tr>' +
                            '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                            '<td><input type="text" class="form-key form-data-item" value="" /> </td>' +
                            '<td><input type="text" class="form-value form-data-item" value="" /> </td>' +
                        '</tr>';
                $('#form-data').append(_htmlItem);
            }
        });
        // history记录项删除
        $('.history-table').on('click', '.history-del', function(e) {
            if (confirm('确定要删除该数据吗？')) {
                var hashKey = $(this).parent().parent().attr('data-key');
                if (hashKey) {
                    self.history().del(hashKey);
                }
            }
            e.stopPropagation();
        });
        // history记录项点击事件
        $('.history-table').on('click', 'tr', function() {
            var key = $(this).attr('data-key');
            // 从缓存中获取数据
            var historyData = self.history().getData();
            if (historyData[key]) {
                var url = historyData[key]['url'];
                var requestType = historyData[key]['type'];
                var data = historyData[key]['data'];
                var result = historyData[key]['result'];
                var apiName = historyData[key]['name'];
                var time = historyData[key]['time'];
                $('.request-type').html(requestType);
                self.requestType = requestType;
                $('#url').val(url);
                $('#result').html(self.syntaxHighlight(JSON.stringify(result, undefined, 4)));
                $('#api-name').val(apiName);
                $('#send-time').html(time);
                $('.tabs li').eq(0).click();
                // 显示参数
                var _html = [];
                for (var i in data) {
                    var _htmlItem = '<tr>' +
                                '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                                '<td><input type="text" class="form-key form-data-item" value="'+ i +'" /> </td>' +
                                '<td><input type="text" class="form-value form-data-item" value="'+ data[i] +'" /> </td>' +
                            '</tr>';
                    _html.push(_htmlItem);
                }
                _html.push('<tr>' +
                            '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                            '<td><input type="text" class="form-key form-data-item" value="" /> </td>' +
                            '<td><input type="text" class="form-value form-data-item" value="" /> </td>' +
                        '</tr>');
                if (_html.length > 0) {
                    $('#form-data').html(_html.join(""));
                }
                // host
                var host = self.getHost(url);
                $('#host-select').val(host);
            }
        });
        // 选择host
        $('#host-select').change(function() {
            var value = $(this).val();
            var url = $.trim($('#url').val());
            var host = self.getHost(url);
            $('#url').val(url.replace(host, value));
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
                }
                // 获取参数
                var formData = self.getFormParams(self.requestType);
                $this.attr('disabled', true).html('<i class="mdi mdi-refresh mdi-spin"></i> 发送中...');
                request(url, {'type': self.requestType}, formData, function(res) {
                    $('#result').html(self.syntaxHighlight(JSON.stringify(res, undefined, 4)));
                    $this.attr('disabled', false).html('发送');
                    // 记录历史
                    var date = new Date();
                    var sendTime = date.toLocaleString();
                    $('#send-time').html(sendTime);
                    self.history().add(url, self.requestType, apiName, formData, res, sendTime);
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
            $('.request-type').text(key);
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
