/**
 * Navigation View
 * Created by Yuiitsu on 2020/03/28.
 */
App.view.extend('navigation', function() {

    this.layout = function(data) {
        return `
            {{ for var i in data }}
            {{ var focus = data[i]['is_focus'] ? 'focus' : '' }}
            <a href="#" class="{{ focus }}">{{ data[i]['name'] }}</a>
            {{ end }}
        `;
    }
});
