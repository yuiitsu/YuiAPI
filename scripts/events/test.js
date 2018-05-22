/**
 * 测试的事件监听
 * Created by Yuiitsu on 2018/05/22.
 */
let event_test = {
    /**
     * 执行事件监听
     */
    run: function() {
        // 开始测试
        this.start();
        // 清除测试数据
        this.clear();
    },

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

$(function() {
    event_test.run();
});
