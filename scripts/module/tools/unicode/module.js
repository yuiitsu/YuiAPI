/**
 * Created by onlyfu on 2020/03/27.
 */
App.module.extend('tools.unicode', function() {
    //
    let self = this;
    //
    Model.default['tools.unicode'] = '';
    //
    this.init = function() {
        //
        Model.set('tools.unicode', Model.default['tools.unicode']).watch('tools.unicode', this.renderPretty);
    };

    this.renderLayout = function() {
        self.view.display('tools.unicode', 'layout', {}, '.tools-box');
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
