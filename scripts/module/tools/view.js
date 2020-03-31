/**
 * Tools View
 * Created by Yuiitsu on 2020/03/29.
 */
App.view.extend('tools', function() {

    this.layout = function(data) {
        return `
            <nav class="tools-nav border-right-level-1">
                <div class="side-title">Tools</div>
                <ul>
                    {{ for var i in data.tools }}
                    {{ var focus = data.tools[i]['is_focus'] ? 'focus': '' }}
                    <li class="border-top-level-1 {{ focus }}" data-key="{{ data.tools[i]['module'] }}">
                        {{ data.tools[i]['name'] }}
                    </li>
                    {{ end }}
                </ul>
            </nav>
            <div class="display-flex-auto display-flex-column overflow-hide tools-box"></div>
        `;
    };
});
