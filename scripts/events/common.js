/**
 * 通用事件监听
 * Created by Yuiitsu on 2018/05/22.
 */
Event.extend('common', function() {
    /**
     * 事件
      * @type {{content_tab_change: event.content_tab_change, response_type_change: event.response_type_change}}
     */
    this.event = {
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

                switch (id) {
                    case "result":
                        $('.response-body').each(function() {
                            if ($(this).html()) {
                                $(this).removeClass('hide');
                            }
                        });
                        break;
                    case "response-headers":
                        $('#' + id).removeClass('hide');
                        break;
                }
            });
        }
    };
});
