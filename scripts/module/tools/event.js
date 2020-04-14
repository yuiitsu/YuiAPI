/**
 * Created by Yuiitsu on 2020/04/01.
 */
App.event.extend('tools', function() {
    //
    let self = this;
    /**
     * 执行事件监听
     */
    this.event = {
        toolsSwitch: function() {
            $('.tools-nav').on('click', 'li', function() {
                let key = $(this).attr('data-key');
                self.module.tools.switch(key);
            });
        }
    }
});
 