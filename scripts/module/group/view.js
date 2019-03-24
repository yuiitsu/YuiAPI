/**
 * 分组View
 * Created by Yuiitsu on 2018/05/25.
 */
App.view.extend('group', function() {

    /**
     * 列表
     * @returns {string}
     */
    this.list = function() {
        return `
            <div class="history-group-action">
                <button class="btn btn-primary" id="history-group-new">New Group</button>           
            </div>
            {{ if data && data.length > 0 }}
            <ul id="history-group-ul">
                <li data-group-id="">All</li>           
                {{ for var i in data }}
                {{ var history_count = data[i]['history_count'] ? data[i]['history_count'] : 0 }}
                <li data-group-id="{{ data[i]['group_id'] }}" data-group-name="{{ data[i]['name'] }}" class="history-group-item">{{ data[i]['name'] }} <em>({{ history_count }})</em></li>           
                {{ end }}
            </ul>
            {{ else }}
            <div class="history-group-empty">
               <em>Nothing in your group.</em>
            </div>
            {{ end }}
        `;
    };

    /**
     * 表单
     * @returns {string}
     */
    this.form = function() {
        return `
            <div class="history-group-form">
                {{ var name = data && data['groupName'] ? data['groupName'] : '' }}
                {{ var groupId = data && data['groupId'] ? data['groupId'] : '' }}
                <div class="history-group-form-line">
                    <input type="text" class="input-text bg-level-3 border-level-0" placeholder="Enter folder name" id="history-group-name" value="{{ name }}" />
                    <input type="hidden" id="history-group-id" value="{{ groupId }}" />
                </div>
                <div class="">
                    <button class="btn btn-primary js-handler" id="history-group-save">Save</button>
                </div>
            </div>
        `;
    };

    /**
     * 下拉菜单
     * @returns {string}
     */
    this.select = function() {
        return `
            <div class="history-group-selector-box">
                <select class="history-group-selector bg-level-3 border-level-0">
                    <option value="">default</option>
                    {{ for var i in data['list'] }}
                    {{ var selected = data['list'][i]['group_id'].toString() === data['selected_group_id'] ? 'selected="selected"' : '' }}
                    <option value="{{ data['list'][i]['group_id'] }}" {{ selected }}>{{ data['list'][i]['name'] }}</option>
                    {{ end }}
                </select>
            </div>
        `;
    };

    /**
     * 单个分组菜单
     */
    this.item_menu = function() {
        return `
            <ul class="history-group-item-menu">
                <li class="history-group-modify" data-group-id="{{ data['group_id'] }}" data-group-name="{{ data['name'] }}">Rename</li>      
                <li class="history-group-test disabled" data-group-id="{{ data['group_id'] }}">Test</li>
                <li class="history-group-del" data-group-id="{{ data['group_id'] }}">Delete</li>
            </ul>
        `;
    };
});
