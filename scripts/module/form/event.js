/**
 * 请求表单的事件监听
 * Created by Yuiitsu on 2018/05/21.
 */
App.event.extend('form', function() {
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
            $('.form-container').on('change', '.form-value-data-type', function() {
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
            $('.form-container').on('click', '#send', function(e) {
                let $this = $(this),
                    urlObj = $('#request-url'),
                    url = $.trim(urlObj.val()),
                    apiName = $.trim($('#api-name').val()),
                    // group_id = $('.history-group-selector').val(),
                    requestType = $('#request-type').val(),
                    formDataType = Model.get('requestFormType');
                if (url) {
                    if (url.substr(0, 7) !== 'http://' && url.substr(0, 8) !== 'https://') {
                        url = 'http://' + url;
                        urlObj.val(url);
                    }
                    // 获取参数
                    let formData = '',
                        header_data = Model.get('requestHeaders'),
                        request_params = {
                            type: requestType,
                            headers: {}
                        },
                        is_form_data = true;

                    //
                    if (header_data && Object.keys(header_data).length > 0) {
                        for (let i in header_data) {
                            if (header_data.hasOwnProperty(i)) {
                                request_params['headers'][i] = header_data[i]['value'];
                            }
                        }
                    }

                    switch (formDataType) {
                        case "form-data-true":
                            formData = self.module.common.getFormParams().form_data();
                            request_params['processData'] = false;
                            request_params['contentType'] = false;
                            break;
                        case "form-data":
                            formData = self.module.common.getFormParams().form();
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

                    // authentication
                    let authentication = self.module.form.build_authentication_to_request(request_params);

                    // $this.attr('disabled', true).html('<i class="mdi mdi-refresh mdi-spin"></i> Sending...');
                    Model.set('sending', 1);
                    let result_obj = $('#result');
                    result_obj.parent().addClass('sending');
                    let start_timestamp=new Date().getTime();

                    let xhr = self.module.common.request(url, request_params, formData['data'], function(res, jqXHR) {
                        //
                        // $this.attr('disabled', false).html('Send');
                        //
                        let headers = jqXHR.getAllResponseHeaders();
                        let response_content_type = jqXHR.getResponseHeader('content-type');
                        // 时间
                        let end_timestamp = new Date().getTime();
                        let use_time = end_timestamp - start_timestamp;

                        let response_data = {
                            'headers': jqXHR.getAllResponseHeaders(),
                            'response': res,
                            'responseContentType': response_content_type ? response_content_type : '',
                            'use_time': use_time,
                            'status': jqXHR.status
                        };
                        Model.set('responseData', response_data);

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
                        // 写入History
                        self.module.history.add({
                            url: url,
                            type: requestType,
                            name: apiName,
                            headers: headers,
                            data: formData['history_data'],
                            data_type: formDataType,
                            request_headers: header_data,
                            response_content_type: response_content_type,
                            result: res,
                            time: use_time,
                            status: jqXHR.status,
                            assertion_data: assertion_data,
                            authentication: authentication
                        });
                        //
                        Model.set('sending', 0);
                    }, is_form_data);
                    //
                    self.module.common.requestXHR.add(self.module.form.requestXHRKey, xhr);
                }
                e.stopPropagation();
            });
        },

        cancelSending: function() {
            $('.form-container').on('click', '.form-send-extra-container-sending', function(e) {
                Model.set('sending', 0);
            });
        },

        /**
         * 选择host
         */
        host_select: function() {
            $('.form-container').on('click', '.form-host-selector', function() {
                let host_list = self.module.history.getHostList();
                self.module.common.tips.show($(this), self.view.getView('history', 'select_host_list', host_list), {
                    width: '279px',
                    height: '200px'
                });
            });

            $('body').on('click', '#host-select-item li', function(e) {
                let value = $(this).text(),
                    urlObject = $('#request-url'),
                    url = $.trim(urlObject.val()),
                    host = self.module.common.getHost(url);

                urlObject.val(url.replace(host, value));
                e.stopPropagation();
            })
        },

        /**
         * Header
         */
        header_line_change: function() {
            $('.form-container').on('click', '.form-request-headers-tab', function(e) {
                let type = $(this).text();
                let request_data = Model.get('requestData'),
                    authentication = Model.get('authentication'),
                    request_headers = Model.get('requestHeaders'),
                    url_params = Model.get('urlParams');

                //if (type === 'Params' && Object.keys(url_params).length <= 0) {
                //    return false;
                //}
                request_data['headersLineType'] = type;
                request_data['authentication'] = authentication;
                request_data['requestHeaders'] = request_headers;
                request_data['urlParams'] = url_params ? url_params : {list: []};
                self.view.display('form', 'headers_layout', request_data, '#form-request-headers-container');
                e.stopPropagation();
            });
        },

        authentication_selector: function() {
            $('.form-container').on('change', '#js-form-authentication-type-selector', function(e) {
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
            $('.form-container').on('change', '#js-form-authentication-basic input', function(e) {
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

                    let requestFormTypeTmp = Model.get('requestFormTypeTmp');
                    Model.set('requestData_' + requestFormTypeTmp, data);
                    self.module.form.change_form();
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
            $('.form-container').on('input', '#form-request-headers-container .form-data-item', function(e) {
                let data_type = $(this).attr('data-type');
                let target_obj = $('.form-request-headers-line #' + data_type);
                let parent = $(this).parent().parent(),
                    container = $('.form-headers-body');
                if (parent.index() + 1 === target_obj.find('tr').length) {
                    // 创建新的一行
                    let _htmlItem = self.view.getView('form', 'headers_params_line', {});
                    target_obj.append(_htmlItem);
                    $(this).parent().parent().find('.form-line-del-box').html('<i class="mdi mdi-close"></i>');
                    container.animate({scrollTop: 99999}, 'slow');
                }
                e.stopPropagation();
            }).on('change', '#form-request-headers-container .form-data-item', function(e) {
                // save to model
                self.module.form.get_headers_params();
                e.stopPropagation();
            })
        },

        /**
         * 表单输入自动增加行，body部分
         */
        form_data_body_input: function() {
            $('.form-container').on('input', '#form-data .form-data-item', function(e) {
                let data_type = $(this).attr('data-type');
                let target_obj = $('#form-body');
                let parent = $(this).parent().parent();
                if (parent.index() + 1 === target_obj.find('tr').length) {
                    // 创建新的一行
                    let _htmlItem = '';
                    // 根据类型不同，替换目标对象
                    switch (data_type)  {
                        case "form-data-true":
                            _htmlItem = self.view.getView('form', 'form_data_line', {});
                            break;
                        case "form-data":
                            _htmlItem = self.view.getView('form', 'urlencoded_line', {});
                            break;
                        default:
                            break;
                    }
                    target_obj.append(_htmlItem);
                    $(this).parent().parent().find('.form-line-del-box').html('<i class="mdi mdi-close"></i>');
                    //
                    $('.form-request-data-body-container').animate({scrollTop: 99999}, 'slow');
                }
                e.stopPropagation();
            }).on('change', '#form-data .form-data-item', function(e) {
                // 保存到model
                self.module.form.get_params();
                e.stopPropagation();
            });
        },

        /**
         * form data type
         */
        form_data_type_change: function() {
            $('.form-container').on('click', '.form-request-data-type', function(e) {
                let data_type = $(this).attr('data-type');
                Model.set('requestFormTypeTmp', data_type);
                e.stopPropagation();
            });
        },

        /**
         * 删除表单行
         */
        del_form_line: function() {
            $('.form-container').on('click', '.mdi-close', function(e) {
                $(this).parent().parent().remove();
                self.module.form.get_headers_params();
                self.module.form.get_params();
                // 检查是否删除url params，如果是，重新获取form data并设置url query string
                if ($(this).attr('data-type') === 'url-params-line') {
                    self.module.form.build_url_query_string();
                }
                e.stopPropagation();
            })
        },

        /**
         * 打开编辑参数界面
         */
        edit_parameter: function() {
            $('.form-container').on('click', '#form-edit-parameter', function(e) {
                let requestFormType = Model.get('requestFormType');
                if (requestFormType === 'raw') {
                    return false;
                }
                let requestData = Model.get('requestData_' + requestFormType);
                self.module.common.module('Edit Parameter', self.view.getView('form', 'edit_parameter', requestData), '');
                e.stopPropagation();
            });
        },
        url_change: function() {
            $('.form-container').on('change', '#request-url', function(e) {
                let url = $.trim($(this).val());
                let params = self.module.common.get_url_params(url);
                Model.set('urlParams', {display: true, list: params});
            });
        },

        url_params_change: function() {
            $('.form-container').on('input', '#js-url-params .form-data-item', function(e) {
                let data_type = $(this).attr('data-type');
                let target_obj = $('#js-url-params');
                let parent = $(this).parent().parent();
                if (parent.index() + 1 === target_obj.find('tr').length) {
                    // 创建新的一行
                    let _htmlItem = self.view.getView('form', 'headers_params_line', {});
                    target_obj.append(_htmlItem);
                    $(this).parent().parent().find('.form-line-del-box').html('<i class="mdi mdi-close" data-type="url-params-line"></i>');
                }
                e.stopPropagation();
            }).on('change', '#js-url-params .form-data-item', function(e) {
                self.module.form.build_url_query_string();
            });
        },

        formSelect: function() {
            $('.form-container').on('click', '.form-select', function() {
                if ($(this).hasClass('mdi-checkbox-marked')) {
                    $(this).removeClass('mdi-checkbox-marked');
                } else {
                    $(this).addClass('mdi-checkbox-marked');
                }

                if ($(this).parent().parent().parent().attr('id') === 'form-data-headers') {
                    self.module.form.get_headers_params();
                }
            });
        },

        /**
         * 全选参数
         */
        formSelectAll: function() {
            $('.form-container').on('click', '.form-select-all', function(e) {
                let isSelectAll = false;
                if ($(this).hasClass('mdi-checkbox-marked')) {
                    $(this).removeClass('mdi-checkbox-marked');
                    isSelectAll = false;
                } else {
                    $(this).addClass('mdi-checkbox-marked');
                    isSelectAll = true;
                }
                $(this).parent().parent().parent().find('.form-select').each(function() {
                    if (isSelectAll) {
                        if (!$(this).hasClass('mdi-checkbox-marked')) {
                            $(this).addClass('mdi-checkbox-marked');
                        }
                    } else {
                        if ($(this).hasClass('mdi-checkbox-marked')) {
                            $(this).removeClass('mdi-checkbox-marked');
                        }
                    }
                });

                if ($(this).parent().parent().parent().attr('id') === 'form-data-headers') {
                    self.module.form.get_headers_params();
                }

                self.module.form.get_params();
                e.stopPropagation();
            })
        },

        rawFormat: function() {
            $('.form-container').on('click', '.form-data-raw-json-format span', function(e) {
                let type = $(this).text(),
                    target = $('#form-data-raw-textarea'),
                    responseBody = target.val();

                switch (type) {
                    case 'Raw':
                        try {
                            responseBody = responseBody.replace(/\n|\r|\s/g, '');
                        } catch (e) {
                        }
                        break;
                    case 'JSON Format':
                        try {
                            responseBody = JSON.stringify(JSON.parse(responseBody), null, 4);
                        } catch (e) {
                            self.module.common.tips.show($(this), 'JSON format error.');
                            return false;
                        }
                        break;
                }

                target.val(responseBody);
                //
                $('.form-data-raw-json-format span').removeClass('bg-level-3').removeClass('focus');
                $(this).addClass('bg-level-3').addClass('focus');
            });
        }
    };
});
