/**
 * 分组View
 * Created by Yuiitsu on 2018/05/25.
 */
View.extend('group', function() {

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
                <li data-group-id="{{ data[i]['group_id'] }}">{{ data[i]['name'] }} <em>({{ history_count }})</em></li>           
                {{ end }}
            </ul>
            {{ else }}
            <div class="history-group-empty">
               <em>Nothing in your group.</em>
            </div>
            {{ end }}
        `;
    };

    this.form = function() {
        return `
            <div class="history-group-form">
                <label>Group Name</label>       
                <div class="h-30">
                    <input type="text" class="input-text" placeholder="Enter group name" id="history-group-name" />
                </div>
                <div class="h-30">
                    <button class="btn btn-primary" id="history-group-save">Save</button>
                </div>
            </div>
        `;
    };

    this.select = function() {
        return `
            <select class="history-group-selector">
                <option value="">select group</option>
                {{ for var i in data['list'] }}
                {{ var selected = data['list'][i]['group_id'].toString() === data['selected_group_id'] ? 'selected="selected"' : '' }}
                <option value="{{ data['list'][i]['group_id'] }}" {{ selected }}>{{ data['list'][i]['name'] }}</option>
                {{ end }}
            </select>
        `;
    };
});
