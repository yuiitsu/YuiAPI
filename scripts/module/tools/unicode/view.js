/**
 * Tools JSON Format View
 * Created by Yuiitsu on 2020/03/27.
 */
App.view.extend('tools.unicode', function() {

    this.layout = function() {
        return `
            <div class="tools-header display-flex-row border-bottom-level-1">
                <div class="display-flex-auto json-format-type">
                </div>
                <div class="display-flex-auto tools-item-title">
                    Unicode Decode
                </div>
            </div>
            <div class="display-flex-row display-flex-auto overflow-hide">
                <div class="display-flex-auto border-right-level-1 display-flex-column padding-10">
                    <textarea class="tools-unicode-textarea display-flex-auto bg-level-3 border-level-0 color-level-0" placeholder="Paste Unicode"></textarea>
                </div>
                <div class="display-flex-auto display-flex-column response-body tools-unicode-result-container code-theme-dark"></div>
            </div>
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
