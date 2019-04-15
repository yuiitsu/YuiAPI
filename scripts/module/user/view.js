/**
 * User View
 */
App.view.extend('user', function() {
    /**
     *
     */
    this.is_login = function() {
        return `
            {{ if data['avatar_url'] }}
            <img src="{{ data['avatar_url'] }}" alt="" class="user-avatar" />
            {{ else }}
            <i class="mdi mdi-account-circle"></i>
            {{ end }}
            {{ if data['nickname'] }}
            {{ data['nickname'] }}
            {{ else }}
            {{ data['account'] }}
            {{ end }}
        `;
    };

    this.no_login = function() {
        return `
            <a href="#" id="login">Login</a>
        `;
    };
});
