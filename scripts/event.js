/**
 * 事件监听
 * Created by onlyfu on 2018/02/16.
 */

let Event = {

    /**
     * init
     */
    init: function() {
        // 内容tab切换
        this.content_tab_change();
        // 表单输入自动增加行，body部分
        this.form_data_body_input();
        // 响应类型数据切换
        this.response_type_change();
        //
        this.form_data_type_change();
        // 选择host检索history
        this.select_host_to_search();
        // history侧边栏开关
        this.history_switch();
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
     * 表单输入自动增加行，body部分
     */
    form_data_body_input: function() {
        let form_data_obj = $('.form-data');
        form_data_obj.on('input', '.form-data-item', function() {
            let data_type = $(this).attr('data-type');
            let target_obj = $('#' + data_type);
            let parent = $(this).parent().parent();
            if (parent.index() + 1 === target_obj.find('tr').length) {
                // 创建新的一行
                let _htmlItem = '<tr>' +
                        '<td><input type="checkbox" class="form-select" checked="checked" /> </td>' +
                        '<td><input type="text" class="form-key form-data-item input-text" value="" data-type="' + data_type + '" /> </td>' +
                        '<td class="display-flex-row">{form-data-type}<input type="text" class="form-value form-data-item input-text display-flex-auto" value="" data-type="' + data_type + '" /> </td>' +
                        '<td><input type="text" class="form-description form-data-item input-text" value="" data-type="' + data_type + '" /> </td>' +
                        '</tr>';

                // 根据类型不同，替换目标对象
                let _html_form_data_type = '';
                switch (data_type)  {
                    case "form-data-true":
                        _html_form_data_type = '' +
                            '<select class="w-50 radius-small-all border-normal form-value-data-type">' +
                                '<option value="text">Text</option>' +
                                '<option value="file">File</option>' +
                            '</select>';
                        break;
                    default:
                        break;
                }
                _htmlItem = _htmlItem.replace("{form-data-type}", _html_form_data_type);

                target_obj.append(_htmlItem);
            }
        });
    },

    /**
     * 响应类型数据切换
     */
    response_type_change: function() {
        $('.response-type li').on('click', function() {
            var id = $(this).attr('data-id');
            $('.response-type li').removeClass('focus');
            $(this).addClass('focus');
            $('.result-box').addClass('hide');
            $('#' + id).removeClass('hide');
        });
    },

    /**
     * form data type
     */
    form_data_type_change: function() {
        $('input[name=form-data-type]').on('click', function() {
            let data_type = $(this).val();
            if (data_type === 'form-data' || data_type === 'form-data-true') {
                $('.form-data-title').show();
            } else {
                $('.form-data-title').hide();
            }

            if (data_type === 'raw') {
                $('#raw-content-type').show();
            } else {
                $('#raw-content-type').hide();
            }

            $('.form-data-type').hide().each(function() {
                if (data_type === $(this).attr('data-type')) {
                    $(this).show();
                }
            })
        });
    },

    /**
     * 选择host检索history
     */
    select_host_to_search: function() {
        $('#history-host').on('click', 'li span', function(e) {
            var host = $(this).parent().attr('data-host');
            host = host ? host : '';
            $('#history-host > li').removeClass('focus');
            $(this).parent().addClass('focus');
            History.build_ui_list(null, host);
            e.stopPropagation();
        }).on('click', 'li i', function(e) {
            var host = $(this).parent().attr('data-host');
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
            var target = $('#history-sidebar');
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
    }
};

$(function() {
    Event.init();
});
