/**
 * 历史记录的事件监听
 * Created by Yuiitsu on 2018/05/21.
 */
App.event.extend('history', function() {
    //
    let self = this;
    /**
     * 事件
     */
    this.event = {
        /**
         * 显示host选择菜单
         */
        showHostList: function() {
            $('.history-container').on('click', '.history-host-selector', function(e) {
                self.module.history.renderHostList($(this));
                e.stopPropagation();
            });
        },

        /**
         * 选择host检索history
         */
        selectHostToSearch: function() {
            $('body').on('click', '.history-host-list-container span', function(e) {
                let host = $(this).attr('data-host');
                host = host ? host : '';
                Model.set('selectHost', host);
                e.stopPropagation();
            });
        },

        /**
         * 展开/折叠分组
         */
        groupSwitch: function() {
            $('.history-container').on('click', '.history-group-switch', function(e) {
                let groupId = $(this).attr('data-group-id'),
                    folderGroup = JSON.parse(Model.get('folderGroup')),
                    folderGroupLen = folderGroup.length;

                if (folderGroup.indexOf(groupId) === -1) {
                    folderGroup.push(groupId);
                } else {
                    for (let i = 0; i < folderGroupLen; i++) {
                        if (folderGroup[i] === groupId) {
                            folderGroup.splice(i, 1);
                        }
                    }
                }
                Model.set('folderGroup', JSON.stringify(folderGroup));
                e.stopPropagation();
            })
        },

        /**
         * 打开分组菜单
          */
        openGroupAction: function() {
            $('.history-container').on('click', '.history-group-action', function(e) {
                let groupId = $(this).attr('data-group-id'),
                    groupName = $(this).attr('data-group-name');
                self.module.common.tips.show($(this), self.view.getView('history', 'groupAction', {
                    groupId: groupId,
                    groupName: groupName
                }));
                e.stopPropagation();
            });
        },

        openHistoryAction: function() {
            $('.history-container').on('click', '.history-action', function(e) {
                let key = $(this).attr('data-key');
                self.module.common.tips.show($(this), self.view.getView('history', 'historyItemMenu', {
                    key: key
                }));
                e.stopPropagation();
            });
        },

        hostDelete: function() {
            $('body').on('click', '.history-host-delete', function(e) {
                let host = $(this).attr('data-host');
                if (!host) {
                    return false;
                }

                self.module.common.dialog().confirm('<h3>Confirm to delete this host?</h3><p>'+ host +'</p>', function() {
                    self.module.history.delHost(host);
                });
                e.stopPropagation();
            });
        },

        /**
         * 打开一个history
         */
        selectHistory: function() {
            $('.history-container').on('click', '.history-item', function(e) {
                // 选中数据
                let key = $(this).attr('data-key');
                console.log(key);
                self.module.history.open_data(key);
                e.stopPropagation();
            });
        },

        /**
         * 拖拽
         */
        drag: function() {
            let is_mouse_down = false,
                selected_history_key = '',
                source_object = null;

            let body_mouse_up_event = {
                on: function() {
                    $('body').off('mouseup').on('mouseup', function(e) {
                        if (source_object) {
                            source_object.removeClass('opacity-3');
                        }
                        source_object = null;
                        is_mouse_down = false;
                        selected_history_key = '';
                        //e.stopPropagation();
                    });
                },
                off: function() {
                    $('body').off('mouseup');
                }
            };

            $('#history-content').on('mousedown', '#history-list-box tbody tr', function(e) {
                let history_key = $(this).attr('data-key');
                is_mouse_down = true;
                selected_history_key = history_key;
                source_object = $(this);
                e.stopPropagation();
            }).on('mousemove', function() {
                if(is_mouse_down) {
                    if (source_object) {
                        source_object.addClass('opacity-3');
                    }
                }
                // e.stopPropagation();
            }).on('mousemove', '#history-list-box tbody tr', function(e) {
                if(!is_mouse_down) {
                    return false;
                }

                let target_top = $(this).offset().top,
                    target_height = $(this).outerHeight(),
                    data_key = $(this).attr('data-key');

                if (data_key !== source_object.attr('data-key')) {

                    if (e.clientY > target_top + target_height / 2) {
                        if ($(this).index() !== source_object.index() - 1) {
                            if ($('#history-drag-mask').length === 0) {
                                $(this).after(View.get_view('history', 'drag_mask_line', {
                                    'key': data_key,
                                    'position': 'next'
                                }));
                            } else if ($('#history-drag-mask').length > 0 && $('#history-drag-mask').attr('data-key') !== data_key) {
                                $('#history-drag-mask').remove();
                                $(this).after(View.get_view('history', 'drag_mask_line', {
                                    'key': data_key,
                                    'position': 'next'
                                }));
                            }
                        }
                    }

                    if (e.clientY > target_top && e.clientY < target_top + target_height / 2) {
                        if ($(this).index() !== source_object.index() + 1) {
                            if ($('#history-drag-mask').length === 0) {
                                $(this).before(View.get_view('history', 'drag_mask_line', {
                                    'key': data_key,
                                    'position': 'pre'
                                }));
                            } else if ($('#history-drag-mask').length > 0 && $('#history-drag-mask').attr('data-key') !== data_key) {
                                $('#history-drag-mask').remove();
                                $(this).before(View.get_view('history', 'drag_mask_line', {
                                    'key': data_key,
                                    'position': 'pre'
                                }));
                            }
                        }
                    }
                }
            }).on('mouseleave', '#history-list-box', function(e) {
                if(!is_mouse_down) {
                    return false;
                }
                $('#history-drag-mask').remove();
                e.stopPropagation();
            }).on('mouseup', '#history-list-box tbody tr', function(e) {
                if(!is_mouse_down) {
                    return false;
                }

                if($('#history-drag-mask').length === 0) {
                    return false;
                }
                let target = $('#history-drag-mask');
                let source_data_key = source_object.attr('data-key'),
                    source_html = source_object.prop('outerHTML'),
                    target_data_key = target.attr('data-drag-key'),
                    target_position = target.attr('data-position');

                if (!target_data_key || !target_position) {
                    return false;
                }

                App.history.move_position(null, source_data_key, target_data_key, target_position);

                target.replaceWith(source_html);
                source_object.remove();
                $('#history-list-box tr').removeClass('opacity-3');
            });

            $('#history-group').on('mouseup', '.history-group-item', function(e) {
                let group_id = $(this).attr('data-group-id');
                if (is_mouse_down && selected_history_key) {
                    App.group.add_history(group_id, selected_history_key);
                }
                is_mouse_down = false;
                selected_history_key = '';
                $('#history-list-box tr').removeClass('opacity-3');
            }).on('mouseenter', '#history-group-ul', function(e) {
                body_mouse_up_event.off();
            }).on('mouseleave', '#history-group-ul', function(e) {
                body_mouse_up_event.on();
            });

            body_mouse_up_event.on();
        },

        /**
         * 打开加入分组界面
         */
        openMoveToGroup: function() {
            $('body').on('click', '.move-to-group', function(e) {
                let key = $(this).parent().attr('data-key');
                self.module.common.module('Move to group',
                    self.view.getView('history', 'moveToGroup', {'key': key}), '');
                e.stopPropagation();
            });
        },

        /**
         * 加入分组
         */
        moveToGroup: function() {
            $('body').on('click', '#history-move-to-group', function(e) {
                let target = $('.history-move-to-group-form');
                let group_id = target.find('.history-group-selector').val(),
                    history_key = target.find('.history-key').val(),
                    module_id = $(this).attr('data-module-id');
                if (!history_key) {
                    return false;
                }
                self.module.history.moveToGroup(history_key, group_id);
                $('.module-box-' + module_id).remove();
                e.stopPropagation();
            });
        },

        deleteGroup: function() {

            $('body').on('click', '.history-group-delete', function(e) {
                let groupId = $(this).attr('data-group-id');
                self.module.common.dialog().confirm('Confirm to delete this folder?', function() {
                    self.module.group.delete(groupId);
                });
                e.stopPropagation();
            });
        },

        /**
         * 删除
         */
        delete: function() {
            $('body').on('click', '.history-delete', function(e) {
                let key = $(this).parent().attr('data-key');
                if (key) {
                    self.module.common.dialog().confirm('Confirm to delete the data?', function() {
                        self.module.history.del(key);
                    });
                }
                e.stopPropagation();
            });
        },

        /**
         * 搜索
         */
        search: function() {
            $('.history-container').on('keydown', '.history-search-key', function(e) {
                if (e.keyCode === 13) {
                    let value = $.trim($(this).val());
                    Model.set('searchKey', value);
                }
                e.stopPropagation();
            });
        },

        clearSearchKey: function() {
            $('.history-container').on('click', '.history-search-key-clear', function(e) {
                Model.set('searchKey', '');
                e.stopPropagation();
            });
        }
    };
});
