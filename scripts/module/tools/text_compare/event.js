/**
 * Created by Yuiitsu on 2020/03/27.
 */
App.event.extend('tools.textCompare', function() {
    //
    let self = this;
    /**
     * 执行事件监听
     */
    this.event = {
        autoDisplayPretty: function() {
            let parent = $('.js-main-container-tools');
            parent.on('paste', '.tools-compare-box', function() {
                let type = $(this).attr('data-type'), 
                    paste = (event.clipboardData || window.clipboardData).getData('text');
                    data = Model.get('tools.textCompare'), _this = $(this);
                //
                data[type] = paste;
                setTimeout(function() {
                    _this.html('<div class="t">'+ paste +'</div>');
                });
                Model.set('tools.textCompare', data);
            });
        }
    }
});
 