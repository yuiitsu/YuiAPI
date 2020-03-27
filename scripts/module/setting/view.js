/**
 * 设置View
 * Created by Yuiitsu on 2018/05/22.
 */
App.view.extend('setting', function() {
    this.themeSelector = function(data) {
        return `
            {{ var themes = ['theme-dark', 'theme-light'] }}
            {{ for var i in themes }}
            {{ var selected = data.defaultTheme === themes[i] ? 'border-level-5': '' }}
            <span class="theme-selector-{{ themes[i] }} border-level-0 {{ selected }}" data-type="{{ themes[i] }}"></span>
            {{ end }}
        `;
    };
    /**
     * 设置界面
     * @returns {string}
     */
    this.setting = function() {
        return `
            <ul class="history-tips-list setting-list  tips-menu-container">
                <!--
                <li data-module="setting" data-method="feedback">Feedback</li>
                -->
                <li data-module="setting" data-method="updateLogs">What's new?</li>
                <li data-module="setting" data-method="about">About YuiAPI</li>
            </ul>
        `;
    };

    /**
     * 默认断言设置界面
     * @returns {string}
     */
    this.default_assertion = function() {
        return `
            <p style="height:30px;line-height:30px;">
            <label>
            <input type="radio" name="default-assertion-type" checked="checked" value="Json" /> Json
            </label>
            </p>
            <textarea style="width:100%;height:468px;" id="default-assertion-content">{{ data }}</textarea>
        `;
    };

    /**
     * 版本更新记录
     * @returns {string}
     */
    this.version_update_logs = function() {
        return `
            <div class="version-update-logs">
                <h2>Current Version: {{ data['current_version'] }}</h2>
                <ul>
                    {{ for i in data['list'] }}
                    {{ var no = parseInt(i) + 1 }}
                    <li>{{ data['list'][i] }}</li>       
                    {{ end }}
                </ul>
                <h3 class="align-right"><em>Thank you for choosing YuiAPI</em></h3>
                <p class="align-right"><em>Yuiitsu</em></p>
            </div>
        `;
    };

    /**
     * 关于
     */
    this.about = function() {
        return `
            <div class="about">
                <h2>YuiAPI <em>{{ data['version'] }}</em></h2>       
                <div class="about-content">
                    <p>YuiAPI是一非常简单易用的API调试客户端，同时可以生成漂亮的API文档(开发中)，更多的功能在开发中。</p>
                    <p>本软件由Yuiitsu独立开发维护，如果有任何问题可以通过<a href="https://github.com/yuiitsu" target="_blank" class="underline">Github</a>联系。也可以在上面找到项目的源代码。</p>
                    <p>再次感谢您选择使用YuiAPI.</p>
                    <p class="align-right"><em>Yuiitsu</em></p>
                    <p class="align-right"><em>2018-06-06</em></p>
                </div>
            </div>
        `;
    };
});
