/**
 * 历史记录的事件监听
 * Created by Yuiitsu on 2018/05/21.
 */
let event_history = {
    /**
     * 执行事件监听
     */
    run: function() {
        // 选择host，检索history
        this.select_host_to_search();
        // history侧边栏开关
        this.history_switch();
        // 列表操作
        this.list_control();
    },

    /**
     * 选择host检索history
     */
    select_host_to_search: function() {
        $('#history-host').on('click', 'li span', function(e) {
            let host = $(this).parent().attr('data-host');
            host = host ? host : '';
            $('#history-host').find('li').removeClass('focus');
            $(this).parent().addClass('focus');
            History.build_ui_list(null, host);
            e.stopPropagation();
        }).on('click', 'li i', function(e) {
            let host = $(this).parent().attr('data-host');
            if (host) {
                if (confirm('Confirm to delete the host')) {
                    History.del_host(host);
                    $(this).parent().remove();
                }
            }
            e.stopPropagation();
        });
    },

    /**
     * history侧边栏开关
     */
    history_switch: function() {
        $('#history-switch-button').on('click', function() {
            let target = $('#history-sidebar');
            if (target.css('display') === 'flex') {
                target.hide();
                $(this).attr('title', 'Open the sidebar').find('i').addClass('mdi-chevron-right');
            } else {
                target.show();
                $(this).attr('title', 'Hide the sidebar').find('i').removeClass('mdi-chevron-right hover');
            }
        }).on('mouseover', function() {
            $(this).find('i').addClass('hover');
        }).on('mouseout', function() {
            $(this).find('i').removeClass('hover');
        });
    },

    /**
     * 列表操作
     */
    list_control: function() {
        // history记录项删除
        $('#history-list-box').on('click', '.history-del', function(e) {
            if (confirm('Confirm to clear the data')) {
                let hashKey = $(this).parent().parent().attr('data-key');
                if (hashKey) {
                    History.del(hashKey);
                }
            }
            e.stopPropagation();
        //}).on('click', '#all-test', function(e) {
        //    // 全部加入普通测试组
        //    Test.allAdd();
        //    e.stopPropagation();
        }).on('click', '.history-item-action', function(e) {
            let key = $(this).attr('data-key'),
                content = '<ul class="history-tips-list history-tips-add-list" data-key="'+ key +'">'+
                    '<li data-type="Test.firstAdd">add to #1</li>'+
                    '<li data-type="Test.normalAdd">add to #2</li>'+
                    '<li data-type="delete">delete</li>'+
                '</ul>';
            Common.tips($(this), content);
            //Test.firstAdd(key);
            e.stopPropagation();
        }).on('click', '.history-all-action', function(e) {
            let content = '<ul class="history-tips-list history-tips-all-list">'+
                    '<li data-type="Test.allAdd">all add to #2</li>'+
                    '<li data-type="clear">clear</li>'+
                '</ul>';
            Common.tips($(this), content);
            e.stopPropagation();
        }).on('click', '.test-first-list-body .test-del', function(e) {
            if (confirm('Confirm to clear the data')) {
                let hashKey = $(this).parent().parent().attr('data-key');
                if (hashKey) {
                    Test.delFirst(hashKey);
                }
            }
            e.stopPropagation();
        }).on('click', '.test-normal-list-body .test-del', function(e) {
            if (confirm('Confirm to clear the data')) {
                var hashKey = $(this).parent().parent().attr('data-key');
                if (hashKey) {
                    Test.delNormal(hashKey);
                }
            }
            e.stopPropagation();
        }).on('click', '.test-normal-list-body .test-del', function(e) {
            if (confirm('Confirm to clear the data')) {
                var hashKey = $(this).parent().parent().attr('data-key');
                if (hashKey) {
                    Test.delNormal(hashKey);
                }
            }
            e.stopPropagation();
        }).on('click', '.test-item', function(e) {
            var result = {};
            try {
                result = JSON.parse($(this).attr('data-result'));
            } catch (e) {
            }
            $('#result').html(Common.syntaxHighlight(JSON.stringify(result, undefined, 4)));
            $('.tabs li').eq(1).click();
            e.stopPropagation();
        }).on('click', 'tr', function() {
            // 选中数据
            let key = $(this).attr('data-key');
            // 从缓存中获取数据
            let historyData = History.getData();
            if (historyData[key]) {
                let url = historyData[key]['url'];
                let requestType = historyData[key]['type'];
                let form_data_type = historyData[key]['data_type'];
                let headers = historyData[key]['headers'];
                let data = historyData[key]['data'];
                let result = historyData[key]['result'];
                let apiName = historyData[key]['name'];
                let time = historyData[key]['time'];
                let status = historyData[key]['status'];
                $('#request-type').val(requestType);
                self.requestType = requestType;
                $('#url').val(url);
                $('#response-headers').html(headers ? headers : '');
                $('#result').html(Common.syntaxHighlight(JSON.stringify(result, undefined, 4)));
                $('#api-name').val(apiName);
                $('#send-time').html(time);
                $('#response-status').html(status);
                $('.tabs li').eq(1).trigger('click');
                // 显示参数
                $('input[name=form-data-type]').each(function() {
                    if ($(this).val() === form_data_type) {
                        $(this).trigger('click');
                    }
                });
                if (!form_data_type || form_data_type === 'form-data' || form_data_type === 'form-data-true') {
                    let data_type = 'form-data',
                        _html = [],
                        _html_form_value_data_type = '';

                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            let item_key = i.replace(/\"/g, '&#34;').replace(/\'/g, '&#39;'),
                                value = '',
                                value_type = 'text',
                                description = '';
                            if (typeof data[i] === 'object') {
                                value = data[i]['value'];
                                value_type = data[i]['value_type'];
                                description = data[i]['description'];
                            } else {
                                value = data[i];
                            }
                            value = value.replace(/\"/g, '&#34;').replace(/\'/g, '&#39;');
                            let _htmlItem = '<tr>' +
                                '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                                '<td>' +
                                '<input type="text" class="form-key form-data-item input-text" value="' + item_key + '" data-type="' + data_type + '" />' +
                                '</td>' +
                                '<td class="display-flex-row">{form-value-data-type}' +
                                '<input type="{form-value-input-type}" class="form-value form-data-item input-text display-flex-auto" value="' + value + '" data-type="' + data_type + '" />' +
                                '</td>' +
                                '<td>' +
                                '<input type="text" class="form-description form-data-item input-text" value="'+ description +'" data-type="' + data_type + '" />' +
                                '</td>' +
                                '</tr>';

                            switch (form_data_type) {
                                case "form-data-true":
                                    _html_form_value_data_type = '' +
                                        '<select class="w-50 radius-small-all border-normal form-value-data-type">' +
                                            '<option value="text">Text</option>' +
                                            '<option value="file" {form-value-data-type-file}>File</option>' +
                                        '</select>';

                                    switch (value_type) {
                                        case "file":
                                            _html_form_value_data_type = _html_form_value_data_type.replace('{form-value-data-type-file}', 'selected="selected"');
                                            _htmlItem = _htmlItem.replace('{form-value-input-type}', 'file');
                                            break;
                                        default:
                                            _html_form_value_data_type = _html_form_value_data_type.replace('{form-value-data-type-file}', '');
                                            _htmlItem = _htmlItem.replace('{form-value-input-type}', 'text');
                                            break;
                                    }
                                    break;
                            }

                            _htmlItem = _htmlItem.replace('{form-value-data-type}', _html_form_value_data_type);
                            _html.push(_htmlItem);
                        }
                    }

                    let new_line = '<tr>' +
                        '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                        '<td><input type="text" class="form-key form-data-item input-text" value="" data-type="' + data_type + '" /> </td>' +
                        '<td class="display-flex-row">{form-value-data-type}<input type="text" class="form-value form-data-item input-text" value="" data-type="' + data_type + '" /> </td>' +
                        '<td><input type="text" class="form-description form-data-item input-text" value="" data-type="' + data_type + '" /> </td>' +
                        '</tr>';


                    if (_html.length > 0) {
                        switch (form_data_type) {
                            case "form-data":
                                _html.push(new_line);
                                $('#form-data').html(_html.join(""));
                                break;
                            case "form-data-true":
                                new_line = new_line.replace('{form-value-data-type}',
                                    _html_form_value_data_type.replace('{form-value-data-type-file}', ''));
                                _html.push(new_line);
                                $('#form-data-true').html(_html.join(""));
                                break;
                        }
                    }
                    $('#form-data-raw').find('textarea').val('');
                }

                if (form_data_type === 'raw') {
                    $('#form-data-raw').find('textarea').val(data);
                }

                // assert
                let assert_data = History.get_assert_data(),
                    assert_content = '';
                if (assert_data.hasOwnProperty(key)) {
                    let assert_type = assert_data[key]['type'];
                    assert_content = assert_data[key]['content'];
                    if (assert_type) {
                        $('input[name=form-data-assert-type]').attr('checked', false).each(function() {
                            var value = $(this).val();
                            if (value === assert_type) {
                                $(this).prop('checked', 'checked');
                            }
                        });
                        //$('#form-data-assert').text(assert_content);
                        //$('input[name=form-data-assert-type]').each()
                    }
                }

                $('#form-data-assert').text(assert_content);
            }
        });
    }
};

$(function() {
    event_history.run();
});
