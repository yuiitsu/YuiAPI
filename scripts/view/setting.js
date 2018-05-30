/**
 * 设置View
 * Created by Yuiitsu on 2018/05/22.
 */
View.extend('setting', function() {
    /**
     * 设置界面
     * @returns {string}
     */
    this.setting = function() {
        return `
            <ul class="history-tips-list setting-list">
                <li>Export</li>
                <li>Import</li>
                <li>default assertion</li>
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
                    <li>{{ no }}. {{ data['list'][i] }}</li>       
                    {{ end }}
                </ul>
                <h3 class="align-right"><em>Thank you for choosing YuiAPI</em></h3>
                <p class="align-right"><em>Yuiitsu</em></p>
            </div>
        `;
    };
});
