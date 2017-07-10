/**
 * UnRestClient
 * @Author: onlyfu
 * @Date: 2017-07-07
 * @type {{requestType: string, init: App.init, syntaxHighlight: App.syntaxHighlight, listenEvent: App.listenEvent, listenRequestType: App.listenRequestType, listenUrlSelect: App.listenUrlSelect}}
 */
var App = {
    requestType: 'GET',
    init: function() {
        this.listenEvent();
    },
    syntaxHighlight: function(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'code-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'code-key';
                } else {
                    cls = 'code-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'code-boolean';
            } else if (/null/.test(match)) {
                cls = 'code-null';
            }
            return '<span class="'+ cls +'">' + match + '</span>';
        });
    },
    listenEvent: function() {
        var self = this;
        $('#send').click(function() {
            var $this = $(this);
            var url = $.trim($('#url').val());
            var type = $('#request-type').val();
            if (url) {
                $this.attr('disabled', true).html('<i class="mdi mdi-refresh mdi-spin"></i> 发送中...');
                request(url, {'type': self.requestType}, {}, function(res) {
                    $('#result').html(self.syntaxHighlight(JSON.stringify(res, undefined, 4)));
                    $this.attr('disabled', false).html('发送');
                });
            }
        });

        // 监听请求类型选择
        this.listenRequestType();
        // 监听url选中
        this.listenUrlSelect();
    },
    listenRequestType: function() {
        var $this = this;
        $('.request-type-in').click(function() {
            console.log('box');
            $('.request-type-list').show();
        });
        $('.request-type-list > a').click(function(e) {
            var key = $(this).attr('data-key');
            $this.requestType = key;
            $('.request-type').text(key);
            $('.request-type-list').hide();
            e.preventDefault();
        });
    },
    listenUrlSelect: function() {
        $('#url').focus(function() {
            $(this).select();
        })
    }
};

$(function() {
    App.init();
});
