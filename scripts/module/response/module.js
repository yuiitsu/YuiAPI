/**
 * Created by onlyfu on 2019/03/21.
 */
App.module.extend('response', function() {
    //
    let self = this;

    this.init = function() {
        //
        Model.set('response_data', '').watch('response_data', this.showResponse);
        //
        this.view.display('response', 'layout', {}, '.response-container');
    };

    this.showResponse = function() {
        let request_data = Model.get('request_data'),
            response_data = Model.get('response_data'),
            content_type = response_data['response_content_type'];

        response_data['codeTheme'] = Model.get('codeTheme');
        // 检查响应数据类型
        if (content_type && content_type.indexOf('application/json') !== -1) {
            // response_data['response'] =
            //     App.common.syntaxHighlight(JSON.stringify(response_data['response'], undefined, 4));
            response_data['response'] = self.syntaxHighlightPro(response_data['response']);
        } else if (content_type && content_type.indexOf('image') !== -1) {
            let src = null;
            try {
                let url = window.URL || window.webkitURL;
                src = url.createObjectURL(response_data['response']);
            } catch (e) {
                if (typeof response_data['response'] === 'string') {
                    // src = window.btoa(response_data['response']);
                    //src = 'data:image/png;base64,' + response_data['response'];
                    src = request_data.url;
                }
            }

            if (src) {
                response_data['response'] = '<img src="'+ src +'" />';
            } else {
                response_data['response'] = 'Image Blob data cannot be displayed. Please send the request.';
            }
        } else if (content_type && (content_type.indexOf('text/xml') !== -1 ||
            content_type.indexOf('application/xml') !== -1)) {
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
                        response = self.syntaxHighlightPro(response);
                    } catch (e) {
                        if (typeof response_data['response'] === 'object') {
                            response = self.syntaxHighlightPro(response_data['response']);
                        } else {
                            response = response_data['response'].replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        }
                    }
                }
            }

            response_data['response'] = response;
        }

        self.view.display('response', 'layout', response_data, '.response-container');
    };

    this.syntaxHighlightPro = function(data) {

        let result = [];

        function iteration(data, isStart) {
            let dataType = Object.prototype.toString.call(data),
                isArray = false,
                symbolStart = '',
                symbolEnd = '';
            if (dataType === '[object Object]') {
                symbolStart = '{';
                symbolEnd = '}';
            }
            if (dataType === '[object Array]') {
                symbolStart = '[';
                symbolEnd = ']';
                isArray = true;
            }

            if (isStart) {
                result.push('<div class="row-root"><i class="code-switch"></i><span>' + symbolStart + '</span>');
            } else {
                result.push('<div class="child">');
            }

            for (let i in data) {
                if (data.hasOwnProperty(i)) {
                    let dataType = Object.prototype.toString.call(data[i]),
                        symbolStart = '',
                        symbolEnd = '',
                        key = isArray ? '' : '<span class="code-key">'+ i +': </span>';
                    if (dataType === '[object Object]') {
                        symbolStart = '{';
                        symbolEnd = '}';
                    }
                    if (dataType === '[object Array]') {
                        symbolStart = '[';
                        symbolEnd = ']';
                    }

                    if (dataType === '[object Object]') {
                        if (Object.keys(data[i]).length > 0) {
                            result.push('<div class="child row-child"><i class="code-switch"></i>'+ key +'<span>' + symbolStart);
                            result.push('</span></div>');
                            iteration(data[i]);
                        } else {
                            result.push('<div class="child row-node">');
                            result.push(key +'<span>' + symbolStart);
                            result.push(symbolEnd + '</span></div>');
                        }
                    } else if (dataType === '[object Array]') {
                        if (data[i].length > 0) {
                            result.push('<div class="child row-child"><i class="code-switch"></i>'+ key +'<span>' + symbolStart);
                            result.push('</span></div>');
                            iteration(data[i]);
                        } else {
                            result.push('<div class="child row-node">');
                            result.push(key + '<span>' + symbolStart);
                            result.push(symbolEnd + '</span></div>');
                        }
                    } else {
                        let classValue = 'code-number',
                            value = data[i];
                        if (typeof data[i] === 'string') {
                            classValue = 'code-string';
                            value = '"'+ value + '"';
                            value = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        }
                        result.push('<div class="child row-node">'+ key +
                            '<span class="code-value '+ classValue +'">'+ value +'</span></div>');
                    }
                }
            }

            result.push('<span>'+ symbolEnd +'</span></div>');
        }

        iteration(data, true);

        return result.join("");
    };
});
