/**
 * Tools JSON Format View
 * Created by Yuiitsu on 2020/03/27.
 */
App.view.extend('tools.jsonFormat', function() {

    this.layout = function() {
        return `
            <nav class="tools-nav">
                <div class="side-title">Tools</div>
                <ul>
                    <li>JSON Format</li>
                    <li>JSON Compare</li>
                </ul>
            </nav>
            <div class="display-flex-auto display-flex-column overflow-hide">
                <div class="tools-json-format-header display-flex-row">
                    <div class="display-flex-auto json-format-type">
                        <button class="btn btn-default margin-right-10">Format</button>
                        <button class="btn btn-default">Raw</button>
                    </div>
                    <div class="display-flex-auto">
                    </div>
                </div>
                <div class="display-flex-row display-flex-auto overflow-hide">
                    <div class="display-flex-auto border-right-level-1 display-flex-column padding-10">
                        <textarea class="tools-json-format-textarea display-flex-auto" placeholder="Paste JSON String"></textarea>
                    </div>
                    <div class="display-flex-auto display-flex-column response-body code-theme-dark">
                        <pre class="tools-json-format-pretty-container display-flex-auto">
                        </pre>
                    </div>
                </div>
            </div>
        `;
    }
});
