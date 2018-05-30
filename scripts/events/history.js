/**
 * 历史记录的事件监听
 * Created by Yuiitsu on 2018/05/21.
 */
Event.extend('history', function() {
    /**
     * 事件
      * @type {{select_host_to_search: event.select_host_to_search, history_switch: event.history_switch, list_control: event.list_control, tips_control: event.tips_control, search: event.search, group_tab: event.group_tab}}
     */
    this.event = {
        /**
         * 选择host检索history
         */
        select_host_to_search: function() {
            $('#history-content').on('click', '#history-sidebar li span', function(e) {
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
            $('#history-content').on('click', '#history-switch-button', function() {
                let target = $('#history-sidebar');
                if (target.css('display') === 'flex') {
                    target.hide();
                    $(this).attr('title', 'Open the sidebar').find('i').addClass('mdi-chevron-right');
                } else {
                    target.show();
                    $(this).attr('title', 'Hide the sidebar').find('i').removeClass('mdi-chevron-right hover');
                }
            }).on('mouseover', '#history-switch-button', function() {
                $(this).find('i').addClass('hover');
            }).on('mouseout', '#history-switch-button', function() {
                $(this).find('i').removeClass('hover');
            });
        },

        /**
         * 列表操作
         */
        list_control: function() {
            // history记录项删除
            $('#history-content').on('click', '.history-del', function(e) {
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
                Common.tips.show($(this), content);
                //Test.firstAdd(key);
                e.stopPropagation();
            }).on('click', '.history-all-action', function(e) {
                let content = '<ul class="history-tips-list history-tips-all-list">'+
                        '<li data-type="Test.allAdd">all add to #2</li>'+
                        '<li data-type="clear">clear</li>'+
                    '</ul>';
                Common.tips.show($(this), content);
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
                    let hashKey = $(this).parent().parent().attr('data-key');
                    if (hashKey) {
                        Test.delNormal(hashKey);
                    }
                }
                e.stopPropagation();
            }).on('click', '.test-normal-list-body .test-del', function(e) {
                if (confirm('Confirm to clear the data')) {
                    let hashKey = $(this).parent().parent().attr('data-key');
                    if (hashKey) {
                        Test.delNormal(hashKey);
                    }
                }
                e.stopPropagation();

            }).on('click', '.test-item', function(e) {
                let result = {};
                try {
                    result = JSON.parse($(this).attr('data-result'));
                } catch (e) {
                }
                $('#result').html(Common.syntaxHighlight(JSON.stringify(result, undefined, 4)));
                $('.tabs li').eq(1).trigger('click');
                e.stopPropagation();

            }).on('click', '#history-list-box tr', function() {
                // 选中数据
                let key = $(this).attr('data-key');
                // 从缓存中获取数据
                let historyData = History.getData();
                if (historyData[key]) {
                    let url = historyData[key]['url'],
                        requestType = historyData[key]['type'],
                        form_data_type = historyData[key]['data_type'],
                        headers = historyData[key]['headers'],
                        data = historyData[key]['data'],
                        response_content_type = historyData[key]['response_content_type'],
                        result = historyData[key]['result'],
                        apiName = historyData[key]['name'],
                        time = historyData[key]['time'],
                        status = historyData[key]['status'];

                    $('#request-type').val(requestType);
                    $('#url').val(url);
                    $('#response-headers').html(headers ? headers : '');
                    $('#api-name').val(apiName);
                    $('#send-time').html(time);
                    $('#response-status').html(status);
                    $('.tabs li').eq(1).trigger('click');

                    Common.display_response(result, response_content_type);
                    App.requestType = requestType;

                    // 显示参数
                    $('input[name=form-data-type]').each(function() {
                        if ($(this).val() === form_data_type) {
                            $(this).trigger('click');
                        }
                    });

                    let raw_obj = $('#form-data-raw').find('textarea');
                    switch (form_data_type) {
                        case "form-data":
                            View.display('form', 'urlencoded_line', data, '#form-data');
                            View.display('form', 'form_data_line', [], '#form-data-true');
                            raw_obj.val('');
                            break;
                        case "form-data-true":
                            View.display('form', 'urlencoded_line', [], '#form-data');
                            View.display('form', 'form_data_line', data, '#form-data-true');
                            raw_obj.val('');
                            break;
                        case "raw":
                            raw_obj.val(data);
                            break;
                        default:
                            console.log('form-data-type error');
                            break;
                    }

                    // assert
                    let assert_data = History.get_assert_data(),
                        assert_content = '';
                    if (assert_data.hasOwnProperty(key)) {
                        let assert_type = assert_data[key]['type'];
                        assert_content = assert_data[key]['content'];
                        if (assert_type) {
                            $('input[name=form-data-assert-type]').attr('checked', false).each(function() {
                                let value = $(this).val();
                                if (value === assert_type) {
                                    $(this).prop('checked', 'checked');
                                }
                            });
                        }
                    }

                    $('#form-data-assert').text(assert_content);
                }
            });
        },

        /**
         * 列表提示窗口控制
         */
        tips_control: function() {
            $('body').on('click', '.history-tips-add-list li', function(e) {
                // 单个
                let key = $(this).parent().attr('data-key'),
                    type = $(this).attr('data-type');

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
                // 所有
                let type = $(this).attr('data-type');
                switch (type) {
                    case 'Test.allAdd':
                        Test.allAdd();
                        Common.notification('Add to #2 success');
                        break;
                    case 'clear':
                        break;
                }
                e.stopPropagation();
            })
        },

        /**
         * 搜索
         */
        search: function() {
            $('#history-search').on('keydown', function(e) {
                History.search($(this), e);
            });
        },

        /**
         * 分组tab切换
         */
        group_tab: function() {
            $('#history-content').on('click', '.history-group-tab li', function(e) {
                let index = $(this).index();
                $('#history-content').find('#history-sidebar').find('.history-group-tab li').removeClass('focus').eq(index).addClass('focus');
                $('#history-content').find('#history-sidebar').find('.history-host').addClass('hide').eq(index).removeClass('hide');
            });
        }
    };
});
