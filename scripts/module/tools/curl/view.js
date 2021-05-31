/**
 * Tools JSON Format View
 * Created by Yuiitsu on 2020/03/27.
 */
App.view.extend('tools.curl', function() {

    this.layout = function() {
        return `
            <div class="form-edit-parameter-box">
                <div class="form-edit-parameter-content">
                    <textarea id="form-data-format-content" class="bg-level-3 border-level-0 color-level-0">
                    </textarea>
                </div>
                <div class="h-30">
                    <button class="btn btn-primary js-handler" id="form-data-format">OK</button>
                </div>
            </div>
        `;
    };
});
