/**
 * 事件监听
 * Created by onlyfu on 2018/02/16.
 */

var Event = {

    /**
     * init
     */
    init: function() {
        // 内容tab切换
        this.content_tab_change();
        // 表单输入自动增加行，body部分
        this.form_data_body_input();
        // 发送请求
        this.send();
    },

    /**
     * 内容tab切换
     */
    content_tab_change: function() {
        $('.tabs li').on('click', function() {
            var id = $(this).attr('data-id');
            $('.tabs li').removeClass('focus');
            $(this).addClass('focus');
            $('.left-content').addClass('hide');
            $('#' + id).removeClass('hide');

            // 默认断言检查
            if (id === 'test-content') {
                var default_assert_data = History.get_default_assert();
                if ($.isEmptyObject(default_assert_data)) {
                    $('.form-params-type li').eq(2).click();
                    Common.notification('please set the default assert first.', 'danger');
                }
            }
        });
    },

    /**
     * 表单输入自动增加行，body部分
     */
    form_data_body_input: function() {
        var form_data_obj = $('.form-data');
        form_data_obj.on('input', '.form-data-item', function() {
            var data_type = $(this).attr('data-type');
            var target_obj = $('#' + data_type);
            var parent = $(this).parent().parent();
            if (parent.index() + 1 === target_obj.find('tr').length) {
                // 创建新的一行
                var _htmlItem = '<tr>' +
                            '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                            '<td><input type="text" class="form-key form-data-item input-text" value="" data-type="'+ data_type +'" /> </td>' +
                            '<td><input type="text" class="form-value form-data-item input-text" value="" data-type="'+ data_type +'" /> </td>' +
                        '</tr>';
                target_obj.append(_htmlItem);
            }
        });
    },

    /**
     * 发送请求
     */
    send: function() {

    }
};

$(function() {
    Event.init();
});
