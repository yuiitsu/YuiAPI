/**
 * form module
 * Created by onlyfu on 2018/05/25.
 */
App.extend('form', function() {
    this.selected_group_id = '';
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
        if (content_type.indexOf('application/json') !== -1) {
            response_data['response'] = App.common.syntaxHighlight(JSON.stringify(response_data['response'], undefined, 4));
        } else if (content_type.indexOf('image') !== -1) {
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
        } else if (content_type.indexOf('text/xml') !== -1) {
            let xml_doc = (new DOMParser()).parseFromString(s.replace(/[\n\r]/g, ""), 'text/xml');

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
                        list.push(t + '&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-key">' + nodeName + '</span>&gt;' + value_txt + '&lt;/<span class="code-key">' + nodeName + '</span>&gt;\n');
                    } else {
                        build_xml(++index, list, element.childNodes[i]);
                    }
                }
                list.push(t + '&lt;/<span class="code-key">'+ element.nodeName +'</span>&gt;\n');
            }

            let list = [];
            build_xml(0, list, xml_doc.documentElement);

            response_data['response'] = list.join("");
        } else if (content_type.indexOf('text/html') !== -1) {
            response_data['response'] = response_data['response'].replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        View.display('form', 'response_layout', response_data, '#output-content');
    }
});

