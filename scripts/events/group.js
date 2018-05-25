/**
 * 历史分组事件监听
 * Created by Yuiitsu on 2018/05/25.
 */
Event.extend('group', function() {

    /**
     * 事件
     * @type {{open_form: event.open_form, save_new_group: event.save_new_group}}
     */
    this.event = {
        open_form: function() {
            $('#history-group').on('click', '#history-group-new', function(e) {
                Common.module('New Group', View.get_view('group', 'form', ''), '');
            });
        },

        save_new_group: function() {
            $('body').on('click', '#history-group-save', function() {
                let group_name = $.trim($('#history-group-name').val());
                if (!group_name) {
                    return false;
                }

                if (App.group.new_group(group_name)) {
                    $('#module-box').remove();
                }
            });
        }
    };
});

