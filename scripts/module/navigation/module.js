/**
 * Created by onlyfu on 2020/03/28.
 */
App.module.extend('navigation', function() {
    //
    let self = this, 
        navigation = [
            {
                name: 'Client',
                is_focus: true
            },
            {
                name: 'Document',
                is_focus: false
            },
            {
                name: 'Tools',
                is_focus: false
            }
        ];
    //
    this.init = function() {
        //
        Model.set('navigation', navigation).watch('navigation', this.renderNavigation);
        Model.set('mainContainer', 'Client').watch('mainContainer', this.renderMainContainer);
        //
        this.renderNavigation(navigation);
    };

    this.renderNavigation = function(data) {
        self.view.display('navigation', 'layout', data, '.nav');
    };

    this.renderMainContainer = function(data) {
        //
        let navigation = Model.get('navigation');
        navigation.forEach(element => {
            if (element.name === data) {
                element.is_focus = true;
            } else {
                element.is_focus = false;
            }
        });
        Model.set('navigation', navigation);
        //
        $('.main-container').each(function() {
            let dataContainer = $(this).attr('data-container');
            if (dataContainer === data) {
                $(this).removeClass('hide');
            } else {
                $(this).addClass('hide');
            }
        });
    };
});
