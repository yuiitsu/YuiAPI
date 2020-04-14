/**
 * Tools JSON Format View
 * Created by Yuiitsu on 2020/03/27.
 */
App.view.extend('tools.textCompare', function() {

    this.layout = function() {
        return `
            <div class="tools-header display-flex-row border-bottom-level-1">
                <div class="display-flex-auto json-format-type">
                </div>
                <div class="display-flex-auto tools-item-title">
                    Text Compare
                </div>
            </div>
            <div class="display-flex-row display-flex-auto overflow-hide">
                <div class="display-flex-auto border-right-level-1 display-flex-row padding-10">
                    <div class="tools-compare-line-number-container"></div>
                    <div class="tools-compare-box padding-10 border-level-1 bg-level-3 display-flex-auto" contenteditable="true" data-type="a" id="tools-compare-a"></div>
                </div>
                <div class="display-flex-auto display-flex-column padding-10">
                    <div class="tools-compare-box padding-10 border-level-1 bg-level-3" contenteditable="true" data-type="b" id="tools-compare-b"></div>
                </div>
            </div>
        `;
    };

    this.prettyLine = function(data) {
        return `
            {{ for var i in data }}
            {{ var lineNumber = parseInt(i) + 1 }}
            <div class="tools-compare-pretty-line">
                <div class="tools-compare-pretty-line-number">{{ lineNumber }}</div>
                <pre class="">
                    <span>{{  data[i] }}</span>
                </pre>
            </div>
            {{ end }}
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
