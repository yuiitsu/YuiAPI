/**
 * 历史记录View
 * Created by Yuiitsu on 2018/05/21.
 */
App.view.extend('history', function() {
    /**
     * 主界面
     */
    this.main = function() {
        return `
            <!-- Search start -->
            <div class="history-search-container">
                <input type="text" 
                    class="input-text bg-level-3 border-level-0 history-search-key" 
                    placeholder="Search Key, Press Enter" 
                    value="{{ data['searchKey'] }}" />
                {{ if data['searchKey'] }}
                <i class="mdi mdi-close-circle-outline history-search-key-clear"></i>
                {{ end }}
            </div>
            <!-- Search end -->
            <!-- History host start -->
            {{ var selectHost = data['selectHost'] ? data['selectHost'] : 'All host' }}
            <div class="history-host-selector-container">
                <div class="history-host-selector bg-level-3 display-flex-row">
                    <div class="display-flex-auto">{{ selectHost }}</div>
                    <i class="mdi mdi-chevron-down"></i>
                </div>
            </div>
            <!-- History host end -->
            {{ if data['groupHistoryList'].length > 0 }}
            <div class="history-list-container display-flex-auto">
                {{ for var i in data['groupHistoryList'] }}
                {{ var groupHistory = data['groupHistoryList'][i] }}
                {{ var groupHistoryCount = groupHistory['historyList'].length }}
                {{ var hideClass = data['folderGroup'].indexOf(groupHistory['groupId']) !== -1 ? 'hide' : '' }}
                <div class="history-group-item">
                    <div class="display-flex-row">
                        <div class="display-flex-auto history-group-switch" data-group-id="{{ groupHistory['groupId'] }}">
                            {{ var arrowClass = hideClass === 'hide' ? 'menu-right' : 'menu-down' }}
                            <i class="mdi mdi-{{ arrowClass }}"></i>
                            <i class="mdi mdi-folder"></i>
                            {{ groupHistory['groupName'] }} ({{ groupHistoryCount }})
                        </div>
                        {{ if groupHistory['groupName'] === 'default' }}
                        <i class="mdi mdi-folder-plus-outline history-group-add-button"></i>
                        {{ else }}
                        <i class="mdi mdi-dots-vertical history-group-action cursor-pointer" 
                            data-group-id="{{ groupHistory['groupId'] }}" 
                            data-group-name="{{ groupHistory['groupName'] }}"></i>
                        {{ end }}
                    </div>
                    <ul class="{{ hideClass }}">
                        {{ for var j in groupHistory['historyList'] }}
                        {{ var history = groupHistory['historyList'][j] }}
                        {{ var statusClass = history['status'] === 200 ? 'color-success' : 'color-danger' }}
                        {{ var originUrl = history['originUrl'] ? history['originUrl'] : history['url'] }}
                        <li class="border-bottom-level-1 history-item" data-key="{{ history['key'] }}" title="{{ originUrl }}">
                            <div class="history-list-status-line display-flex-row">
                                <div class="display-flex-auto">
                                    <span class="bg-level-0 history-type history-type-{{ history['type'] }}">{{ history['type'] }}</span>
                                    <span class="{{ statusClass }}">{{ history['status'] }}</span>
                                </div>
                                <i class="mdi mdi-dots-vertical history-action cursor-pointer" data-key="{{ history['key'] }}"></i>
                            </div>
                            {{ if history['name'] }}
                            <h3>{{ history['name'] }}</h3>
                            {{ end }}
                            <p>{{ history['url'] }}</p>
                        </li>
                        {{ end }}
                    </ul>
                </div>
                {{ end }}
            </div>
            {{ else }}
            <div class="history-host-selector-container color-level-2">Nothing in your history box. Requests that you send will be saved here.</div>
            {{ end }}
        `;
    };

    /**
     * host list
     * @returns {string}
     */
    this.hostList = function() {
        return `
            <ul class="history-host-list-container tips-menu-container">
                <li class="display-flex-row"><span data-host="" class="display-flex-auto">All host</span></li>
                {{ for var i in data }}
                <li class="display-flex-row">
                    <span class="display-flex-auto" data-host="{{ data[i] }}">{{ data[i] }}</span>
                    <i class="mdi mdi-delete history-host-delete" data-host="{{ data[i] }}"></i>
                </li>       
                {{ end }}
            </ul>
        `;
    };

    /**
     * 分组菜单
     */
    this.groupAction = function() {
        return `
            <ul class="tips-menu-container">
                <li class="history-group-add-button" 
                    data-group-id="{{ data['groupId'] }}" 
                    data-group-name="{{ data['groupName'] }}">
                    <i class="mdi mdi-square-edit-outline"></i> 
                    Edit Group
                </li>
                <li class="color-danger history-group-delete" data-group-id="{{ data['groupId'] }}">
                    <i class="mdi mdi-delete"></i> 
                    Delete
                </li>
            </ul>
        `;
    };

    /**
     * 历史记录单个数据菜单
     * @returns {string}
     */
    this.historyItemMenu = function() {
        return `
            <ul class="tips-menu-container" data-key="{{ data['key'] }}">
                <li class="move-to-group">
                    <i class="mdi mdi-folder-move"></i> 
                    Move to group
                </li>
                <!--
                <li class="set-assertion disabled">Set assertion</li>
                -->
                <li class="history-delete color-danger">
                    <i class="mdi mdi-delete"></i> 
                    Delete
                </li>
            </ul>
        `;
    };

    /**
     * 移动到分组的表单
     */
    this.moveToGroup = function() {
        return `
            <div class="history-move-to-group-form">
                <div class="history-group-form-line">
                    {{ this.module.group.getSelectView() }}
                </div>
                <div class="">
                    <input type="hidden" class="history-key" value="{{ data['key'] }}" />
                    <button class="btn btn-primary js-handler" id="history-move-to-group">Save</button>
                </div>
            </div>
        `;
    };

    /**
     * 拖动目标位置line
     */
    this.drag_mask_line = function() {
        return `
            <tr id="history-drag-mask" data-drag-key="{{ data['key'] }}" data-position="{{ data['position'] }}"><td colspan="5">Insert here</td></tr>
        `;
    };

    /**
     * 下拉选择HOST
     * @returns {string}
     */
    this.select_host_list = function() {
        return `
            <ul class="tips-menu-container history-tips-list" id="host-select-item">
                {{ for var i in data }}
                <li style="text-align:left;">{{ data[i] }}</li>
                {{ end }}
            </ul>
        `;
    };

    /**
     * select history tab
     */
    this.history_tab = function() {
        return `
            {{ for var i in data }}
            {{ var focus = data[i]['focus'] === 1 ? 'focus' : '' }}
            <div class="history-tab-item display-flex-auto {{ focus }}" data-hash="{{ data[i]['hash'] }}" title="{{ data[i]['url'] }}">
                <em></em>
                {{ data[i]['name'] }} {{ data[i]['url'] }}
                <span data-hash="{{ data[i]['hash'] }}"><i class="mdi mdi-close"></i></span>
            </div>
            {{ end }}
        `;
    }
});
