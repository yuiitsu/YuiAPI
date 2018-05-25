/**
 * 测试的事件监听
 * Created by Yuiitsu on 2018/05/22.
 */
Event.extend('test', function() {
    /**
     * 事件
      * @type {{start: event.start, clear: event.clear}}
     */
    this.event = {
        /**
         * 开始测试
         */
        start: function() {
            $('#test-start').on('click', function() {
                let $this = $(this);
                $this.attr('disabled', true).html('<i class="mdi mdi-refresh mdi-spin"></i> Testing...');
                Test.startTest(function() {
                    $this.attr('disabled', false).html('Start');
                });
            });
        },

        /**
         * 清除测试数据
         */
        clear: function() {
            $('.test-clear').on('click', function() {
                if (confirm('Confirm to clear the data')) {
                    Test.clear($(this).attr('data-type'));
                }
            });
        }
    };
});
