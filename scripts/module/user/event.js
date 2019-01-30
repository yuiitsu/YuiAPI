/**
 * User Event
 */
Event.extend('user', function() {

    this.event = {
        open_login_window: function() {
            chrome.tabs.getCurrent(function(tab) {
                localStorage.setItem('current_tab_id', tab.id);
            });
            $('.login-action').on('click', '#login', function(e) {
                window.open('http://www.yuiapi.com/api/v1/third_part/github/auth', '',
                    'width=500,height=800');
            })
        }
    }
});
