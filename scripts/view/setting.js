/**
 * 设置View
 * Created by Yuiitsu on 2018/05/22.
 */
View.extend('setting', function() {
    /**
     * 设置界面
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
    }
});
