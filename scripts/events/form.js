/**
 * 请求表单的事件监听
 * Created by Yuiitsu on 2018/05/21.
 */

let event_form = {
    /**
     * 执行事件监听
     */
    run: function() {
        // 表单值类型选择
        this.form_value_type_change();
    },

    /**
     * 监听表单值类型的选择
     * 如果是text，显示input，如果是file，显示文件选择按钮
     */
    form_value_type_change: function() {
        $('#form-data-true').on('change', '.form-value-data-type', function() {
            let value = $(this).val();
            switch (value) {
                case "text":
                    $(this).parent().find('input').attr('type', 'text');
                    break;
                case "file":
                    $(this).parent().find('input').attr('type', 'file').attr('name', 'file');
                    //$('#form-data-form').attr('enctype', 'multipart/form-data');
                    break;
                default:
                    alert('type error.');
                    break;
            }
        });
    }
};

$(function() {
    event_form.run();
});
