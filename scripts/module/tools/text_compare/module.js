/**
 * Created by onlyfu on 2020/03/27.
 */
App.module.extend('tools.textCompare', function() {
    //
    let self = this;
    //
    Model.default['tools.textCompare'] = '';

    this.renderLayout = function() {
        self.view.display('tools.textCompare', 'layout', {}, '.tools-box');
    };

    this.renderPretty = function(data) {
        let result = '';
        try {
            result = unescape(data.replace(/\\u/g, '%u'));
        } catch (e) {
            result = self.view.getView('tools.unicode', 'error', {});
        }
        $('.tools-unicode-result-container').html(result);
    };
});
