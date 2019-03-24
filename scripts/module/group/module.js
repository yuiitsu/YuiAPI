/**
 * group module
 * Created by onlyfu on 2018/05/25.
 */
App.module.extend('group', function() {

    let self = this;
    // 列表存储key
    this.history_group_key = 'group_history';
    this.listKey = 'group_list';
    this.group_history = this.module.common.cache.getListData(this.history_group_key, {});

    //
    Model.default['groupList'] = localStorage.getItem(this.listKey) ? localStorage.getItem(this.listKey) : '[]';

    /**
     * 初始化
     */
    this.init = function() {
        //
        Model.set('groupList', Model.default.groupList).watch('groupList', this.module.history.renderHistoryList);
    };

    /**
     * 创建新的分组
     * @param groupName
     */
    this.newGroup = function(groupName) {
        if (!groupName) {
            self.module.common.notification('Error: group name is empty.', 'danger');
            return false;
        }

        let groupList = JSON.parse(Model.get('groupList')),
            groupListLen = groupList.length;
        // 检查重名
        for (let i = 0; i < groupListLen; i++) {
            if (groupList[i]['name'] === groupName) {
                self.module.common.notification('Error: group name already exists.', 'danger');
                return false;
            }
        }

        // 添加新的分组
        let group_id = Date.parse(new Date());
        groupList.push({
            group_id: group_id.toString(),
            name: groupName,
            history_count: 0
        });

        self.module.common.cache.save(this.listKey, groupList);
        self.module.common.notification('save ok.');
        // 设置数据
        Model.set('groupList', JSON.stringify(groupList));
        return true;
    };

    /**
     * 修改分组名称
     * @param groupId
     * @param groupName
     */
    this.modifyGroup = function(groupId, groupName) {
        if (!groupId || !groupName) {
            self.module.common.notification('Error: group name or group id is empty.', 'danger');
            return false;
        }

        let groupList = JSON.parse(Model.get('groupList')),
            groupListLen = groupList.length;
        // 检查重名
        for (let i = 0; i < groupListLen; i++) {
            if (groupList[i]['name'] === groupName) {
                self.module.common.notification('Error: group name already exists.', 'danger');
                return false;
            }
        }

        // 修改分组名称
        for (let i = 0; i < groupListLen; i++) {
            if (groupList[i]['group_id'].toString() === groupId) {
                groupList[i]['name'] = groupName;
                break;
            }
        }

        self.module.common.cache.save(this.listKey, groupList);
        self.module.common.notification('save ok.');
        // 设置数据
        Model.set('groupList', JSON.stringify(groupList));
        return true;
    };

    /**
     * 删除数据
     */
    this.delete = function(groupId) {
        if (!groupId) {
            return false;
        }
        let _this = this,
            groupList = JSON.parse(Model.get('groupList')),
            groupListLen = groupList.length,
            newGroupList = [];

        for (let i = 0; i < groupListLen; i++) {
            if (groupId !== groupList[i]['group_id'].toString()) {
                newGroupList.push(groupList[i]);
            }
        }
        self.module.common.cache.save(this.listKey, newGroupList);
        //
        Model.set('groupList', JSON.stringify(newGroupList));
    };

    this.getGroupList = function() {
        return this.group_list;
    };

    /**
     * history加入分组
     * @param groupId
     * @param historyHashKey
     */
    this.moveHistoryToGroup = function(groupId, historyHashKey) {
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
            self.common.cache.save(this.list_key, this.group_list);
            Model.set('group_history', this.group_history);
            this.display();
        }

        self.common.cache.save(this.history_group_key, this.group_history);
    };

    /**
     * 获取分组下拉选择数据
     */
    this.getSelectView = function(selected_group_id) {
        return self.view.getView('group', 'select', {
            'list': JSON.parse(Model.get('groupList')),
            'selected_group_id': selected_group_id
        });
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
