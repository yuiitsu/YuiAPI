/**
 * 通用View
 * Created by Yuiitsu on 2018/06/05.
 */
View.extend('common', function() {

    this.module = function() {
        return `
            <div class="module-box module-box-{{ data['module_id'] }}">
                <div class="module-mask"></div>
                <div class="module-content">
                    <div class="module-header">{{ data['name'] }}
                        <i class="mdi mdi-close fr module-close" data-module-id="{{ data['module_id'] }}"></i>
                    </div>
                    <div class="module-main">{{ data['content'] }}</div>
                    <div class="module-actions">{{ data['action'] }}</div>
                </div>
            </div>
        `;
    };

    this.tips = function() {
        return `
            <div id="tips-box">
                <div class="tips-array">
                    <span class="tips-array-out"></span>
                    <span class="tips-array-in"></span>
                </div>
                <div id="tips-content">{{ data['content'] }}</div>
            </div>
        `;
    };

    this.notification = function() {
        return `
            <div id="notification-box" class="bg-{{ data['bg'] }}">{{ data['text'] }}</div>
        `;
    };

    this.dialog = function() {};
});

