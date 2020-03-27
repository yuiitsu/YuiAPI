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

    this.renderPretty = function() {
        let prettyData = self.module.response.syntaxHighlightPro(JSON.parse(Model.get('toolsJSONString')));
        console.log(prettyData);
        $('.tools-json-format-pretty-container').html(prettyData);
    };
});
