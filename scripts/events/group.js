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

        /**
         * 打开新增/编辑表单
         */
        open_form: function() {
            $('#history-group').on('click', '#history-group-new', function(e) {
                Common.module('New Group', View.get_view('group', 'form', ''), '');
            });
        },

        /**
         * 元素对象菜单显示
         */
        item_hover: function() {
            $('#history-group').on('mouseover', '#history-group-ul li', function(e) {
                let group_id = $(this).attr('data-group-id');
                if (group_id) {
                    Common.tips.show($(this), '<span class="history-group-del" data-group-id="'+ group_id +'">delete</span>', {position: 'right'});
                }
            });
        },

        /**
         * 点击
         */
        item_click: function() {
            $('#history-group').on('click', '#history-group-ul li', function(e) {
                $('#history-group-ul li').removeClass('focus');
                let group_id = $(this).attr('data-group-id');
                if (group_id) {
                    App.group.load_history(group_id);
                    $(this).addClass('focus');
                }
            });
        },

        /**
         * 删除分组
         */
        item_delete: function() {
            $('body').on('click', '.history-group-del', function(e) {
                if(confirm('Confirm to delete data?')) {
                    let group_id = $(this).attr('data-group-id');
                    if (group_id) {
                        App.group.delete(group_id);
                    }
                }
            });
        },

        /**
         * 保存新分组
         */
        save_new_group: function() {
            let _this = this;
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
