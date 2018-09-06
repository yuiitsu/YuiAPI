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
        // 监听请求结果数据
        Model.set('response_data', '').watch('response_data', this.show_response);
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
    }
});

