/**
 * Created by onlyfu on 2020/03/29.
 */
App.module.extend('tools', function() {
    //
    let self = this, 
        tools = [
            {
                name: 'JSON Format',
                module: 'tools.jsonFormat',
                is_focus: true
            },
            {
                name: 'Text Compare',
                module: 'tools.textCompare',
                is_focus: false
            },
            {
                name: 'Unicode Decode',
                module: 'tools.unicode',
                is_focus: false
            }
        ];
    //
    this.init = function() {
        //
        Model.set('tools.items', []).watch('tools.items', this.renderItem);
        //
        this.view.display('tools', 'layout', {}, '.js-main-container-tools');
        //
        Model.set('tools.items', tools);
    };

    this.renderNavigation = function(data) {
        this.view.display('tools', 'navigation', {tools: data}, '.tools-nav-box');
    }

    this.renderItem = function(data) {
        let currentTool = '';
        data.forEach(element => {
            if (element.is_focus) {
                currentTool = element.module;
            }
        });
        //
        self.module[currentTool].renderLayout();
        //
        self.renderNavigation(data);
    };

    this.switch = function(key) {
        let tools = Model.get('tools.items');
        tools.forEach(e => {
            if (e.module === key) {
                e.is_focus = true;
            } else {
                e.is_focus = false;
            }
        });
        //
        Model.set('tools.items', tools);
    };
});
