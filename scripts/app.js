/**
 * YuiApi
 * @Author: onlyfu
 * @Date: 2017-07-07
 */
var App = {
    requestType: 'GET',
    host: '',
    init: function() {
        // 获取历史记录
        History.load();
        // 获取测试记录
        Test.init();
        // 默认断言
        History.set_default_assert();
        this.listenEvent();
    },

    /**
     * 监听事件
     */
    listenEvent: function() {
        let self = this;
        $('body').on('click', '.history-tips-add-list li', function(e) {
            var key = $(this).parent().attr('data-key');
            var type = $(this).attr('data-type');
            switch (type) {
                case 'delete':
                    if (confirm('Confirm to clear the data')) {
                        if (key) {
                            History.del(key);
                        }
                    }
                    break;
                case 'Test.firstAdd':
                    Test.firstAdd(key);
                    Common.notification('Add to #1 success');
                    break;
                case 'Test.normalAdd':
                    Test.normalAdd(key);
                    Common.notification('Add to #2 success');
                    break;
            }
            e.stopPropagation();
        }).on('click', '.history-tips-all-list li', function(e) {
            var type = $(this).attr('data-type');
            switch (type) {
                case 'Test.allAdd':
                    Test.allAdd();
                    Common.notification('Add to #2 success');
                    break;
                case 'clear':
                    break;
            }
            e.stopPropagation();
        }).on('click', '#host-select-item li', function(e) {
            var value = $(this).text();
            var urlObject = $('#url');
            //var value = $(this).val();
            var url = $.trim(urlObject.val());
            var host = Common.getHost(url);
            urlObject.val(url.replace(host, value));
            e.stopPropagation();
        }).on('click', '.setting-list li', function(e) {
            var name = $(this).text();
            switch (name) {
                case "Export":
                    var history_list = History.getHistoryListData();
                    var history_data = History.getData();
                    var host_list = History.get_host_list();
                    var data = {
                        history_list: history_list,
                        history_data: history_data,
                        host_list: host_list
                    };
                    var _html = '<h2>coming soon...</h2>';
                    Common.module(name, _html, '<button class="btn btn-primary" id="export-copy">Copy</button>');

                    $('#export-copy').off('click').on('click', function() {
                        $('.module-main').clone();
                    });
                    break;
                case "Import":
                    var _html = '<h2>coming soon...</h2>';
                    //Common.module(name, '<textarea style="width:100%;height:498px;" id="import-data"></textarea>', '<button class="btn btn-primary">Import</button>');
                    Common.module(name, _html, '<button class="btn btn-primary">Import</button>');
                    break;
                case "default assertion":
                    var default_assert_data = History.get_default_assert();
                    var assert_type = default_assert_data['type'];
                    var assert_content = default_assert_data['content'] ? default_assert_data['content'] : '';
                    if (assert_type) {
                        $('input[name=default-assertion-type]').attr('checked', false).each(function() {
                            var value = $(this).val();
                            if (value === assert_type) {
                                $(this).prop('checked', 'checked');
                            }
                        });
                    }

                    var content_html = '<p style="height:30px;line-height:30px;">' +
                        '<label>' +
                            '<input type="radio" name="default-assertion-type" checked="checked" value="Json" /> Json' +
                        '</label>' +
                        '</p>' +
                        '<textarea style="width:100%;height:468px;" id="default-assertion-content">'+ assert_content +'</textarea>';

                    Common.module(
                        name,
                        content_html,
                        '<button class="btn btn-primary" id="save-default-assert">Save</button>'
                    );
                    break;
            }

            e.stopPropagation();
        }).on('click', '#save-default-assert', function() {
            var assert_type = $('input[name=default-assertion-type]:checked').val();
            var assert_content = $.trim($('#default-assertion-content').val());
            var assert_data = '';
            if (assert_type && assert_content) {
                assert_data = {
                    type: assert_type,
                    content: assert_content
                };
            }

            History.save_default_assert(assert_data);
            Common.notification('save success');
        });

        // 选择host
        $('#host-select').on('click', function() {
            let host_list = History.get_host_list(),
                content = ['<ul class="history-tips-list" id="host-select-item">'];
            if (host_list.length > 0) {
                for (let i in host_list) {
                    content.push('<li style="text-align:left;">'+ host_list[i] +'</li>');
                }
            }
            content.push('</ul>');
            Common.tips($(this), content.join(''));
        });

        // 提交
        $('#send').on('click', function() {
            let $this = $(this),
                url_obj = $('#url'),
                url = $.trim(url_obj.val()),
                apiName = $.trim($('#api-name').val()),
                form_data_type = $('input[name=form-data-type]:checked').val();
            if (url) {
                if (url.substr(0, 7) !== 'http://' && url.substr(0, 8) !== 'https://') {
                    url = 'http://' + url;
                    url_obj.val(url);
                }
                $('.tabs li').eq(1).trigger('click');
                // 获取参数
                let formData = '',
                    header_data = Common.getFormParams().header(),
                    request_params = {
                        type: self.requestType,
                        headers: header_data['data']
                    };

                switch (form_data_type) {
                    case "form-data-true":
                        formData = Common.getFormParams().form_data('form-data');
                        request_params['processData'] = false;
                        request_params['contentType'] = false;
                        break;
                    case "form-data":
                        formData = Common.getFormParams().form();
                        break;
                    case "raw":
                        formData = $.trim($('#form-data-raw').find('textarea').val());
                        break;
                }

                $this.attr('disabled', true).html('<i class="mdi mdi-refresh mdi-spin"></i> Sending...');
                let result_obj = $('#result');
                result_obj.css('background-color', '#efefef');
                let start_timestamp=new Date().getTime();

                Common.request(url, request_params, formData['data'], function(res, jqXHR) {
                    // headers
                    let headers =jqXHR.getAllResponseHeaders();
                    $('#response-headers').html(headers);

                    // response
                    let result = res;
                    if (jqXHR.responseJSON) {
                        res = jqXHR.responseJSON;
                        result = Common.syntaxHighlight(JSON.stringify(res, undefined, 4));
                    }
                    result_obj.html(result).css('background-color', '#fff');
                    $this.attr('disabled', false).html('Send');

                    // 时间
                    let end_timestamp = new Date().getTime();
                    let use_time = end_timestamp - start_timestamp;
                    $('#send-time').html(use_time);
                    // 状态
                    $('#response-status').text(jqXHR.status);
                    // assert
                    let assert_type = $('input[name=form-data-assert-type]:checked').val();
                    let assert_content = $.trim($('#form-data-assert').val());
                    let assertion_data = '';
                    if (assert_type) {
                        assertion_data = {
                            type: assert_type,
                            content: assert_content ? assert_content : ''
                        };
                    }

                    // 写入History
                    History.add({
                        url: url,
                        type: self.requestType,
                        name: apiName,
                        headers: headers,
                        data: formData['history_data'],
                        data_type: form_data_type,
                        result: res,
                        time: use_time,
                        status: jqXHR.status,
                        assertion_data: assertion_data
                    });
                });
            }
        });

        // 监听请求类型选择
        this.listenRequestType();
        // 监听url选中
        this.listenUrlSelect();
        // 开始测试
        $('#test-start').on('click', function() {
            var $this = $(this);
            $this.attr('disabled', true).html('<i class="mdi mdi-refresh mdi-spin"></i> Testing...');
            Test.startTest(function() {
                $this.attr('disabled', false).html('Start');
            });
        });
        
        // history search
        $('#history-search').on('keydown', function(e) {
            History.search($(this), e);
        });

        $('#settings').on('click', function() {
            let content = '<ul class="history-tips-list setting-list">'+
                    '<li>Export</li>'+
                    '<li>Import</li>'+
                    '<li>default assertion</li>'+
                '</ul>';
            Common.tips($(this), content);
        });

        // 切换form tab
        $('.form-params-type li').on('click', function() {
            $('.form-params-type li').removeClass('focus');
            $(this).addClass('focus');
            let index = $(this).index();
            $('.form-data').find('table').addClass('hide').eq(index).removeClass('hide');
            //$('.form-data').find('table').eq(index).removeClass('hide');
        });

        // format
        $('#form-data-format').on('click', function() {
            let content = $.trim($('#form-data-format-content').val());
            if (!content) {
                return false;
            }

            let data = {},
                group_list = content.split('&');

            for (let i in group_list) {
                let items = group_list[i].split('=');
                data[items[0]] = items[1];
            }

            let _html = [];
            for (let i in data) {
                if (data.hasOwnProperty(i)) {
                    let item_key = i.replace(/\"/g, '&#34;').replace(/\'/g, '&#39;'),
                        value = data[i].replace(/\"/g, '&#34;').replace(/\'/g, '&#39;');
                    let _htmlItem = '<tr>' +
                        '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                        '<td>' +
                        '<input type="text" class="form-key form-data-item input-text" value="' + item_key + '" />' +
                        '</td>' +
                        '<td>' +
                        '<input type="text" class="form-value form-data-item input-text" value="' + value + '" />' +
                        '</td>' +
                        '<td>' +
                        '<input type="text" class="form-description form-data-item input-text" value="' + value + '" />' +
                        '</td>' +
                        '</tr>';
                    _html.push(_htmlItem);
                }
            }
            _html.push('<tr>' +
                        '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                        '<td><input type="text" class="form-key form-data-item input-text" value="" /> </td>' +
                        '<td><input type="text" class="form-value form-data-item input-text" value="" /> </td>' +
                        '<td><input type="text" class="form-description form-data-item input-text" value="" /> </td>' +
                    '</tr>');
            if (_html.length > 0) {
                $('#form-data').html(_html.join(""));
            }
            $('.form-params-type li').eq(1).trigger('click');
        });

        // test clear
        $('.test-clear').on('click', function() {
            if (confirm('Confirm to clear the data')) {
                var type = $(this).attr('data-type');
                Test.clear(type);
            }
        });
    },

    /**
     * 请求类型的选择
     */
    listenRequestType: function() {
        let $this = this;
        $('#request-type').on('change', function() {
            let key = $(this).val();
            if (key) {
                $this.requestType = key;
            }
        });
    },

    /**
     * 点击api url时，自动选中状态
     */
    listenUrlSelect: function() {
        $('#url').focus(function() {
            $(this).select();
        })
    }
};

$(function() {
    App.init();
});
