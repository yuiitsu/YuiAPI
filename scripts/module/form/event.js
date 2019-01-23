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
            $('#form-box').on('change', '#form-data .form-value-data-type', function() {
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
                //App.form.change_form();
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
                        },
                        is_form_data = true;

                    switch (form_data_type) {
                        case "form-data-true":
                            formData = App.common.getFormParams().form_data();
                            request_params['processData'] = false;
                            request_params['contentType'] = false;
                            break;
                        case "form-data":
                            formData = App.common.getFormParams().form();
                            //if (!request_params['headers'].hasOwnProperty('content-type')) {
                                request_params['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
                            //}
                            is_form_data = false;
                            break;
                        case "raw":
                            formData = {};
                            formData['data'] = $.trim($('#form-data').find('textarea').val());
                            let content_type = $('#raw-content-type').val();
                            formData['history_data'] = {
                                'content_type': content_type,
                                'data': formData['data']
                            };
                            if (!request_params['headers'].hasOwnProperty('content-type')) {
                                request_params.headers['Content-Type'] = content_type;
                            }
                            break;
                    }
                    //request_params['headers'] = header_data['data'];
                    //Object.assign(request_params['headers'], header_data['data']);

                    // authentication
                    let authentication = App.form.build_authentication_to_request(request_params);

                    $this.attr('disabled', true).html('<i class="mdi mdi-refresh mdi-spin"></i> Sending...');
                    let result_obj = $('#result');
                    result_obj.css('background-color', '#efefef');
                    let start_timestamp=new Date().getTime();

                    //App.form.send(url, request_params, formData['data'], function() {
                    //    $this.attr('disabled', false).html('Send');
                    //});

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
                            group_id: group_id,
                            authentication: authentication
                        });

                        App.history.set_history_tab({
                            name: apiName,
                            url: url
                        });
                    }, is_form_data);
                }
                e.stopPropagation();
            });
        },

        /**
         * 选择host
         */
        host_select: function() {
            $('#form-box').on('click', '#host-select', function() {
                let host_list = App.history.get_host_list();
                App.common.tips.show($(this), View.get_view('history', 'select_host_list', host_list));
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
            $('#form-box').on('change', '#request-type', function() {
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
            $('body').on('click', '#form-data-format', function(e) {
                let content = $.trim($('#form-data-format-content').val()),
                    module_id = $(this).attr('data-module-id');
                if (content) {
                    let data = {};
                    if (content.indexOf('\n') !== -1) {
                        let group_list = content.split('\n');
                        for (let i in group_list) {
                            let items = group_list[i].split(':');
                            let key = $.trim(items.shift());
                            let val = items.join(":");
                            data[key] = {value: $.trim(val), description: '', value_type: 'Text'};
                        }
                    } else {
                        if (content.indexOf('&') !== -1) {
                            let group_list = content.split('&');
                            for (let i in group_list) {
                                let items = group_list[i].split('=');
                                if (items[1] !== undefined) {
                                    data[items[0]] = {value: items[1], description: '', value_type: 'Text'};
                                }
                            }
                        } else {
                            let items = content.split(':');
                            let key = $.trim(items.shift());
                            let val = items.join(":");
                            if (val !== undefined) {
                                data[key] = {value: $.trim(val), description: '', value_type: 'Text'};
                            }
                        }
                    }

                    let request_form_type_tmp = Model.get('request_form_type_tmp');
                    Model.set('request_data_' + request_form_type_tmp, data);
                    App.form.change_form();
                    //View.display('form', 'urlencoded_line', data, '#form-data');
                    $('.module-box-' + module_id).remove();
                }
                e.stopPropagation();
            });
        },

        /**
         * headers自动增加行
         */
        form_header_input: function() {
            $('#form-box').on('input', '#form-data-headers .form-data-item', function(e) {
                let data_type = $(this).attr('data-type');
                let target_obj = $('#' + data_type);
                let parent = $(this).parent().parent();
                if (parent.index() + 1 === target_obj.find('tr').length) {
                    // 创建新的一行
                    let _htmlItem = View.get_view('form', 'form_header_line', {});
                    target_obj.append(_htmlItem);
                    $(this).parent().parent().find('.form-line-del-box').html('<i class="mdi mdi-close"></i>');
                }
                e.stopPropagation();
            }).on('change', '#form-data-headers .form-data-item', function(e) {
                // save to model
                App.form.get_headers_params();
                e.stopPropagation();
            })
        },

        /**
         * 表单输入自动增加行，body部分
         */
        form_data_body_input: function() {
            $('#form-box').on('input', '#form-data .form-data-item', function(e) {
                let data_type = $(this).attr('data-type');
                let target_obj = $('#form-data');
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
                e.stopPropagation();
            }).on('change', '#form-data .form-data-item', function(e) {
                // 保存到model
                App.form.get_params();
                e.stopPropagation();
            });
        },

        /**
         * form data type
         */
        form_data_type_change: function() {
            $('#form-box').on('click', 'input[name=form-data-type]', function(e) {
                let data_type = $(this).val();
                Model.set('request_form_type_tmp', data_type);
                e.stopPropagation();
            });
        },

        /**
         * 删除表单行
         */
        del_form_line: function() {
            $('#form-box').on('click', '.form-line-del-box i', function(e) {
                $(this).parent().parent().remove();
                App.form.get_headers_params();
                App.form.get_params();
                // 检查是否删除url params，如果是，重新获取form data并设置url query string
                if ($(this).attr('data-type') === 'url-params-line') {
                    App.form.build_url_query_string();
                }
                e.stopPropagation();
            })
        },

        /**
         * 全选参数
         */
        select_all: function() {
            $('#form-box').on('click', '.form-select-all', function(e) {
                let _this = $(this);
                $(this).parent().parent().parent().parent().find('tbody').each(function() {
                    if (_this.prop("checked")) {
                        $(this).find('.form-select').prop('checked', 'checked');
                    } else {
                        $(this).find('.form-select').prop('checked', false);
                    }
                });

                App.form.get_params();
                e.stopPropagation();
            })
        },

        /**
         * 打开编辑参数界面
         */
        edit_parameter: function() {
            $('#form-box').on('click', '#js-form-edit-parameter', function(e) {
                let request_form_type = Model.get('request_form_type');
                let request_data = Model.get('request_data_' + request_form_type);
                App.common.module('Edit Parameter', View.get_view('form', 'edit_parameter', request_data), '');
                e.stopPropagation();
            });
        },

        /**
         * Header
         */
        header_line_change: function() {
            $('#form-box').on('click', '.js-form-headers-title span', function(e) {
                let type = $(this).text();
                let request_data = Model.get('request_data'),
                    authentication = Model.get('authentication'),
                    request_headers = Model.get('request_headers'),
                    url_params = Model.get('url_params');

                //if (type === 'Params' && Object.keys(url_params).length <= 0) {
                //    return false;
                //}
                request_data['headers_line_type'] = type;
                request_data['authentication'] = authentication;
                request_data['request_headers'] = request_headers;
                request_data['url_params'] = url_params;
                View.display('form', 'headers_layout', request_data, '#js-form-headers-box');
                e.stopPropagation();
            });
        },

        authentication_selector: function() {
            $('#form-box').on('change', '#js-form-authentication-type-selector', function(e) {
                let type = $(this).val();
                $('#js-form-authentication').find('tbody').each(function() {
                    let data_type = $(this).attr('data-type');
                    if (data_type === type) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });

                // 置空，重置model, authentication数据
                if (type === 'None') {
                    Model.set('authentication', {type: '', data: {}});
                }

                e.stopPropagation();
                //// 设置model
                //Model.set('authentication', {
                //    type: type
                //});
            });
        },

        authentication_basic: function() {
            $('#form-box').on('change', '#js-form-authentication-basic input', function(e) {
                // 获取值
                let authentication = {
                    type: 'Basic',
                    data: {}
                };
                $('#js-form-authentication-basic').find('input').each(function() {
                    let data_type = $(this).attr('data-type');
                    authentication['data'][data_type] = $.trim($(this).val());
                });
                // set data to model
                Model.set('authentication', authentication);

                e.stopPropagation();
            })
        },

        url_change: function() {
            $('#form-box').on('change', '#url', function(e) {
                let url = $.trim($(this).val());
                let params = App.common.get_url_params(url);
                Model.set('url_params', {display: true, list: params});
            });
        },

        url_params_change: function() {
            $('#form-box').on('input', '#js-url-params .form-data-item', function(e) {
                let data_type = $(this).attr('data-type');
                let target_obj = $('#' + data_type);
                let parent = $(this).parent().parent();
                if (parent.index() + 1 === target_obj.find('tr').length) {
                    // 创建新的一行
                    let _htmlItem = View.get_view('form', 'headers_params_line', {});
                    target_obj.append(_htmlItem);
                    $(this).parent().parent().find('.form-line-del-box').html('<i class="mdi mdi-close" data-type="url-params-line"></i>');
                }
                e.stopPropagation();
            }).on('change', '#js-url-params .form-data-item', function(e) {
                App.form.build_url_query_string();
                //let url_params = App.form.get_url_params();
                //if (Object.keys(url_params).length > 0) {
                //    let query_string_list = [];
                //    for (var i in url_params) {
                //        if (url_params.hasOwnProperty(i)) {
                //            query_string_list.push(url_params[i]['key'] + '=' + encodeURIComponent(url_params[i]['val']));
                //        }
                //    }
                //    let query_string = query_string_list.join("&");
                //    let target = $('#url');
                //    let url = $.trim(target.val());
                //    url = url.split('?')[0] + '?' + query_string;
                //    target.val(url);
                //}
                //Model.set('url_params', {display: false, list: url_params});
            });
        }
    };
});
