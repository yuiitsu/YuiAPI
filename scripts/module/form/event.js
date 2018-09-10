/**
 * 请求表单的事件监听
 * Created by Yuiitsu on 2018/05/21.
 */
Event.extend('form', function() {
    let self = this;
    /**
     * 执行事件监听
     */
    this.event = {
        /**
         * 监听表单值类型的选择
         * 如果是text，显示input，如果是file，显示文件选择按钮
         */
        form_value_type_change: function() {
            $('#form-data-true').on('change', '.form-value-data-type', function() {
                let value = $(this).val();
                switch (value) {
                    case "Text":
                        $(this).parent().find('input').attr('type', 'text');
                        break;
                    case "File":
                        $(this).parent().find('input').attr('type', 'file').attr('name', 'file');
                        break;
                    default:
                        alert('type error.');
                        break;
                }
            });
        },

        /**
         * 发送请求
         */
        send: function() {
            // 提交
            $('#form-box').on('click', '#send', function(e) {
                let $this = $(this),
                    url_obj = $('#url'),
                    url = $.trim(url_obj.val()),
                    apiName = $.trim($('#api-name').val()),
                    group_id = $('.history-group-selector').val(),
                    form_data_type = $('input[name=form-data-type]:checked').val();
                if (url) {
                    if (url.substr(0, 7) !== 'http://' && url.substr(0, 8) !== 'https://') {
                        url = 'http://' + url;
                        url_obj.val(url);
                    }
                    $('.tabs li').eq(1).trigger('click');
                    // 获取参数
                    let formData = '',
                        header_data = App.common.getFormParams().header(),
                        request_params = {
                            type: App.requestType,
                            headers: header_data['data']
                        };
                    switch (form_data_type) {
                        case "form-data-true":
                            formData = App.common.getFormParams().form_data('form-data');
                            request_params['processData'] = false;
                            request_params['contentType'] = false;
                            break;
                        case "form-data":
                            formData = App.common.getFormParams().form();
                            request_params['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
                            break;
                        case "raw":
                            formData = {};
                            formData['data'] = $.trim($('#form-data-raw').find('textarea').val());
                            let content_type = $('#raw-content-type').val();
                            formData['history_data'] = {
                                'content_type': content_type,
                                'data': formData['data']
                            };
                            request_params.headers['Content-Type'] = content_type;
                            break;
                    }

                    $this.attr('disabled', true).html('<i class="mdi mdi-refresh mdi-spin"></i> Sending...');
                    let result_obj = $('#result');
                    result_obj.css('background-color', '#efefef');
                    let start_timestamp=new Date().getTime();

                    App.common.request(url, request_params, formData['data'], function(res, jqXHR) {
                        //
                        $this.attr('disabled', false).html('Send');
                        //
                        let headers = jqXHR.getAllResponseHeaders();
                        let response_content_type = jqXHR.getResponseHeader('content-type');
                        // 时间
                        let end_timestamp = new Date().getTime();
                        let use_time = end_timestamp - start_timestamp;

                        let response_data = {
                            'headers': jqXHR.getAllResponseHeaders(),
                            'response': res,
                            'response_content_type': response_content_type ? response_content_type : '',
                            'use_time': use_time,
                            'status': jqXHR.status
                        };
                        Model.set('response_data', response_data);

                        // assert
                        let assert_type = $('input[name=form-data-assert-type]:checked').val();
                        let assert_content = $.trim($('#form-data-assert').val());
                        let assertion_data = '';
                        if (assert_type) {
                            assertion_data = {
                                type: assert_type,
                                content: assert_content ? assert_content : ''
                            };
                        }
                        App.form.selected_group_id = group_id;
                        // 写入History
                        App.history.add({
                            url: url,
                            type: App.requestType,
                            name: apiName,
                            headers: headers,
                            data: formData['history_data'],
                            data_type: form_data_type,
                            request_headers: header_data['history_data'],
                            response_content_type: response_content_type,
                            result: res,
                            time: use_time,
                            status: jqXHR.status,
                            assertion_data: assertion_data,
                            group_id: group_id
                        });
                    });
                }
                e.stopPropagation();
            });
        },

        /**
         * 选择host
         */
        host_select: function() {
            $('#host-select').on('click', function() {
                let host_list = App.history.get_host_list(),
                    content = ['<ul class="history-tips-list" id="host-select-item" style="height:300px;overflow-y:auto;">'];
                if (host_list.length > 0) {
                    for (let i in host_list) {
                        content.push('<li style="text-align:left;">'+ host_list[i] +'</li>');
                    }
                }
                content.push('</ul>');
                App.common.tips.show($(this), content.join(''));
            });

            $('body').on('click', '#host-select-item li', function(e) {
                let value = $(this).text(),
                    urlObject = $('#url'),
                    url = $.trim(urlObject.val()),
                    host = App.common.getHost(url);

                urlObject.val(url.replace(host, value));
                e.stopPropagation();
            })
        },

        /**
         * 请求类型选择
         */
        request_type_select: function() {
            $('#request-type').on('change', function() {
                let key = $(this).val();
                if (key) {
                    App.requestType = key;
                }
            });
        },

        /**
         * 选择参数TAB
         */
        change_params_type: function() {
            $('#form-box').on('click', '.form-params-type li', function() {
                $('.form-params-type li').removeClass('focus');
                $(this).addClass('focus');
                let index = $(this).index();
                $('.form-data').find('table').addClass('hide').eq(index).removeClass('hide');
                //$('.form-data').find('table').eq(index).removeClass('hide');
            });
        },

        /**
         * 格式化参数
         */
        format_request_params: function() {
            $('#form-data-format').on('click', function() {
                let content = $.trim($('#form-data-format-content').val());
                if (!content) {
                    return false;
                }

                let data = {};
                if (content.indexOf('\n') !== -1) {
                    let group_list = content.split('\n');
                    for (let i in group_list) {
                        let items = group_list[i].split(':');
                        let key = $.trim(items.shift());
                        let val = items.join("");
                        data[key] = $.trim(val);
                    }
                } else {
                    let group_list = content.split('&');
                    for (let i in group_list) {
                        let items = group_list[i].split('=');
                        data[items[0]] = items[1];
                    }
                }

                View.display('form', 'urlencoded_line', data, '#form-data');
                $('.form-params-type li').eq(1).trigger('click');
            });
        },

        /**
         * headers switch
         */
        form_header_switch: function() {
            $('#form-box').on('click', '#js-form-headers-title', function(e) {
                let target = $('#js-form-headers-body');
                if (target.css('display') !== 'table') {
                    target.show();
                    $(this).find('i').addClass('rotate-right');
                } else {
                    target.hide();
                    $(this).find('i').removeClass('rotate-right');
                }
                e.stopPropagation();
            })
        },

        /**
         * headers自动增加行
         */
        form_header_input: function() {
            $('#form-data-headers').on('input', '.form-data-item', function() {
                let data_type = $(this).attr('data-type');
                let target_obj = $('#' + data_type);
                let parent = $(this).parent().parent();
                if (parent.index() + 1 === target_obj.find('tr').length) {
                    // 创建新的一行
                    let _htmlItem = View.get_view('form', 'form_header_line', {});
                    target_obj.append(_htmlItem);
                    $(this).parent().parent().find('.form-line-del-box').html('<i class="mdi mdi-close"></i>');
                }
            })
        },

        /**
         * 表单输入自动增加行，body部分
         */
        form_data_body_input: function() {
            $('#form-box').on('input', '.form-data-item', function() {
                let data_type = $(this).attr('data-type');
                let target_obj = $('#' + data_type);
                let parent = $(this).parent().parent();
                if (parent.index() + 1 === target_obj.find('tr').length) {
                    // 创建新的一行
                    let _htmlItem = '';

                    // 根据类型不同，替换目标对象
                    switch (data_type)  {
                        case "form-data-true":
                            _htmlItem = View.get_view('form', 'form_data_line', {});
                            break;
                        case "form-data":
                            _htmlItem = View.get_view('form', 'urlencoded_line', {});
                            break;
                        default:
                            break;
                    }

                    target_obj.append(_htmlItem);
                    $(this).parent().parent().find('.form-line-del-box').html('<i class="mdi mdi-close"></i>');
                }
            });
        },

        /**
         * form data type
         */
        form_data_type_change: function() {
            $('#form-box').on('click', 'input[name=form-data-type]', function(e) {
                let data_type = $(this).val();
                if (data_type === 'form-data' || data_type === 'form-data-true') {
                    $('.form-data-title').show();
                } else {
                    $('.form-data-title').hide();
                }

                if (data_type === 'raw') {
                    $('#raw-content-type').show();
                } else {
                    $('#raw-content-type').hide();
                }

                $('.form-data-type').each(function() {
                    if (!$(this).hasClass('hide')) {
                        $(this).addClass('hide');
                    }

                    if (data_type === $(this).attr('data-type')) {
                        $(this).removeClass('hide');
                    }
                });

                //$('.form-data-type').hide().each(function() {
                //    if (data_type === $(this).attr('data-type')) {
                //        $(this).show();
                //    }
                //})
                e.stopPropagation();
            });
        },

        /**
         * 删除表单行
         */
        del_form_line: function() {
            $('.form-data').on('click', '.form-line-del-box i', function(e) {
                $(this).parent().parent().remove();
                e.stopPropagation();
            })
        },

        select_all: function() {
            $('.form-select-all').on('click', function() {
                let _this = $(this);
                let target = $(this).parent().parent().parent().parent().find('tbody').each(function() {
                    if (_this.prop("checked")) {
                        $(this).find('.form-select').prop('checked', 'checked');
                    } else {
                        $(this).find('.form-select').prop('checked', false);
                    }
                });
            })
        },

        edit_parameter: function() {
            $('#js-form-edit-parameter').on('click', function() {
                App.common.module('Edit Parameter', View.get_view('form', 'edit_parameter', ''), '');
            });
        },

        /**
         * 表单参数/值改变，重新获取表单数据并set model
         */
        parameter_change: function() {
            $('#form-data-headers').on('change', '.form-data-item', function() {

            });
        }
    };
});
