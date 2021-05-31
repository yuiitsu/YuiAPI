/**
 * Created by onlyfu on 2021/05/12.
 */
App.module.extend('tools.curl', function() {
    //
    let self = this;
    //
    Model.default['toolsJSONString'] = '';
    //
    this.init = function() {
        //
        Model.set('toolsJSONString', Model.default.toolsJSONString).watch('toolsJSONString', this.renderPretty);
    };

    this.show = function() {
        let requestData = Model.get('requestData');
        console.log(requestData);
        let curls = ['curl -X ' + requestData.type];
        //
        if (requestData.type in ['GET']) {
            let url = requestData.url;
            // for (var i = 0; i < requestData.data.) {}
        }
        curls.push(requestData.url);
        console.log(curls);
        self.module.common.module('cURL', self.view.getView('tools.curl', 'layout', {}), '');
    };

    this.renderLayout = function() {
        self.view.display('tools.jsonFormat', 'layout', {}, '.tools-box');
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
