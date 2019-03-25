/**
 * Response View
 * Created by Yuiitsu on 2019/03/21.
 */
App.view.extend('response', function() {
    this.layout = function() {
        return `
            {{ var headers = data['headers'] ? data['headers'] : 'click the send button for a response' }}
            {{ var status = (data['status'] || data['status'] === 0) ? data['status'] : 'None' }}
            {{ var status_class = data['status'] ? (data['status'] === 200 ? 'color-success' : 'color-failed') : 'color-failed' }}
            {{ var use_time = data['use_time'] ? data['use_time'] : 'None' }}
            {{ var response = data['response'] ? data['response'] : '' }}
            {{ var codeThemeClass = 'code-theme-' + data['codeTheme'] }}
            {{ if response }}
            <nav class="response-header border-bottom-level-1 display-flex-row">
                <div class="display-flex-auto response-header-tab">
                    <a href="#" class="bg-level-0">Body</a>
                    <a href="#">Headers</a>
                </div>
            </nav>
            <div class="response-body display-flex-auto display-flex-column code-theme-dark">
                <pre class="display-flex-auto">{{ response }}</pre>
            </div>
            {{ else }}
            <div class="response-empty display-flex-auto">
                <div class="response-empty-rectangle bg-level-2">Empty</div>
                <div>
                    Select history or click the Send button to get a response.
                </div>
            </div>
            {{ end }}
        `;
    }
});
