/**
 * Import and export cURL commands.
 * Created by onlyfu on 2021/05/12.
 */
App.module.extend('tools.curl', function() {
    let self = this;

    let decodeAnsiEscape = function(content, index) {
        let escape = content[index],
            simpleEscapes = {
                'a': '\x07',
                'b': '\b',
                'e': '\x1b',
                'f': '\f',
                'n': '\n',
                'r': '\r',
                't': '\t',
                'v': '\v',
                '\\': '\\',
                "'": "'"
            };
        if (simpleEscapes.hasOwnProperty(escape)) {
            return {value: simpleEscapes[escape], length: 1};
        }
        if (escape === 'x') {
            let hex = content.substr(index + 1, 2);
            if (/^[0-9a-f]{2}$/i.test(hex)) {
                return {value: String.fromCharCode(parseInt(hex, 16)), length: 3};
            }
        }
        if (escape === 'u') {
            let unicode = content.substr(index + 1, 4);
            if (/^[0-9a-f]{4}$/i.test(unicode)) {
                return {value: String.fromCharCode(parseInt(unicode, 16)), length: 5};
            }
        }
        return {value: escape, length: 1};
    };

    let decodeFormValue = function(value) {
        try {
            return decodeURIComponent(value.replace(/\+/g, ' '));
        } catch (error) {
            return value.replace(/\+/g, ' ');
        }
    };

    let shellQuote = function(value) {
        return "'" + String(value === undefined || value === null ? '' : value)
            .replace(/'/g, "'\\''") + "'";
    };

    let fieldValue = function(field) {
        return field && typeof field === 'object' ? field['value'] : field;
    };

    let textValue = function(field) {
        let value = fieldValue(field);
        return value === undefined || value === null ? '' : String(value);
    };

    let addField = function(target, key, value, valueType, description, warnings) {
        if (!key) {
            return false;
        }
        if (target.hasOwnProperty(key)) {
            warnings.push('Duplicate field "' + key + '" was replaced by its last value.');
        }
        target[key] = {
            value: value,
            value_type: valueType || 'Text',
            description: description || ''
        };
        return true;
    };

    let addHeader = function(headers, name, value) {
        let existingName = '';
        for (let key in headers) {
            if (headers.hasOwnProperty(key) && key.toLowerCase() === name.toLowerCase()) {
                existingName = key;
                break;
            }
        }
        if (existingName && existingName !== name) {
            delete headers[existingName];
        }
        headers[name] = {
            value: value,
            value_type: 'Text',
            description: ''
        };
    };

    let getHeader = function(headers, name) {
        for (let key in headers) {
            if (headers.hasOwnProperty(key) && key.toLowerCase() === name.toLowerCase()) {
                return headers[key]['value'];
            }
        }
        return '';
    };

    let removeHeader = function(headers, name) {
        for (let key in headers) {
            if (headers.hasOwnProperty(key) && key.toLowerCase() === name.toLowerCase()) {
                delete headers[key];
            }
        }
    };

    let appendQuery = function(url, query) {
        if (!query) {
            return url;
        }
        let hash = '',
            hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
            hash = url.substr(hashIndex);
            url = url.substr(0, hashIndex);
        }
        return url + (url.indexOf('?') === -1 ? '?' : '&') + query + hash;
    };

    let dataArgumentToQuery = function(argument) {
        if (argument.type !== 'urlencode') {
            return argument.value;
        }
        let equalIndex = argument.value.indexOf('=');
        if (equalIndex === -1) {
            return encodeURIComponent(argument.value);
        }
        return argument.value.substr(0, equalIndex) + '=' +
            encodeURIComponent(argument.value.substr(equalIndex + 1));
    };

    let parseUrlEncoded = function(argumentsList, warnings) {
        let result = {},
            content = [];
        for (let i = 0; i < argumentsList.length; i++) {
            content.push(argumentsList[i]['value']);
        }
        let pairs = content.join('&').split('&');
        for (let i = 0; i < pairs.length; i++) {
            if (!pairs[i]) {
                continue;
            }
            let equalIndex = pairs[i].indexOf('='),
                key = equalIndex === -1 ? pairs[i] : pairs[i].substr(0, equalIndex),
                value = equalIndex === -1 ? '' : pairs[i].substr(equalIndex + 1);
            addField(result, decodeFormValue(key), decodeFormValue(value), 'Text', '', warnings);
        }
        return result;
    };

    this.tokenize = function(command) {
        let input = String(command || '')
                .replace(/\\\r?\n/g, '')
                .replace(/\^\r?\n/g, '')
                .trim(),
            tokens = [],
            token = '',
            quote = '',
            tokenStarted = false;

        for (let i = 0; i < input.length; i++) {
            let character = input[i];
            if (!quote) {
                if (/\s/.test(character)) {
                    if (tokenStarted) {
                        tokens.push(token);
                        token = '';
                        tokenStarted = false;
                    }
                    continue;
                }
                if (character === '$' && input[i + 1] === "'") {
                    quote = 'ansi';
                    tokenStarted = true;
                    i++;
                    continue;
                }
                if (character === "'" || character === '"') {
                    quote = character;
                    tokenStarted = true;
                    continue;
                }
                if ((character === '\\' || character === '^') && i + 1 < input.length) {
                    token += input[++i];
                    tokenStarted = true;
                    continue;
                }
                token += character;
                tokenStarted = true;
                continue;
            }

            if (quote === "'") {
                if (character === "'") {
                    quote = '';
                } else {
                    token += character;
                }
                continue;
            }

            if (quote === 'ansi') {
                if (character === "'") {
                    quote = '';
                } else if (character === '\\' && i + 1 < input.length) {
                    let decoded = decodeAnsiEscape(input, i + 1);
                    token += decoded.value;
                    i += decoded.length;
                } else {
                    token += character;
                }
                continue;
            }

            if (character === '"') {
                quote = '';
            } else if (character === '^' && i + 1 < input.length) {
                token += input[++i];
            } else if (character === '\\' && i + 1 < input.length) {
                if ('"\\$`'.indexOf(input[i + 1]) !== -1) {
                    token += input[++i];
                } else {
                    token += character;
                }
            } else {
                token += character;
            }
        }

        if (quote) {
            throw new Error('The cURL command contains an unclosed quote.');
        }
        if (tokenStarted) {
            tokens.push(token);
        }
        return tokens;
    };

    this.parse = function(command) {
        let tokens = this.tokenize(command);
        if (tokens.length === 0) {
            throw new Error('Paste a cURL command first.');
        }
        if (!/(^|[\\/])curl(?:\.exe)?$/i.test(tokens[0])) {
            throw new Error('The command must start with curl.');
        }

        let headers = {},
            dataArguments = [],
            formArguments = [],
            queryArguments = [],
            warnings = [],
            urls = [],
            authentication = {type: '', data: {}},
            method = '',
            useGet = false,
            useHead = false,
            endOfOptions = false,
            ignoredBooleanOptions = [
                '--location', '--location-trusted', '--compressed', '--insecure', '--silent',
                '--show-error', '--verbose', '--globoff', '--http1.0', '--http1.1', '--http2',
                '--http2-prior-knowledge', '--no-buffer', '--fail', '--fail-with-body',
                '--include', '--path-as-is', '--basic', '--no-progress-meter'
            ],
            ignoredValueOptions = [
                '--connect-timeout', '--max-time', '--retry', '--retry-delay', '--retry-max-time',
                '--max-redirs', '--proxy', '--proxy-user', '--cacert', '--capath', '--cert',
                '--cert-type', '--key', '--key-type', '--resolve', '--connect-to', '--interface',
                '--output', '--write-out', '--limit-rate'
            ];

        let readValue = function(index, inlineValue, option) {
            if (inlineValue !== null) {
                return {value: inlineValue, index: index};
            }
            if (index + 1 >= tokens.length) {
                throw new Error('Missing value for ' + option + '.');
            }
            return {value: tokens[index + 1], index: index + 1};
        };

        let addUrl = function(url) {
            if (!url) {
                throw new Error('The cURL command contains an empty URL.');
            }
            if (url[0] === '@') {
                throw new Error('URL files are not supported.');
            }
            urls.push(url);
        };

        for (let i = 1; i < tokens.length; i++) {
            let token = tokens[i];
            if (endOfOptions) {
                addUrl(token);
                continue;
            }
            if (token === '--') {
                endOfOptions = true;
                continue;
            }

            if (token.substr(0, 2) === '--') {
                let equalIndex = token.indexOf('='),
                    option = equalIndex === -1 ? token : token.substr(0, equalIndex),
                    inlineValue = equalIndex === -1 ? null : token.substr(equalIndex + 1),
                    item;

                if (ignoredBooleanOptions.indexOf(option) !== -1) {
                    continue;
                }
                if (ignoredValueOptions.indexOf(option) !== -1) {
                    item = readValue(i, inlineValue, option);
                    i = item.index;
                    continue;
                }

                switch (option) {
                    case '--url':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        addUrl(item.value);
                        break;
                    case '--request':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        method = item.value.toUpperCase();
                        break;
                    case '--header':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        this.parseHeader(item.value, headers);
                        break;
                    case '--data':
                    case '--data-ascii':
                    case '--data-raw':
                    case '--data-binary':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        if (option !== '--data-raw' && item.value[0] === '@') {
                            throw new Error('File-backed data is not supported. Paste the file content instead.');
                        }
                        dataArguments.push({
                            type: option === '--data-binary' ? 'binary' : 'data',
                            value: item.value
                        });
                        break;
                    case '--data-urlencode':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        if (/^@|^[^=]+@/.test(item.value)) {
                            throw new Error('File-backed data is not supported. Paste the file content instead.');
                        }
                        dataArguments.push({type: 'urlencode', value: item.value});
                        break;
                    case '--json':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        if (item.value[0] === '@') {
                            throw new Error('File-backed data is not supported. Paste the file content instead.');
                        }
                        dataArguments.push({type: 'json', value: item.value});
                        if (!getHeader(headers, 'Content-Type')) {
                            addHeader(headers, 'Content-Type', 'application/json');
                        }
                        if (!getHeader(headers, 'Accept')) {
                            addHeader(headers, 'Accept', 'application/json');
                        }
                        break;
                    case '--form':
                    case '--form-string':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        formArguments.push({value: item.value, literal: option === '--form-string'});
                        break;
                    case '--user':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        this.parseUser(item.value, authentication);
                        break;
                    case '--user-agent':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        addHeader(headers, 'User-Agent', item.value);
                        break;
                    case '--referer':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        addHeader(headers, 'Referer', item.value);
                        break;
                    case '--cookie':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        addHeader(headers, 'Cookie', item.value);
                        break;
                    case '--oauth2-bearer':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        addHeader(headers, 'Authorization', 'Bearer ' + item.value);
                        break;
                    case '--url-query':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        queryArguments.push({type: 'urlencode', value: item.value});
                        break;
                    case '--get':
                        useGet = true;
                        break;
                    case '--head':
                        useHead = true;
                        break;
                    default:
                        throw new Error('Unsupported cURL option: ' + option + '.');
                }
                continue;
            }

            if (token[0] === '-' && token !== '-') {
                let option = token.substr(0, 2),
                    inlineValue = token.length > 2 ? token.substr(2) : null,
                    item;

                if (/^-[LksSvgGNfiI]+$/.test(token)) {
                    if (token.indexOf('I') !== -1) {
                        useHead = true;
                    }
                    if (token.indexOf('G') !== -1) {
                        useGet = true;
                    }
                    continue;
                }

                switch (option) {
                    case '-X':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        method = item.value.toUpperCase();
                        break;
                    case '-H':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        this.parseHeader(item.value, headers);
                        break;
                    case '-d':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        if (item.value[0] === '@') {
                            throw new Error('File-backed data is not supported. Paste the file content instead.');
                        }
                        dataArguments.push({type: 'data', value: item.value});
                        break;
                    case '-F':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        formArguments.push({value: item.value, literal: false});
                        break;
                    case '-u':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        this.parseUser(item.value, authentication);
                        break;
                    case '-A':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        addHeader(headers, 'User-Agent', item.value);
                        break;
                    case '-e':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        addHeader(headers, 'Referer', item.value);
                        break;
                    case '-b':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        addHeader(headers, 'Cookie', item.value);
                        break;
                    case '-m':
                    case '-x':
                    case '-o':
                    case '-w':
                        item = readValue(i, inlineValue, option);
                        i = item.index;
                        break;
                    default:
                        throw new Error('Unsupported cURL option: ' + token + '.');
                }
                continue;
            }

            addUrl(token);
        }

        if (urls.length === 0) {
            throw new Error('No URL was found in the cURL command.');
        }
        if (urls.length > 1) {
            throw new Error('Only one URL can be imported at a time.');
        }

        let url = urls[0];
        if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
            url = 'http://' + url;
        }
        if (!/^https?:\/\//i.test(url)) {
            throw new Error('Only HTTP and HTTPS URLs are supported.');
        }

        if (queryArguments.length > 0) {
            url = appendQuery(url, queryArguments.map(dataArgumentToQuery).join('&'));
        }
        if ((useGet || useHead) && dataArguments.length > 0) {
            url = appendQuery(url, dataArguments.map(dataArgumentToQuery).join('&'));
        }

        let dataType = 'form-data',
            requestData = {},
            contentType = getHeader(headers, 'Content-Type'),
            dataText = dataArguments.map(function(argument) {
                return argument.value;
            }).join('&'),
            hasRawData = dataArguments.some(function(argument) {
                return argument.type === 'binary' || argument.type === 'json';
            });

        if (formArguments.length > 0) {
            dataType = 'form-data-true';
            requestData = this.parseFormData(formArguments, warnings);
            removeHeader(headers, 'Content-Type');
        } else if (!useGet && !useHead && dataArguments.length > 0) {
            let looksLikeUrlEncoded = dataArguments.every(function(argument) {
                    return argument.value.split('&').every(function(pair) {
                        return pair.indexOf('=') > 0;
                    });
                }),
                isUrlEncoded = !hasRawData && looksLikeUrlEncoded &&
                (!contentType || contentType.toLowerCase().indexOf('application/x-www-form-urlencoded') !== -1) &&
                !/^[{\[<]/.test(dataText.trim());
            if (isUrlEncoded) {
                dataType = 'form-data';
                requestData = parseUrlEncoded(dataArguments, warnings);
            } else {
                dataType = 'raw';
                requestData = {
                    content_type: contentType || 'text/plain',
                    data: dataText
                };
            }
        }

        if (!method) {
            if (useHead) {
                method = 'HEAD';
            } else if (useGet) {
                method = 'GET';
            } else if (formArguments.length > 0 || dataArguments.length > 0) {
                method = 'POST';
            } else {
                method = 'GET';
            }
        }

        return {
            url: url,
            type: method,
            data_type: dataType,
            data: requestData,
            request_headers: headers,
            authentication: authentication,
            warnings: warnings
        };
    };

    this.parseHeader = function(content, headers) {
        if (!content || content[0] === '@') {
            throw new Error('Header files are not supported.');
        }
        let separator = content.indexOf(':');
        if (separator === -1 && /;$/.test(content)) {
            addHeader(headers, content.substr(0, content.length - 1).trim(), '');
            return;
        }
        if (separator <= 0) {
            throw new Error('Invalid header: ' + content + '.');
        }
        addHeader(headers, content.substr(0, separator).trim(), content.substr(separator + 1).trim());
    };

    this.parseUser = function(content, authentication) {
        let separator = content.indexOf(':');
        authentication.type = 'Basic';
        authentication.data = {
            user: separator === -1 ? content : content.substr(0, separator),
            pass: separator === -1 ? '' : content.substr(separator + 1)
        };
    };

    this.parseFormData = function(formArguments, warnings) {
        let result = {};
        for (let i = 0; i < formArguments.length; i++) {
            let content = formArguments[i]['value'],
                separator = content.indexOf('=');
            if (separator <= 0) {
                throw new Error('Invalid form field: ' + content + '.');
            }
            let key = content.substr(0, separator),
                value = content.substr(separator + 1),
                valueType = 'Text',
                description = '';
            if (!formArguments[i]['literal'] && (value[0] === '@' || value[0] === '<')) {
                let file = value.substr(1).split(';')[0];
                if (file.length > 1 && file[0] === '"' && file[file.length - 1] === '"') {
                    file = file.substr(1, file.length - 2);
                }
                value = '';
                valueType = 'File';
                description = 'Select file: ' + file;
                warnings.push('Select the local file for field "' + key + '" before sending.');
            } else if (value.length > 1 && value[0] === '"' && value[value.length - 1] === '"') {
                value = value.substr(1, value.length - 2);
            }
            addField(result, key, value, valueType, description, warnings);
        }
        return result;
    };

    this.generate = function(request) {
        request = request || {};
        if (!request['url']) {
            throw new Error('Enter an API URL before exporting.');
        }

        let method = (request['type'] || 'GET').toUpperCase(),
            headers = request['request_headers'] || {},
            authentication = request['authentication'] || {type: '', data: {}},
            dataType = request['data_type'] || 'form-data',
            data = request['data'] || {},
            options = ['--request ' + shellQuote(method)],
            warnings = [];

        for (let name in headers) {
            if (headers.hasOwnProperty(name)) {
                options.push('--header ' + shellQuote(name + ': ' + textValue(headers[name])));
            }
        }

        if (authentication['type'] === 'Basic' && authentication['data']) {
            options.push('--user ' + shellQuote(
                (authentication['data']['user'] || '') + ':' + (authentication['data']['pass'] || '')
            ));
        }

        if (dataType === 'raw') {
            let contentType = data['content_type'] || 'text/plain';
            if (!getHeader(headers, 'Content-Type')) {
                options.push('--header ' + shellQuote('Content-Type: ' + contentType));
            }
            if (data['data'] !== undefined && data['data'] !== '') {
                options.push('--data-raw ' + shellQuote(data['data']));
            }
        } else if (dataType === 'form-data-true') {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    let item = data[key] || {},
                        value = textValue(item);
                    if (item['value_type'] === 'File') {
                        let fileName = String(value).split(/[\\/]/).pop();
                        if (!fileName) {
                            fileName = '<select-file>';
                        }
                        value = '@' + fileName;
                        warnings.push('Update the local file path for field "' + key + '".');
                    }
                    options.push('--form ' + shellQuote(key + '=' + value));
                }
            }
        } else {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    options.push('--data-urlencode ' + shellQuote(key + '=' + textValue(data[key])));
                }
            }
        }

        options.push('--url ' + shellQuote(request['url']));
        return {
            command: 'curl \\\n  ' + options.join(' \\\n  '),
            warnings: warnings
        };
    };

    this.showImport = function() {
        if (Model.get('sending')) {
            self.module.common.notification('Wait for the current request to finish.', 'warring');
            return false;
        }
        self.module.common.module('Import cURL', self.view.getView('tools.curl', 'import_layout', {}), '');
        $('#curl-command').focus();
        return true;
    };

    this.showExport = function() {
        let state = self.module.form.capture_request(),
            result;
        try {
            result = this.generate(state['requestData']);
        } catch (error) {
            self.module.common.notification(error.message, 'danger');
            return false;
        }
        self.module.common.module('Export cURL', self.view.getView('tools.curl', 'export_layout', {}), '');
        $('#curl-export-command').val(result['command']).focus().select();
        if (result['warnings'].length > 0) {
            self.module.common.notification(result['warnings'].join(' '), 'warring');
        }
        return true;
    };

    this.apply = function(request) {
        let apiName = $.trim($('#api-name').val()),
            headersLineType = '';
        if (Object.keys(request.request_headers).length > 0) {
            headersLineType = 'Headers';
        } else if (request.authentication.type) {
            headersLineType = 'Authentication';
        } else if (request.url.indexOf('?') !== -1) {
            headersLineType = 'Params';
        }

        Model.set('requestData_form-data', {});
        Model.set('requestData_form-data-true', {});
        Model.set('requestData_raw', '');
        Model.set('requestData_' + request.data_type, request.data);
        Model.set('requestHeaders', request.request_headers);
        Model.set('authentication', request.authentication);
        Model.set('requestFormType', request.data_type);
        Model.set('requestFormTypeTmp', request.data_type);
        Model.set('requestData', {
            name: apiName,
            host: '',
            url: request.url,
            type: request.type,
            group_id: 0,
            data_type: request.data_type,
            request_headers: request.request_headers,
            authentication: request.authentication,
            headersLineType: headersLineType,
            params: {},
            data: request.data,
            status: 0,
            time: 0,
            response_content_type: '',
            headers: '',
            result: '',
            assertion_data: ''
        });
        Model.set('responseData', '');
        if (self.module.history && self.module.history.tabsReady) {
            self.module.history.saveActiveTabDraft();
        }
    };
});
