/**
 * 历史分组事件监听
 * Created by Yuiitsu on 2018/05/25.
 */
App.event.extend('group', function() {
    //
    let self = this;

    /**
     * 事件
     * @type {{open_form: event.open_form, save_new_group: event.save_new_group}}
     */
    this.event = {

        /**
         * 打开新增/编辑表单
         */
        openForm: function() {
            $('body').on('click', '.history-group-add-button', function(e) {
                let groupId = $(this).attr('data-group-id'),
                    groupName = $(this).attr('data-group-name'),
                    moduleName = groupId ? 'Edit Folder' : 'New Folder';
                self.module.common.module(moduleName, self.view.getView('group', 'form', {
                    groupId: groupId ? groupId : '',
                    groupName: groupName ? groupName : ''
                }), '');
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
                    App.common.tips.show($(this), item_menu_html, {position: 'right'});
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
                $('.history-host').find('li').removeClass('focus');
                $(this).addClass('focus');
                e.stopPropagation();
            });
        },

        /**
         * 删除分组
         */
        item_delete: function() {
            $('body').on('click', '.history-group-del', function(e) {
                let group_id = $(this).attr('data-group-id');
                App.common.dialog().confirm('Confirm to delete data?', function() {
                    if (group_id) {
                        App.group.delete(group_id);
                    }
                });
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
                App.common.module('Modify Group', View.get_view('group', 'form', {
                    group_id: group_id,
                    name: name
                }), '');
                e.stopPropagation();
            })
        },

        /**
         * 保存新分组
         */
        saveGroup: function() {
            $('body').on('click', '#history-group-save', function(e) {
                let groupName = $.trim($('#history-group-name').val()),
                    groupId = $.trim($('#history-group-id').val()),
                    moduleId = $(this).attr('data-module-id');
                if (!groupName) {
                    return false;
                }



                if (groupId) {
                    // 修改
                    if (self.module.group.modifyGroup(groupId, groupName)) {
                        $('.module-box-' + moduleId).remove();
                    }
                } else {
                    // 新增
                    if (self.module.group.newGroup(groupName)) {
                        $('.module-box-' + moduleId).remove();
                    }
                }
                e.stopPropagation();
            });
        },

        selector_new_group: function() {
            $('body').on('click', '.history-group-selector-new', function(e) {
                App.common.module('New Group', View.get_view('group', 'form', ''), '');
                e.stopPropagation();
            });
        }
    };
});
