/**
 * form module
 * Created by onlyfu on 2018/05/25.
 */
App.extend('form', function() {
    this.selected_group_id = '';
    let self = this;
    /**
     * 初始化
     */
    this.init = function() {
        // 监听数据
        // 请求表单类型，变化后，切换对应表单
        Model.set('request_form_type', 'form-data');
        // 切换解发事件用，值等于request_form_type
        Model.set('request_form_type_tmp', 'form-data').watch('request_form_type_tmp', this.change_form);
        // 整个请求数据对象，包括url，request type, params等
        Model.set('request_data', {}).watch('request_data', this.show_form);
        // 请求参数,三种类型分别存储
        Model.set('request_data_form-data', {});
        Model.set('request_data_form-data-true', {});
        Model.set('request_data_raw', '');
        // 监听请求结果数据
        Model.set('response_data', '').watch('response_data', this.show_response);
        // 渲染页面
        View.display('form', 'layout', {'list': [], 'selected_group_id': this.selected_group_id}, '#form-box');
        View.display('form', 'response_layout', {}, '#output-content');
    };

    /**
     * 渲染响应结果到页面
     */
    this.show_response = function() {
        let response_data = Model.get('response_data');
        let content_type = response_data['response_content_type'];

        // 检查响应数据类型
        if (content_type && content_type.indexOf('application/json') !== -1) {
            response_data['response'] =
                App.common.syntaxHighlight(JSON.stringify(response_data['response'], undefined, 4));
        } else if (content_type && content_type.indexOf('image') !== -1) {
            let src = null;
            try {
                let url = window.URL || window.webkitURL;
                src = url.createObjectURL(response_data['response']);
            } catch (e) {
                if (typeof result === 'string') {
                    src = result;
                }
            }

            if (src) {
                response_data['response'] = '<img src="'+ src +'" />';
            } else {
                response_data['response'] = 'Image Blob data cannot be displayed. Please send the request.';
            }
        } else if (content_type && (content_type.indexOf('text/xml') !== -1 || content_type.indexOf('application/xml') !== -1)) {
            response_data['response'] = self.parse_xml(response_data['response']);
        //} else if (content_type && content_type.indexOf('text/html') !== -1) {
        //    response_data['response'] = response_data['response'].replace(/</g, "&lt;").replace(/>/g, "&gt;");
        } else {
            let response = 'Failed to load response data';
            if (response_data['response']) {
                response = self.parse_xml(response_data['response']);
                if (!response) {
                    try {
                        response = JSON.parse(response_data['response']);
                        response = App.common.syntaxHighlight(JSON.stringify(response, undefined, 4));
                    } catch (e) {
                        response = response_data['response'].replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    }
                }
            }

            response_data['response'] = response;
        }

        View.display('form', 'response_layout', response_data, '#output-content');
    };

    /**
     * 渲染请求参数
     */
    this.show_form = function() {
        let request_data = Model.get('request_data');
        View.display('form', 'layout', request_data, '#form-box');
        // 存储表单参数数据
        let request_form_type = Model.get('request_form_type');
        Model.set('request_data_' + request_form_type, request_data['data']);
    };

    /**
     * 格式化xml
     * @param content
     * @returns {*}
     */
    this.parse_xml = function(content) {
        try {
            xml_doc = (new DOMParser()).parseFromString(content.replace(/[\n\r]/g, ""), 'text/xml');
        } catch (e) {
            return false;
        }

        if (xml_doc.documentElement.nodeName.toUpperCase() !== 'XML') {
            return false;
        }

        function build_xml(index, list, element) {
            let t = [];
            for (let i = 0; i < index; i++) {
                t.push('&nbsp;&nbsp;&nbsp;&nbsp;');
            }
            t = t.join("");
            list.push(t + '&lt;<span class="code-key">'+ element.nodeName +'</span>&gt;\n');
            for (let i = 0; i < element.childNodes.length; i++) {
                let nodeName = element.childNodes[i].nodeName;
                if (element.childNodes[i].childNodes.length === 1) {
                    let value = element.childNodes[i].childNodes[0].nodeValue;
                    let value_color = !isNaN(Number(value)) ? 'code-number' : 'code-string';
                    let value_txt = '<span class="'+ value_color +'">' + value + '</span>';
                    let item = t + '&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-key">' + nodeName +
                        '</span>&gt;' + value_txt + '&lt;/<span class="code-key">' + nodeName + '</span>&gt;\n';
                    list.push(item);
                } else {
                    build_xml(++index, list, element.childNodes[i]);
                }
            }
            list.push(t + '&lt;/<span class="code-key">'+ element.nodeName +'</span>&gt;\n');
        }

        let list = [];
        build_xml(0, list, xml_doc.documentElement);

        return list.join("");
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
            response =
                App.common.syntaxHighlight(JSON.stringify(response, undefined, 4));
        //} else if (content_type && content_type.indexOf('text/html') !== -1) {
        //    response = response.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        } else {
            response = 'Failed to load response data';
            if (response_data['response']) {
                response = self.parse_xml(response_data['response']);
                if (!response) {
                    try {
                        response = JSON.parse(response_data['response']);
                        response = App.common.syntaxHighlight(JSON.stringify(response, undefined, 4));
                    } catch (e) {
                        response = response_data['response'].replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
});

