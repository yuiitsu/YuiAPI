/**
 * form module
 * Created by onlyfu on 2018/05/25.
 */
App.extend('form', function() {
    this.selected_group_id = '';
    /**
     * 初始化
     */
    this.init = function() {
        View.display('form', 'layout', {'list': [], 'selected_group_id': this.selected_group_id}, '#form-box');
    }
});

