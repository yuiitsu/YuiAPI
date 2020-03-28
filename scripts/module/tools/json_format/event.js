/**
 * Created by Yuiitsu on 2020/03/27.
 */
App.event.extend('tools.jsonFormat', function() {
    //
    let self = this;
    /**
     * 执行事件监听
     */
    this.event = {
        autoDisplayPretty: function() {
            $('.tools-json-format-textarea').on('input', function() {
                Model.set('toolsJSONString', $(this).val());
            });
        },
        changeJsonFormatType: function() {
            $('body').on('click', '.json-format-type span', function(e) {
                let type = $(this).text(),
                    target = $('.tools-json-format-textarea'),
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
 