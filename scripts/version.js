/**
 * 版本更新记录
 * Created by Yuiitsu on 2018/05/22.
 */
let version = {

    current_version: 'v0.0.5',

    /**
     * 更新记录
     */
    update_logs: {
        'v0.0.5': [
            'Adjust UI',
            'Add form-data request',
            'Add upload file function',
            'Add the record of the response headers',
            'Add the description to request arguments',
            'fixed an issues where the form could not be changed when selecting the history record',
            'fixed an issues where the response could not be show when the http status was not 200',
        ]
    },

    /**
     * 检查版本，如果缓存中的版本与当前版本不匹配，显示当前版本对应的更新记录
     */
    check: function() {
        let version = localStorage.getItem('version');
        if (version !== this.current_version) {
            // 将新版本号写入缓存
            localStorage.setItem('version', this.current_version);
            // 显示更新记录
            Common.module('Update logs', View.get_view('setting', 'version_update_logs', {
                list:this.update_logs[this.current_version],
                current_version: this.current_version
            }), '<button class="btn btn-primary module-close">Close</button>');
        }
    }
};

$(function() {
    version.check();
});
