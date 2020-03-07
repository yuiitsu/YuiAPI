/**
 * setting module
 * Created by onlyfu on 2018/05/31.
 */
App.module.extend('setting', function() {
    //
    let self = this;
    //
    Model.default['defaultTheme'] = 'theme-dark';
    /**
     * 初始化，系统加载时会调用
     */
    this.init = function() {
        // default theme
        let localDefaultTheme = localStorage.getItem('defaultTheme');
        localDefaultTheme = localDefaultTheme ? localDefaultTheme : 'theme-light';
        Model.set('defaultTheme', Model.default['defaultTheme']).watch('defaultTheme', this.renderTheme);
        Model.set('defaultTheme', localDefaultTheme);
    };

    this.renderTheme = function() {
        $('body').removeClass().addClass(Model.get('defaultTheme'));
        self.view.display('setting', 'themeSelector', {
            defaultTheme: Model.get('defaultTheme')
        }, '.theme-selector');
    };

    /**
     * 关于
     */
    this.about = function() {
        let version = Version.current_version;
        self.module.common.module('About YuiAPI', self.view.getView('setting', 'about', {
            version: version
        }), '');
    };

    /**
     * 反馈
     */
    this.feedback = function() {

    };

    /**
     * 更新记录
     */
    this.updateLogs = function() {
        App.module.common.module('Update logs', self.view.getView('setting', 'version_update_logs', {
            list: Version.update_logs[Version.current_version],
            current_version: Version.current_version
        }), '<button class="btn btn-primary module-close js-handler">Close</button>');
    };
});
