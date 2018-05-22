/**
 * 历史记录View
 * Created by Yuiitsu on 2018/05/21.
 */
View.extend('history', function() {
    /**
     * 侧边栏
     * @returns {string}
     */
    this.sidebar = function() {
        return `
            <ul class="history-group-tab">
                <li class="focus">Host</li>
                <!--
                <li>Group</li>
                -->
            </ul>
            <div class="history-host radius-small-all">
                <ul id="history-host" class="radius-small-all">
                    <li class="focus"><span class="radius-small-all">All (<em id="history-count-all">...</em>)</span></li>
                    {{ for var i in data }}
                    <li data-host="{{ data[i] }}">
                        <span>{{ data[i] }}</span>
                        <i class="mdi mdi-close"></i>
                    </li>
                    {{ end }}
                </ul>
            </div>
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
    }
});
