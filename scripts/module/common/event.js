/**
 * 通用事件监听
 * Created by Yuiitsu on 2018/05/22.
 */
Event.extend('common', function() {
    /**
     * 事件
      * @type {{content_tab_change: event.content_tab_change, response_type_change: event.response_type_change}}
     */
    this.event = {
        /**
         * 内容tab切换
         */
        content_tab_change: function() {
            $('.tabs li').on('click', function() {
                let id = $(this).attr('data-id');
                $('.tabs li').removeClass('focus');
                $(this).addClass('focus');
                $('.left-content').addClass('hide');
                $('#' + id).removeClass('hide');
            });
        },

        /**
         * 响应类型数据切换
         */
        response_type_change: function() {
            $('#output-content').on('click', '.response-type li', function(e) {
                let id = $(this).attr('data-id');
                let result_format = $('#result-format');
                $('.response-type li').removeClass('focus');
                $(this).addClass('focus');
                $('.result-box-pre').addClass('hide');

                switch (id) {
                    case "result":
                        $('.response-body').each(function() {
                            if ($(this).html()) {
                                $(this).removeClass('hide');
                            }
                        });
                        result_format.show();
                        break;
                    case "response-headers":
                        $('#' + id).removeClass('hide');
                        result_format.hide();
                        break;
                }

                e.stopPropagation();
            });
        },

        /**
         * 响应结果格式化转换
         */
        response_format_change: function() {
            $('#output-content').on('click', '#result-format span', function(e) {
                let name = $(this).text();
                if (!name) {
                    return false;
                }

                //
                let copy_target = $('#result-copy');
                let r = false;
                if (name === 'raw') {
                    // 去除格式化
                    r = App.form.raw();
                    if (r) {
                        copy_target.removeClass('hide');
                    }
                } else {
                    r = App.form.format();
                    if (!copy_target.hasClass('hide')) {
                        copy_target.addClass('hide');
                    }
                }

                if (r) {
                    $('#result-format').find('span').each(function () {
                        if ($(this).hasClass('focus')) {
                            $(this).removeClass('focus');
                        }

                        if (name === $(this).text()) {
                            $(this).addClass('focus');
                        }
                    });
                }

                e.stopPropagation();
            });
        },

        /**
         * 拷贝结果
         */
        copy_response: function() {
            $('#output-content').on('click', '#result-copy button', function(e) {
                $('#result-copy-input').val($('#result').text());
                if (document.execCommand('copy')) {
                    let inputText = document.getElementById('result-copy-input');
                    inputText.focus();
                    inputText.setSelectionRange(0, inputText.value.length);
                    document.execCommand('copy', true);
                    console.log('复制成功');
                    App.common.tips.show($(this), '<span class="color-success">Copied</span>', {
                        position: 'right'
                    });
                }
                e.stopPropagation();
            });
        }
    };
});
