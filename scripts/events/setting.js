/**
 * 设置的事件监听
 * Created by Yuiitsu on 2018/05/22.
 */
let event_setting = {
    /**
     * 执行事件监听
     */
    run: function() {
        // 显示设置界面
        this.show_setting();
        // 点击事件
        this.item_click();
    },

    /**
     * 显示设置界面
     */
    show_setting: function() {
        $('#settings').on('click', function() {
            Common.tips($(this), View.get_view('setting', 'setting', {}));
        });
    },

    /**
     * 点击事件
     */
    item_click: function() {
        $('body').on('click', '.setting-list li', function(e) {
            let name = $(this).text(), _html = '';
            switch (name) {
                case "Export":
                    let history_list = History.getHistoryListData(),
                        history_data = History.getData(),
                        host_list = History.get_host_list(),
                        data = {
                            history_list: history_list,
                            history_data: history_data,
                            host_list: host_list
                        },
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
                    let default_assert_data = History.get_default_assert(),
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

            History.save_default_assert(assert_data);
            Common.notification('save success');
        });
    }
};

$(function() {
    event_setting.run();
});
