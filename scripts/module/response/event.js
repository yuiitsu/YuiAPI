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
                e.stopPropagation();
            });
        },
        openFormat: function() {
            $('.response-container').on('click', '#response-body-format', function(e) {
                self.module.response.showFormat();
                e.stopPropagation();
            });
        },
        changeResponseFormatType: function() {
            $('body').on('click', '.response-format-type span', function(e) {
                let type = $(this).text(),
                    target = $('#response-body'),
                    // responseBody = target.val(),
                    responseData = Model.get('responseData'),
                    responseBody = responseData.response;

                switch (type) {
                    case 'Raw':
                        if (Object.prototype.toString.call(responseBody) === '[object Object]') {
                            try {
                                responseBody = JSON.stringify(responseBody);
                            } catch (e) {
                            }
                        }
                        break;
                    case 'Format':
                        if (Object.prototype.toString.call(responseBody) === '[object Object]') {
                            try {
                                responseBody = JSON.stringify(responseBody, null, 4);
                            } catch (e) {
                            }
                        }
                        break;
                }

                target.val(responseBody);
                //
                $('.response-format-type span').removeClass('bg-level-0');
                $(this).addClass('bg-level-0');
            });
        },
        copyResponseBody: function() {
            $('body').on('click', '.response-body-copy', function(e) {
                let target = $('#response-body');
                target.select();
                document.execCommand('copy');
                //
                self.module.common.tips.show($(this), 'Copy success.', {position: 'left'});
                e.stopPropagation();
            });
        },
        openJsonEditor: function() {
            $('body').on('click', '#json-opener', function(e) {
                self.module.response.showJsonEditor();
                e.stopPropagation();
            });
        },
        jsonEditorOk: function() {
            $('body').on('click', '.response-json-editor', function(e) {
                let target = $('#response-body'),
                    jsonData = $.trim(target.val()),
                    module_id = $(this).attr('data-module-id');
                //
                try {
                    JSON.parse(jsonData);
                } catch (e) {
                    self.module.common.notification('JSON format error.', 'danger');
                    return false;
                }
                //
                Model.set('jsonData', jsonData);
                //
                $('.module-box-' + module_id).remove();
                e.stopPropagation();
            });
        },
        changeJsonFormatType: function() {
            $('body').on('click', '.json-format-type span', function(e) {
                let type = $(this).text(),
                    target = $('#response-body'),
                    responseBody = target.val();

                switch (type) {
                    case 'Raw':
                        try {
                            responseBody = responseBody.replace(/\n|\r|\s/g, '');
                        } catch (e) {
                        }
                        break;
                    case 'Format':
                        try {
                            responseBody = JSON.stringify(JSON.parse(responseBody), null, 4);
                        } catch (e) {
                        }
                        break;
                }

                target.val(responseBody);
                //
                $('.json-format-type span').removeClass('bg-level-0');
                $(this).addClass('bg-level-0');
            });
        }
    }
});
