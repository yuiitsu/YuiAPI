/**
 * cURL import events.
 */
App.event.extend('tools.curl', function() {
    let self = this;

    let importCommand = function(target) {
        let moduleId = target.attr('data-module-id'),
            errorTarget = target.siblings('.curl-import-error');
        try {
            let request = self.module['tools.curl'].parse($('#curl-command').val());
            self.module['tools.curl'].apply(request);
            $('.module-box-' + moduleId).remove();
            if (request.warnings.length > 0) {
                self.module.common.notification(request.warnings.join(' '), 'warring');
            } else {
                self.module.common.notification('cURL imported.');
            }
        } catch (error) {
            errorTarget.text(error.message);
        }
    };

    this.event = {
        import: function() {
            $('body').on('click', '#curl-import', function(e) {
                importCommand($(this));
                e.stopPropagation();
            }).on('keydown', '#curl-command', function(e) {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    importCommand($('#curl-import'));
                    e.preventDefault();
                }
            }).on('click', '#curl-export-copy', function(e) {
                let target = $('#curl-export-command');
                target.select();
                document.execCommand('copy');
                self.module.common.notification('cURL copied.');
                e.stopPropagation();
            });
        }
    };
});
