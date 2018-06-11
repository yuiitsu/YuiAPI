/**
 * group module
 * Created by onlyfu on 2018/05/25.
 */
App.extend('group', function() {

    let self = this;
    // 列表存储key
    this.history_group_key = 'group_history';
    this.list_key = 'group_list';
    this.group_list = Common.cache.getListData(this.list_key);
    this.group_history = Common.cache.getListData(this.history_group_key, {});

    /**
     * 初始化
     */
    this.init = function() {
        Model.set('group_list', this.group_list).watch('group_list', this.display);
        Model.set('group_history', this.group_history).watch('group_history', this.display);
        View.display('group', 'list', this.group_list, '#history-group');
    };

    /**
     * 创建新的分组
     * @param group_name
     */
    this.new_group = function(group_name) {
        if (!group_name) {
            Common.notification('Error: group name is empty.', 'danger');
            return false;
        }

        // 检查重名
        for (let i in this.group_list) {
            if (this.group_list[i]['name'] === group_name) {
                Common.notification('Error: group name already exists.', 'danger');
                return false;
            }
        }

        // 添加新的分组
        let group_id = Date.parse(new Date());
        this.group_list.push({
            group_id: group_id.toString(),
            name: group_name,
            history_count: 0
        });

        Common.cache.save(this.list_key, this.group_list);
        Common.notification('save ok.');
        // 设置数据
        Model.set('group_list', this.group_list);
        return true;
    };

    /**
     * 修改分组名称
     * @param group_id
     * @param group_name
     */
    this.modify_group = function(group_id, group_name) {
        if (!group_id || !group_name) {
            Common.notification('Error: group name or group id is empty.', 'danger');
            return false;
        }

        // 检查重名
        for (let i in this.group_list) {
            if (this.group_list[i]['name'] === group_name && this.group_list[i]['group_id'].toString() !== group_id) {
                Common.notification('Error: group name already exists.', 'danger');
                return false;
            }
        }

        // 修改分组名称
        for (let i in this.group_list) {
            if (this.group_list[i]['group_id'].toString() === group_id) {
                this.group_list[i]['name'] = group_name;
                break;
            }
        }

        Common.cache.save(this.list_key, this.group_list);
        Common.notification('save ok.');
        // 设置数据
        Model.set('group_list', this.group_list);
        return true;
    };

    /**
     * 删除数据
     */
    this.delete = function(group_id) {
        if (!group_id) {
            return false;
        }
        let _this = this;
        this.group_list.forEach(function(item, i) {
            if (group_id === item['group_id'].toString()) {
                _this.group_list.splice(i, 1);
            }
        });
        //for (let i in this.group_list) {
        //    if (group_id === this.group_list[i]['group_id'].toString()) {
        //        this.group_list.splice(i, 1);
        //    }
        //}
        Common.cache.save(this.list_key, this.group_list);

        // 删除history关系
        for (let i in this.group_history) {
            if (this.group_history.hasOwnProperty(i)) {
                if (i === group_id) {
                    delete  this.group_history[i];
                    break;
                }
            }
        }
        Common.cache.save(this.history_group_key, this.group_history);
        Model.set('group_list', this.group_list);
    };

    /**
     * history加入分组
     * @param group_id
     * @param history_hash_key
     */
    this.add_history = function(group_id, history_hash_key) {
        //let data = Common.cache.getListData(this.history_group_key, {});
        if (!this.group_history.hasOwnProperty(group_id)) {
            this.group_history[group_id] = [];
        }

        let not_exist = false;
        for (let i in this.group_history[group_id]) {
            if (this.group_history[group_id][i] === history_hash_key) {
                not_exist = true;
            }
        }

        if (!not_exist) {
            this.group_history[group_id].push(history_hash_key);

            // 更新group_list中的history数量
            for (let i in this.group_list) {
                if (this.group_list[i]['group_id'].toString() === group_id) {
                    let history_count = this.group_list[i]['history_count'] ? this.group_list[i]['history_count'] : 0;
                    this.group_list[i]['history_count'] = history_count + 1;
                }
            }
            Common.cache.save(this.list_key, this.group_list);
            Model.set('group_history', this.group_history);
            this.display();
        }

        Common.cache.save(this.history_group_key, this.group_history);
    };

    /**
     * 根据group_id加载history list
     * @param group_id
     */
    this.load_history = function(group_id) {
        let history_keys = null,
            _this = this;
        if (group_id) {
            history_keys = [-1];
            if (this.group_history[group_id]) {
                history_keys = this.group_history[group_id];
            } else {
                for (let i in this.group_list) {
                    if (this.group_list[i]['group_id'].toString() === group_id) {
                        this.group_list[i]['history_count'] = 0;
                    }
                }
            }
            Common.cache.save(this.list_key, this.group_list);
        }
        App.history.selected_object = {
            type: 'group',
            key: group_id
        };
        App.history.refresh_history_list(null, null, history_keys, function(history_list) {
            if (group_id) {
                let group_list_len = _this.group_list.length,
                    history_count = history_list.length;
                for (let i = 0; i < group_list_len; i++) {
                    if (_this.group_list[i]['group_id'].toString() === group_id) {
                        if (_this.group_list[i]['history_count'] !== history_count) {
                            _this.group_list[i]['history_count'] = history_count;
                            Common.cache.save(_this.list_key, _this.group_list);
                            _this.display();
                        }
                        break;
                    }
                }
            }
        });
    };

    /**
     * 获取分组下拉选择数据
     */
    this.get_select_view = function(selected_group_id) {
        return View.get_view('group', 'select', {'list': this.group_list, 'selected_group_id': selected_group_id});
    };

    /**
     * 渲染页面
     */
    this.display = function() {
        // 分组列表
        View.display('group', 'list', self.group_list, '#history-group');
        // 表单下拉列表
        self.display_selector(App.form.selected_group_id);
    };

    /**
     * 渲染下拉菜单
     * @param selected_group_id
     */
    this.display_selector = function(selected_group_id) {
        View.display('group', 'select', {
            'list': self.group_list,
            'selected_group_id': selected_group_id
        }, '.group-selector');
    };
});
