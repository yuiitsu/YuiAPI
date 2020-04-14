/**
 * Created by Yuiitsu on 2020/03/28.
 */
App.event.extend('navigation', function() {
    //
    let self = this;
    /**
     * 执行事件监听
     */
    this.event = {
        changeMainContainer: function() {
            $('.nav').on('click', 'a', function() {
                let module = $(this).text();
                Model.set('mainContainer', module);
            });
        },
    }
});
 