/**
 * Response View
 * Created by Yuiitsu on 2019/03/21.
 */
App.view.extend('response', function() {
    this.layout = function() {
        return `
            {{ var headers = data['headers'] ? data['headers'] : 'click the send button for a response' }}
            {{ var status = (data['status'] || data['status'] === 0) ? data['status'] : 'None' }}
            {{ var status_class = data['status'] ? (data['status'] === 200 ? 'color-success' : 'color-danger') : 'color-danger' }}
            {{ var use_time = data['use_time'] ? data['use_time'] : 'None' }}
            {{ var response = data['showResponseDataType'] === 'Body' ? (data['response'] ? data['response'] : '') : (data['headers'] ? data['headers'] : '') }}
            {{ var codeThemeClass = 'code-theme-' + data['codeTheme'] }}
            {{ if status > 0 }}
            <nav class="response-header border-bottom-level-1 display-flex-row">
                <div class="display-flex-auto response-header-tab">
                    {{ var tabs = ['Body', 'Headers'] }}
                    {{ for var i in tabs }}
                    {{ var focus = tabs[i] === data['showResponseDataType'] ? 'bg-level-0' : '' }}
                    <span class="{{ focus }}">{{ tabs[i] }}</span>
                    {{ end }}
                </div>
                <div class="response-status-and-time">
                    status: <span class="{{ status_class }}">{{ status }}</span> time: <span>{{ use_time }}</span>ms
                </div>
            </nav>
            <div class="response-body display-flex-auto display-flex-column code-theme-dark">
                <pre class="display-flex-auto">{{ response }}</pre>
                <i class="mdi mdi-clipboard-text response-body-format"></i>
            </div>
            {{ else }}
            <div class="response-empty display-flex-auto">
                <div class="response-empty-rectangle bg-level-2">( ´•︵•\` )</div>
                <div>
                    The server is not responding
                </div>
            </div>
            {{ end }}
        `;
    };

    this.empty = function() {
        return `
            <div class="response-empty display-flex-auto">
                <div class="response-empty-rectangle bg-level-2">U・ᴥ・U</div>
                <div>
                    Select history or click the Send button to get a response.
                </div>
            </div>
        `;
    };

    this.format = function() {
        return `
            <div class="response-format-modal display-flex-column">
                <textarea readonly="readonly"
                    class="bg-level-3 border-level-0 color-level-0 display-flex-auto" id="response-body">{{ data['responseBody'] }}</textarea>
                <div class="display-flex-row margin-top-10">
                    <div class="display-flex-auto response-format-type">
                        <span class="bg-level-0">Format</span>
                        <span>Raw</span>
                    </div>
                    <button class="btn btn-primary response-body-copy">Copy</button>
                </div>
            </div>
        `;
    }
});
