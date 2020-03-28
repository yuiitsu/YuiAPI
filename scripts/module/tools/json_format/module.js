/**
 * Created by onlyfu on 2020/03/27.
 */
App.module.extend('tools.jsonFormat', function() {
    //
    let self = this;
    //
    Model.default['toolsJSONString'] = '';
    //
    this.init = function() {
        //
        Model.set('toolsJSONString', Model.default.toolsJSONString).watch('toolsJSONString', this.renderPretty);
        //
        this.view.display('tools.jsonFormat', 'layout', {}, '.js-main-container-tools');
    };

    this.renderPretty = function(data) {
        let result = '';
        try {
            result = self.module.response.syntaxHighlightPro(JSON.parse(data));
            result = self.view.getView('tools.jsonFormat', 'prettyPre', result);
        } catch (e) {
            result = self.view.getView('tools.jsonFormat', 'error', {});
        }
        $('.tools-json-format-pretty-container').html(result);
    };
});
