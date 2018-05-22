/**
 * 通用事件监听
 * Created by Yuiitsu on 2018/05/22.
 */
let event_common = {
    /**
     * 执行事件监听
     */
    run: function() {
        // 内容切换
        this.content_tab_change();
        // 响应类型数据切换
        this.response_type_change();
    },

    /**
     * 内容tab切换
     */
    content_tab_change: function() {
        $('.tabs li').on('click', function() {
            let id = $(this).attr('data-id');
            $('.tabs li').removeClass('focus');
            $(this).addClass('focus');
            $('.left-content').addClass('hide');
            $('#' + id).removeClass('hide');

            // 默认断言检查
            if (id === 'test-content') {
                let default_assert_data = History.get_default_assert();
                if ($.isEmptyObject(default_assert_data)) {
                    Common.module(
                        'default assertion',
                        '<p style="height:30px;line-height:30px;"><label><input type="radio" name="default-assertion-type" checked="checked" value="Json" /> Json</label></p><textarea style="width:100%;height:468px;" id="default-assertion-content"></textarea>',
                        '<button class="btn btn-primary" id="save-default-assert">Save</button>'
                    );
                }
            }
        });
    },

    /**
     * 响应类型数据切换
     */
    response_type_change: function() {
        $('.response-type li').on('click', function() {
            let id = $(this).attr('data-id');
            $('.response-type li').removeClass('focus');
            $(this).addClass('focus');
            $('.result-box').addClass('hide');
            $('#' + id).removeClass('hide');
        });
    }
};

$(function() {
    event_common.run();
});
