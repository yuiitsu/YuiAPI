/**
 * form module
 * Created by onlyfu on 2018/05/25.
 */
App.module.extend('form', function() {
    // 已选择group id
    this.selected_group_id = '';
    // 
    let self = this;
    // default data
    Model.default['url_params'] = {
        display: true,
        list: []
    };
    Model.default['request_headers'] = {};

    Model.default['authentication'] = {
        type: '',
        data: {}
    };

    Model.default['request_data'] = {
        name: '',
        host: '',
        url: '',
        type: '',
        group_id: 0,
        data_type: '',
        request_headers: Model.default.request_headers,
        authentication: Model.default.authentication,
        params: {},
        data: {},
        status: 0,
        time: 0,
        response_content_type: '',
        headers: '',
        result: '',
        assertion_data: ''
    };

    Model.default['codeTheme'] = localStorage.getItem('codeTheme') ?
        localStorage.getItem('codeTheme') : 'dark';

    /**
     * 初始化
     */
    this.init = function() {
        // 监听数据
        // 请求表单类型，变化后，切换对应表单
        Model.set('request_form_type', 'form-data');
        // 切换解发事件用，值等于request_form_type
        // Model.set('request_form_type_tmp', 'form-data').watch('request_form_type_tmp', this.change_form);
        // 整个请求数据对象，包括url，request type, params等
        // Model.set('url_params', Model.default.url_params).watch('url_params', this.show_url_params);
        Model.set('request_headers', Model.default.request_headers);
        Model.set('authentication', Model.default.authentication);
        Model.set('requestData', Model.default.request_data).watch('requestData', this.renderForm);
        // 请求参数,三种类型分别存储
        Model.set('request_data_form-data', {});
        Model.set('request_data_form-data-true', {});
        Model.set('request_data_raw', '');
        // 监听请求结果数据
        //Model.set('response_data', '').watch('response_data', this.show_response);
        // Model.set('codeTheme', Model.default.codeTheme).watch('codeTheme', this.renderCodeTheme);
        // 渲染页面
        this.view.display('form', 'layout', {'list': [], 'selected_group_id': this.selected_group_id}, '.form-container');
        //
        // View.display('form', 'response_layout', {}, '#output-content');
    };

    /**
     * 渲染请求参数
     */
    this.renderForm = function() {
        let requestData = Model.get('requestData');
        // 处理headers的显示，即有数据时，默认打开headers表单
        let request_headers = requestData['request_headers'];
        if (request_headers && Object.keys(request_headers).length > 0) {
            requestData['headers_line_type'] = 'Headers';
        }
        // 分析url参数
        let url = requestData.url;
        let params = self.module.common.get_url_params(url);
        Model.set('url_params', {display: true, list: params});
        requestData['url_params'] = {list: params};
        //
        self.view.display('form', 'layout', requestData, '.form-container');
        // 存储表单参数数据
        let request_form_type = Model.get('request_form_type');
        Model.set('request_data_' + request_form_type, requestData['data']);
    };

    /**
     * 渲染url params表单
     */
    this.show_url_params = function() {
        // 检查url params form是否在页面上，如果在重新渲染，如果不在，不做处理
        if ($('#js-form-url-params').length > 0) {
            let url_params = Model.get('url_params');
            if (url_params.display) {
                View.display('form', 'headers_params', {url_params: url_params}, '.form-headers-body');
            }
        }
    };

    /**
     * 格式化结果
     */
    this.format = function() {
        let response_data = Model.get('response_data');
        let response = response_data['response'];
        let content_type = response_data['response_content_type'];

        if (!content_type) {
            return false;
        }

        if (content_type.indexOf('image') !== -1) {
            return false;
        }

        if (content_type.indexOf('application/json') !== -1) {
            response = App.common.syntaxHighlightPro(response);
        //} else if (content_type && content_type.indexOf('text/html') !== -1) {
        //    response = response.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        } else {
            response = 'Failed to load response data';
            if (response_data['response']) {
                response = self.parse_xml(response_data['response']);
                if (!response) {
                    try {
                        response = JSON.parse(response_data['response']);
                        response = App.common.syntaxHighlightPro(response);
                    } catch (e) {
                        //response = response_data['response'].replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        if (typeof response_data['response'] === 'object') {
                            response = App.common.syntaxHighlightPro(response_data['response']);
                        } else {
                            response = response_data['response'].replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        }
                    }
                }
            }
        }

        $('#result').removeClass('raw').html(response);
        return true;
    };

    /**
     * 去格式化结果
     */
    this.raw = function() {
        let response_data = Model.get('response_data');
        let content_type = response_data['response_content_type'];

        if (!content_type) {
            return false;
        }

        if (content_type.indexOf('image') !== -1) {
            return false;
        }

        let response = response_data['response'];
        if (typeof response_data['response'] === 'string') {
            response = response.replace(/[\n\r]/g, '');
        } else if (typeof  response_data['response'] === 'object') {
            response = JSON.stringify(response);
        }
        $('#result').addClass('raw').text(response);
        return true;
    };

    /**
     * 根据form类型，切换对应表单
     */
    this.change_form = function() {
        let request_form_type_tmp = Model.get('request_form_type_tmp');
        let request_data = Model.get('request_data_' + request_form_type_tmp);
        let view_name = '';
        switch (request_form_type_tmp) {
            case 'form-data':
                view_name = 'urlencoded_box';
                break;
            case 'form-data-true':
                view_name = 'form_data_box';
                break;
            case 'raw':
                view_name = 'raw';
                break;
            default:
                view_name = 'urlencoded_line';
                break;
        }
        Model.set('request_form_type', request_form_type_tmp);
        View.display('form', view_name, request_data, '#form-data');
    };

    /**
     * 获取页面请求参数，保存成model数据
     */
    this.get_params = function() {
        let target = $('#form-data'),
            request_form_type_tmp = Model.get('request_form_type_tmp'),
            form_data = {},
            i = 0;

        if (request_form_type_tmp === 'raw') {

        } else {
            let select_obj = target.find('.form-select'),
                key_obj = target.find('.form-key'),
                value_type_obj = target.find('.form-value-data-type'),
                value_obj = target.find('.form-value'),
                description_obj = target.find('.form-description');

            select_obj.each(function () {
                if ($(this).is(":checked")) {
                    let key = $.trim(key_obj.eq(i).val());
                    if (key) {
                        let value = $.trim(value_obj.eq(i).val()),
                            value_type = 'Text';

                        if (value_type_obj.eq(i).val() === 'File') {
                            value_type = 'File';
                        }

                        form_data[key] = {
                            value: value,
                            value_type: value_type,
                            description: $.trim(description_obj.eq(i).val())
                        };
                    }
                }
                i++;
            });
        }

        Model.set('request_data_' + request_form_type_tmp, form_data);
    };

    /**
     * 获取页面请求headers参数，保存成model数据
     */
    this.get_headers_params = function() {
        let target = $('#form-data-headers'),
            form_data = {},
            i = 0;

        let select_obj = target.find('.form-select'),
            key_obj = target.find('.form-key'),
            value_type_obj = target.find('.form-value-data-type'),
            value_obj = target.find('.form-value'),
            description_obj = target.find('.form-description');

        select_obj.each(function () {
            if ($(this).is(":checked")) {
                let key = $.trim(key_obj.eq(i).val());
                if (key) {
                    let value = $.trim(value_obj.eq(i).val()),
                        value_type = 'Text';

                    if (value_type_obj.eq(i).val() === 'File') {
                        value_type = 'File';
                    }

                    form_data[key] = {
                        value: value,
                        value_type: value_type,
                        description: $.trim(description_obj.eq(i).val())
                    };
                }
            }
            i++;
        });

        Model.set('request_headers', form_data);
    };

    /**
     * 获取url params，保存成model数据
     */
    this.get_url_params = function() {
        let target = $('#js-url-params'),
            form_data = [],
            i = 0;

        let select_obj = target.find('.form-select'),
            key_obj = target.find('.form-key'),
            value_obj = target.find('.form-value');

        select_obj.each(function () {
            if ($(this).is(":checked")) {
                let key = $.trim(key_obj.eq(i).val());
                if (key) {
                    form_data.push({
                        key: key,
                        val: $.trim(value_obj.eq(i).val())
                    });
                }
            }
            i++;
        });

        return form_data;
    };

    /**
     * 将数据对象中的数据转为请求参数
     * form-data-true: new FormData()
     */
    this.build_request_data = function() {
        let request_form_type_tmp = Model.get('request_form_type_tmp');
        let request_data = Model.get('request_data_' + request_form_type_tmp);
        let form_data = {},
            is_form_data = false;
        if (request_form_type_tmp === 'form-data-true') {
            form_data = new FormData();
            is_form_data = true;
        }

        for (let i in request_data) {
            if (request_data.hasOwnProperty(i)) {
                if (is_form_data) {
                    if (request_data[i]['value_type'] === 'File') {
                        form_data.push(i, request_data[i]['value']);
                    } else {
                        form_data.push(i, request_data[i]['value']);
                    }
                } else {

                }
            }
        }

        return {
            data: request_data,
            history_data: request_data
        }
    };

    /**
     * 将Model里的authentication数据构建成为请求参数
     * @param request_params
     * @returns {string}
     */
    this.build_authentication_to_request = function(request_params) {
        let authentication = Model.get('authentication');
        if (authentication) {
            let data = authentication.data;

            switch (authentication.type) {
                case "Basic":
                    let content = data['user'] + ':' + data['pass'];
                    request_params['headers']['Authorization'] = 'Basic ' + btoa(content);
                    break;
                default:
                    break;
            }
        } else {
            authentication = {type: '', data: {}};
        }

        Model.set('authentication', authentication);
        return authentication;
    };

    this.build_url_query_string = function() {
        let url_params = App.form.get_url_params(),
            query_string = '';
        if (Object.keys(url_params).length > 0) {
            let query_string_list = [];
            for (var i in url_params) {
                if (url_params.hasOwnProperty(i)) {
                    query_string_list.push(url_params[i]['key'] + '=' + encodeURIComponent(url_params[i]['val']));
                }
            }
            query_string = query_string_list.join("&");

        }
        let target = $('#url');
        let url = $.trim(target.val());
        url = url.split('?')[0] + '?' + query_string;
        target.val(url);
        Model.set('url_params', {display: false, list: url_params});
    };

    this.renderCodeTheme = function() {
        let codeTheme = Model.get('codeTheme');
        $('.result-box').removeClass('code-theme-light')
            .removeClass('code-theme-dark').addClass('code-theme-' + codeTheme);
    };
});

