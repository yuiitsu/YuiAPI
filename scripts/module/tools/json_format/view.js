/**
 * Tools JSON Format View
 * Created by Yuiitsu on 2020/03/27.
 */
App.view.extend('tools.jsonFormat', function() {

    this.layout = function() {
        return `
            <div class="tools-header display-flex-row border-bottom-level-1">
                <div class="display-flex-auto json-format-type">
                    <span class="bg-level-0">Format</span>
                    <span>Raw</span>
                </div>
                <div class="display-flex-auto tools-item-title">
                    JSON Format
                </div>
            </div>
            <div class="display-flex-row display-flex-auto overflow-hide">
                <div class="display-flex-auto border-right-level-1 display-flex-column padding-10">
                    <textarea class="tools-json-format-textarea display-flex-auto bg-level-3 border-level-0 color-level-0" placeholder="Paste JSON String"></textarea>
                </div>
                <div class="display-flex-auto display-flex-column response-body tools-json-format-pretty-container code-theme-dark"></div>
            </div>
        `;
    };

    this.prettyPre = function(data) {
        return `
            <pre class="display-flex-auto">{{ data }}</pre>
        `;
    };

    this.error = function() {
        return `
            <div class="response-empty display-flex-auto">
                <div class="response-empty-rectangle bg-level-2">U・ᴥ・U</div>
                <div>
                    JSON String parsing failed.
                </div>
            </div>
        `;
    }
});
