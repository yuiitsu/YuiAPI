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
