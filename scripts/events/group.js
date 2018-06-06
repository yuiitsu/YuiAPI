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
            $('#history-content').on('click', '#history-group-new', function(e) {
                Common.module('New Group', View.get_view('group', 'form', ''), '');
                e.stopPropagation();
            });
        },

        /**
         * 元素对象菜单显示
         */
        item_hover: function() {
            $('#history-content').on('mouseover', '#history-group-ul li', function(e) {
                let group_id = $(this).attr('data-group-id'),
                    name = $(this).attr('data-group-name');
                if (group_id) {
                    let item_menu_html = View.get_view('group', 'item_menu', {'group_id': group_id, 'name': name});
                    Common.tips.show($(this), item_menu_html, {position: 'right'});
                }
                e.stopPropagation();
            });
        },

        /**
         * 点击
         */
        item_click: function() {
            $('#history-content').on('click', '#history-group-ul li', function(e) {
                $('#history-group-ul').find('li').removeClass('focus');
                let group_id = $(this).attr('data-group-id');
                App.group.load_history(group_id);
                $(this).addClass('focus');
                e.stopPropagation();
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
                e.stopPropagation();
            });
        },

        /**
         * 打开编辑表单
         */
        item_modify_form: function() {
            $('body').on('click', '.history-group-modify', function(e) {
                let group_id = $(this).attr('data-group-id'),
                    name = $(this).attr('data-group-name');
                Common.module('Modify Group', View.get_view('group', 'form', {
                    group_id: group_id,
                    name: name
                }), '');
                e.stopPropagation();
            })
        },

        /**
         * 保存新分组
         */
        save_group: function() {
            let _this = this;
            $('body').on('click', '#history-group-save', function(e) {
                let group_name = $.trim($('#history-group-name').val()),
                    group_id = $.trim($('#history-group-id').val()),
                    module_id = $(this).attr('data-module-id');
                if (!group_name) {
                    return false;
                }

                if (group_id) {
                    // 修改
                    if (App.group.modify_group(group_id, group_name)) {
                        $('.module-box-' + module_id).remove();
                    }
                } else {
                    // 新增
                    if (App.group.new_group(group_name)) {
                        $('.module-box-' + module_id).remove();
                    }
                }
                e.stopPropagation();
            });
        },

        selector_new_group: function() {
            $('body').on('click', '.history-group-selector-new', function(e) {
                Common.module('New Group', View.get_view('group', 'form', ''), '');
                e.stopPropagation();
            });
        }
    };
});
