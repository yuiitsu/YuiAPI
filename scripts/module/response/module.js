/**
 * Created by onlyfu on 2019/03/21.
 */
App.module.extend('response', function() {
    //
    let self = this;
    //
    Model.default['showResponseDataType'] = 'Body';

    this.init = function() {
        //
        Model.set('responseData', '').watch('responseData', this.renderResponse);
        Model.set('jsonData', '').watch('jsonData', this.renderJsonFormat);
        Model.set('showResponseDataType', Model.default.showResponseDataType)
            .watch('showResponseDataType', this.renderResponse);
        //
        this.view.display('response', 'empty', {}, '.response-container');
    };

    this.renderResponse = function() {
        let requestData = Model.get('requestData'),
            responseData = Model.get('responseData'),
            showResponseDataType = Model.get('showResponseDataType'),
            contentType = responseData['responseContentType'],
            renderData = {
                headers: responseData['headers'],
                response: responseData['response'],
                responseContentType: responseData['responseContentType'],
                showResponseDataType: showResponseDataType,
                status: responseData['status'],
                use_time: responseData['use_time'],
            };

        // 检查响应数据类型
        if (contentType && contentType.indexOf('application/json') !== -1) {
            renderData['response'] = self.syntaxHighlightPro(responseData['response']);
        } else if (contentType && contentType.indexOf('image') !== -1) {
            let src = null;
            try {
                let url = window.URL || window.webkitURL;
                src = url.createObjectURL(renderData['response']);
            } catch (e) {
                if (typeof renderData['response'] === 'string') {
                    src = requestData.url;
                }
            }

            if (src) {
                renderData['response'] = '<img src="' + src + '" />';
            } else {
                renderData['response'] = 'Image Blob data cannot be displayed. Please send the request.';
            }
        } else if (contentType && (contentType.indexOf('text/xml') !== -1 ||
            contentType.indexOf('application/xml') !== -1)) {
            renderData['response'] = self.parse_xml(renderData['response']);
        } else {
            let response = '';
            if (renderData['response']) {
                response = self.parse_xml(renderData['response']);
                if (!response) {
                    try {
                        response = JSON.parse(renderData['response']);
                        response = self.syntaxHighlightPro(response);
                    } catch (e) {
                        if (typeof renderData['response'] === 'object') {
                            response = self.syntaxHighlightPro(renderData['response']);
                        } else {
                            response = renderData['response'].replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        }
                    }
                }
            }

            renderData['response'] = response;
        }
        self.view.display('response', 'layout', renderData, '.response-container');
    };

    this.renderJsonFormat = function() {
        let jsonData = Model.get('jsonData');
        try {
            jsonData = JSON.parse(jsonData);
            jsonData = self.syntaxHighlightPro(jsonData);
        } catch (e) {
        }
        self.view.display('response', 'jsonEditorBody', jsonData, '.response-container');
    };

    this.showFormat = function() {
        let responseData = Model.get('responseData'),
            responseBody = responseData.response;

        if (Object.prototype.toString.call(responseBody) === '[object Object]') {
            try {
                responseBody = JSON.stringify(responseBody, null, 4);
            } catch (e) {
            }
        }
        self.module.common.module('Source', self.view.getView('response', 'format', {
            responseBody: responseBody
        }), '');
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

    /**
     * 格式化xml
     * @param content
     * @returns {*}
     */
    this.parse_xml = function(content) {
        let xml_doc;
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
});
