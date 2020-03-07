/**
 * 通用事件监听
 * Created by Yuiitsu on 2018/05/22.
 */
App.event.extend('common', function() {
    //
    let self = this;
    /**
     * 事件
      * @type {{content_tab_change: event.content_tab_change, response_type_change: event.response_type_change}}
     */
    this.event = {
        /**
         * 切换Theme
         */
        changeTheme: function() {
            $('.theme-selector').on('click', 'span', function() {
                let themeType = $(this).attr('data-type');
                if (!themeType) {
                    self.module.common.notification('Theme Type Error.', 'danger');
                    return false;
                }
                //
                $('.theme-selector span').removeClass('border-level-5');
                $(this).addClass('border-level-5');
                //
                Model.set('defaultTheme', themeType);
                localStorage.setItem('defaultTheme', themeType);
            });
        }
    };
});
