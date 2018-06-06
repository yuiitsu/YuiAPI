/**
 * 设置的事件监听
 * Created by Yuiitsu on 2018/05/22.
 */
Event.extend('setting', function() {
    /**
     * 事件
      * @type {{show_setting: event.show_setting, item_click: event.item_click}}
     */
    this.event = {
        /**
         * 显示设置界面
         */
        show_setting: function() {
            $('#settings').on('click', function() {
                Common.tips.show($(this), View.get_view('setting', 'setting', {}));
            });
        },

        /**
         * 点击事件
         */
        item_click: function() {
            $('body').on('click', '.setting-list li', function(e) {
                let name = $(this).text(),
                    _html = '';

                let data_module = $(this).attr('data-module'),
                    data_method = $(this).attr('data-method');

                if (data_module && data_method) {
                    App[data_module][data_method]();
                    return false;
                }

                switch (name) {
                    case "Export":
                        let history_list = App.history.getHistoryListData(),
                            history_data = App.history.getData(),
                            host_list = App.history.get_host_list(),
                            data = {
                                history_list: history_list,
                                history_data: history_data,
                                host_list: host_list
                            };
                        _html = '<h2>coming soon...</h2>';
                        Common.module(name, _html, '<button class="btn btn-primary" id="export-copy">Copy</button>');

                        $('#export-copy').off('click').on('click', function() {
                            $('.module-main').clone();
                        });
                        break;
                    case "Import":
                        _html = '<h2>coming soon...</h2>';
                        //Common.module(name, '<textarea style="width:100%;height:498px;" id="import-data"></textarea>', '<button class="btn btn-primary">Import</button>');
                        Common.module(name, _html, '<button class="btn btn-primary">Import</button>');
                        break;
                    case "default assertion":
                        let default_assert_data = App.history.get_default_assert(),
                            assert_type = default_assert_data['type'],
                            assert_content = default_assert_data['content'] ? default_assert_data['content'] : '';

                        if (assert_type) {
                            $('input[name=default-assertion-type]').attr('checked', false).each(function() {
                                let value = $(this).val();
                                if (value === assert_type) {
                                    $(this).prop('checked', 'checked');
                                }
                            });
                        }

                        let content_html = View.get_view('setting', 'default_assertion', assert_content);
                        Common.module(
                            name,
                            content_html,
                            '<button class="btn btn-primary" id="save-default-assert">Save</button>'
                        );
                        break;
                }

                e.stopPropagation();
            }).on('click', '#save-default-assert', function() {
                let assert_type = $('input[name=default-assertion-type]:checked').val(),
                    assert_content = $.trim($('#default-assertion-content').val()),
                    assert_data = '';

                if (assert_type && assert_content) {
                    assert_data = {
                        type: assert_type,
                        content: assert_content
                    };
                }

                App.history.save_default_assert(assert_data);
                Common.notification('save success');
            });
        }
    };
});
