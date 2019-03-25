/**
 * Response Event
 */
App.event.extend('response', function() {
    //
    let self = this;
    /**
     * 事件
     */
    this.event = {
        codeSwitch: function() {
            $('.response-container').on('click', '.code-switch', function(e) {
                let parent = $(this).parent(),
                    target = parent,
                    display = '';

                if (parent.hasClass('row-root')) {
                    target = $('.row-child');
                    if (parent.hasClass('row-root-close')) {
                        display = 'block';
                        parent.removeClass('row-root-close');
                    } else {
                        display = 'none';
                        parent.addClass('row-root-close');
                    }
                } else {
                    if (parent.hasClass('row-close')) {
                        display = 'block';
                        parent.removeClass('row-close').next().show();
                        target = parent.next();
                    } else {
                        display = 'none';
                        parent.addClass('row-close').next().hide();
                        target = parent.next().find('.row-child');
                    }
                }

                target.each(function() {
                    let o = $(this).next();
                    if (!display) {
                        if (o.css('display') === 'block') {
                            $(this).addClass('row-close');
                            parent.addClass('row-close');
                            o.hide();
                        } else {
                            $(this).removeClass('row-close');
                            parent.removeClass('row-close');
                            o.show();
                        }
                    } else {
                        if (display === 'block') {
                            $(this).removeClass('row-close');
                            parent.removeClass('row-close');
                            o.show();
                        } else {
                            $(this).addClass('row-close');
                            parent.addClass('row-close');
                            o.hide();
                        }
                    }
                });
                e.stopPropagation();
            })
        },
        bodyAndHeaders: function() {
            $('.response-container')
                .on('click', '.response-header-tab span', function(e) {
                let text = $(this).text();
                Model.set('showResponseDataType', text);
            });
        }
    }
});
