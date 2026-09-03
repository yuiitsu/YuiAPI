/**
 * cURL import view.
 */
App.view.extend('tools.curl', function() {

    this.import_layout = function() {
        return `
            <div class="curl-dialog-box">
                <textarea id="curl-command" class="bg-level-3 border-level-0 color-level-0"
                    spellcheck="false" placeholder="Paste a cURL command"></textarea>
                <div class="curl-import-error color-danger" role="alert"></div>
                <button type="button" class="btn btn-primary js-handler" id="curl-import">import</button>
            </div>
        `;
    };

    this.export_layout = function() {
        return `
            <div class="curl-dialog-box">
                <textarea id="curl-export-command" class="bg-level-3 border-level-0 color-level-0"
                    spellcheck="false" readonly="readonly"></textarea>
                <div class="curl-import-error"></div>
                <button type="button" class="btn btn-primary" id="curl-export-copy">
                    <i class="mdi mdi-content-copy"></i> Copy
                </button>
            </div>
        `;
    };
});
