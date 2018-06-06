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
                App.history.build_ui_list(null, host);
                e.stopPropagation();
            });
        },

        /**
         * host hover
         */
        host_hover: function() {
            $('#history-content').on('mouseover', '#history-sidebar li', function(e) {
                let host = $(this).attr('data-host');
                if (!host) {
                    return false;
                }

                let item_menu_html = View.get_view('history', 'host_item_menu', {'host': host});
                Common.tips.show($(this), item_menu_html, {position: 'right'});
                e.stopPropagation();
            });
        },

        host_delete: function() {
            $('body').on('click', '.history-del', function(e) {
                let host = $(this).attr('data-host');
                if (!host) {
                    return false;
                }

                if (confirm('Confirm to delete the host')) {
                    App.history.del_host(host);
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
         * 打开一个history
         */
        history_item_select: function() {
            $('#history-content').on('click', '#history-list-box tr', function() {
                // 选中数据
                let key = $(this).attr('data-key');
                // 从缓存中获取数据
                let historyData = App.history.getData();
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
                        group_id = historyData[key]['group_id'],
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
                    let assert_data = App.history.get_assert_data(),
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

                    // group_id下拉菜单
                    App.group.display_selector(group_id);
                }
            });
        },

        open_all_action: function() {
            $('#history-content').on('click', '.history-all-action', function(e) {
                Common.tips.show($(this), View.get_view('history', 'history_all_action_menu', {}));
                e.stopPropagation();
            })
        },

        open_item_menu: function() {
            $('#history-content').on('mouseover', '#history-list-box tbody tr', function(e) {
                let key = $(this).attr('data-key');
                Common.tips.show($(this), View.get_view('history', 'history_item_menu', {
                    key: key
                }));
                e.stopPropagation();
            });
        },

        /**
         * 打开加入分组界面
         */
        add_to_group_form: function() {
            $('body').on('click', '.history-tips-add-list li.add-to-group', function(e) {
                let key = $(this).parent().attr('data-key');
                Common.module('Add to group', View.get_view('history', 'add_to_group_form', {'key': key}), '');
                e.stopPropagation();
            });
        },

        /**
         * 加入分组
         */
        add_to_group: function() {
            $('body').on('click', '#history-add-to-group', function(e) {
                let target = $('.history-add-to-group-form');
                let group_id = target.find('.history-group-selector').val(),
                    history_key = target.find('.history-key').val(),
                    module_id = $(this).attr('data-module-id');
                if (!group_id || !history_key) {
                    return false;
                }
                App.history.add_to_group(history_key, group_id);
                $('.module-box-' + module_id).remove();
                e.stopPropagation();
            });
        },

        /**
         * 删除
         */
        delete: function() {
            $('body').on('click', '.history-tips-add-list li.delete', function(e) {
                let key = $(this).parent().attr('data-key');
                if (key) {
                    if (confirm('Confirm to clear the data')) {
                        App.history.del(key);
                    }
                }
                e.stopPropagation();
            });
        },

        clear: function() {

        },

        /**
         * 搜索
         */
        search: function() {
            $('#history-search').on('keydown', function(e) {
                App.history.search($(this), e);
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
