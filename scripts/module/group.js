/**
 * group module
 * Created by onlyfu on 2018/05/25.
 */
App.extend('group', function() {

    // 列表存储key
    this.list_key = 'group_list';
    this.group_list = Common.cache.getListData(this.list_key);

    /**
     * 初始化
     */
    this.init = function() {
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
                Common.notification('Error: group name is existed.', 'danger');
                return false;
            }
        }

        // 添加新的分组
        let group_id = Date.parse(new Date());
        this.group_list.push({
            group_id: group_id,
            name: group_name
        });

        Common.cache.save(this.list_key, this.group_list);
        Common.notification('save ok.');
        // 重载
        this.init();
        return true;
    };

    /**
     * 获取分组下拉选择数据
     */
    this.get_select_view = function() {
        return View.get_view('group', 'select', this.group_list);
    };
});
