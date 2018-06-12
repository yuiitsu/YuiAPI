/**
 * 历史记录View
 * Created by Yuiitsu on 2018/05/21.
 */
View.extend('history', function() {
    /**
     * 主界面
     */
    this.main = function() {
        return `
            <!-- History search start -->
            <div class="test-count-line left-content-top">
                <div class="test-count-data history-search-box">
                    <label class="history-search-label">Search:</label>
                    <input type="text" class="input-text" id="history-search" placeholder="name or url keywords. press enter" />
                </div>
            </div>
            <!-- History search end -->
            <div class="left-content-main">
                {{ if (data['host_list'] && data['host_list'].length > 0) || (data['history_list'] && data['history_list'].length > 0) }}
                <!-- History host start -->
                <div class="history-group-box" id="history-sidebar">{{ View.get_view('history', 'sidebar', data['host_list']) }}</div>
                <div class="history-switch" id="history-switch-button" title="Hide the sidebar">
                    <i class="mdi mdi-chevron-left vertical-middle"></i>
                </div>
                <!-- History host end -->
                <!-- History list-box start -->
                <div class="history-list-box" id="history-list-box">{{ View.get_view('history', 'main_list', data['history_list']) }}</div>
                <!-- History list-box end -->
                {{ else }}
                <div class="history-empty">
                    <div class="history-empty-box">
                        <h2><i class="mdi mdi-numeric-0-box-multiple-outline"></i></h2>
                        <p>Nothing in your history box. Requests that you send will be saved here.</p>
                    </div>
                </div>
                {{ end }}
            </div>
        `;
    };
    /**
     * 侧边栏
     * @returns {string}
     */
    this.sidebar = function() {
        return `
            <ul class="history-group-tab">
                <li class="focus">Host</li>
                <li>Group</li>
            </ul>
            <div class="history-host radius-small-all">
                <ul id="history-host" class="radius-small-all history-host-list">
                    {{ View.get_view('history', 'host_list', {'list': data}) }}
                </ul>
            </div>
            <!-- history group -->
            <div class="history-host history-group-list hide" id="history-group">{{ View.get_view('group', 'list', {}) }}</div>
        `;
    };

    /**
     * host list
     * @returns {string}
     */
    this.host_list = function() {
        return `
            <li class="focus"><span class="radius-small-all">All (<em id="history-count-all">...</em>)</span></li>
            {{ for var i in data['list'] }}
            {{ var focus = data['selected_host'] === data['list'][i] ? 'focus' : '' }}
            <li data-host="{{ data['list'][i] }}" class="{{ focus }}">
                <span>{{ data['list'][i] }}</span>
                <i class="mdi mdi-close"></i>
            </li>
            {{ end }}
        `;
    };

    /**
     * host单个数据菜单
     */
    this.host_item_menu = function() {
        return `
            <ul class="history-group-item-menu">
                <li class="history-cookies" data-host="{{ data['host'] }}">Cookies</li>
                <li class="history-test disabled" data-host="{{ data['host'] }}">Test</li>
                <li class="history-del color-failed" data-host="{{ data['host'] }}">Delete</li>
            </ul>
        `;
    };

    /**
     * 历史记录列表
     */
    this.main_list = function() {
        return `
            <table class="history-table" cellspacing="0">
                <thead>
                    <tr>
                        <th class="w-30" style="cursor: pointer">
                            <i class="mdi mdi-dots-horizontal font-size-20 history-all-action"></i>
                        </th>
                        <th class="w-50">Type</th>
                        <th class="align-left history-list-name">Name</th>
                        <th class="align-left">URL</th>
                    </tr>
                </thead>
                <tbody>
                    {{ for var i in data }}
                    {{ var request_type_icon = data[i]['type'] ? data[i]['type'][0] : '-' }}
                    <tr data-key="{{ data[i]['key'] }}">
                        <td class="w-30 history-item-action" data-key="{{ data[i]['key'] }}">
                            <i class="mdi mdi-dots-horizontal font-size-20"></i>
                        </td>
                        <td class="w-50 align-center request-type request-type-{{ data[i]['type'] }}">
                            <span>{{ request_type_icon }}</span>
                        </td>
                        <td>{{ data[i]['name'] }}</td>
                        <td>{{ data[i]['url'] }}</td>
                    </tr>
                    {{ end }}
                </tbody>
            </table>
        `;
    };

    this.history_all_action_menu = function() {
        return `
            <ul class="history-tips-list history-tips-all-list">
                <li class="history-clear color-failed">clear</li>
            </ul>
        `;
    };

    /**
     * 历史记录单个数据菜单
     * @returns {string}
     */
    this.history_item_menu = function() {
        return `
            <ul class="history-tips-list history-tips-add-list" data-key="{{ data['key'] }}">
                {{ if data['selected_object']['type'] === 'group' }}
                <li class="remove-from-group">Remove from group</li>
                {{ end }}
                <li class="add-to-group">Add to group</li>
                <li class="set-assertion disabled">Set assertion</li>
                <li class="history-move" data-type="up">Move up</li>
                <li class="history-move" data-type="down">Move down</li>
                <li class="delete color-failed">Delete</li>
            </ul>
        `;
    };

    /**
     * 添加到分组表单
     */
    this.add_to_group_form = function() {
        return `
            <div class="history-add-to-group-form">
                <div class="h-30 margin-bottom-10 margin-top-10 group-selector">
                    {{ App.group.get_select_view() }}
                </div>
                <div class="h-30">
                    <input type="hidden" class="history-key" value="{{ data['key'] }}" />
                    <button class="btn btn-primary js-handler" id="history-add-to-group">Save</button>
                </div>
            </div>
        `;
    };
});
