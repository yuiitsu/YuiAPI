const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createParser() {
    const values = {};
    const Model = {
        set(key, value) {
            values[key] = value;
            return this;
        }
    };
    const $ = function(selector) {
        return {
            val() {
                return selector === '#api-name' ? 'Existing API name' : '';
            }
        };
    };
    $.trim = function(value) {
        return String(value).trim();
    };
    const App = {
        module: {
            extend(name, constructor) {
                constructor.prototype = App;
                this[name] = new constructor();
            }
        }
    };
    const context = vm.createContext({App, console, Model, $});
    const source = fs.readFileSync(
        path.resolve(__dirname, '../scripts/module/tools/curl/module.js'),
        'utf8'
    );
    vm.runInContext(source, context);
    return {parser: App.module['tools.curl'], values};
}

function plain(value) {
    return JSON.parse(JSON.stringify(value));
}

test('parses a Chrome-style JSON request', () => {
    const {parser} = createParser();
    const result = parser.parse(`curl 'https://api.example.com/users?active=1' \\
        -X POST \\
        -H 'Accept: application/json' \\
        -H 'Content-Type: application/json' \\
        -H 'X-Trace: one:two' \\
        --data-raw '{"name":"Yui API","enabled":true}'`);

    assert.equal(result.url, 'https://api.example.com/users?active=1');
    assert.equal(result.type, 'POST');
    assert.equal(result.data_type, 'raw');
    assert.deepEqual(plain(result.data), {
        content_type: 'application/json',
        data: '{"name":"Yui API","enabled":true}'
    });
    assert.equal(result.request_headers['X-Trace'].value, 'one:two');
});

test('maps urlencoded data into editable form fields', () => {
    const {parser} = createParser();
    const result = parser.parse(
        "curl https://api.example.com/search -d 'q=hello+world' --data-urlencode 'page=two words'"
    );

    assert.equal(result.type, 'POST');
    assert.equal(result.data_type, 'form-data');
    assert.deepEqual(plain(result.data), {
        q: {value: 'hello world', value_type: 'Text', description: ''},
        page: {value: 'two words', value_type: 'Text', description: ''}
    });
});

test('moves data to the URL for GET requests', () => {
    const {parser} = createParser();
    const result = parser.parse(
        "curl -G --data-urlencode 'q=hello world' -d 'page=2' 'https://api.example.com/search?sort=asc'"
    );

    assert.equal(result.type, 'GET');
    assert.equal(
        result.url,
        'https://api.example.com/search?sort=asc&q=hello%20world&page=2'
    );
    assert.deepEqual(plain(result.data), {});
});

test('moves data to the URL for HEAD requests', () => {
    const {parser} = createParser();
    const result = parser.parse("curl -I -d 'check=1' https://api.example.com/health");
    assert.equal(result.type, 'HEAD');
    assert.equal(result.url, 'https://api.example.com/health?check=1');
    assert.deepEqual(plain(result.data), {});
});

test('parses multipart fields, file placeholders, and Basic authentication', () => {
    const {parser} = createParser();
    const result = parser.parse(
        "curl -u 'user:p:ss' -F 'name=\"avatar\"' -F 'file=@\"/tmp/avatar.png\";type=image/png' " +
        "-H 'Content-Type: multipart/form-data' https://upload.example.com"
    );

    assert.equal(result.type, 'POST');
    assert.equal(result.data_type, 'form-data-true');
    assert.deepEqual(plain(result.authentication), {
        type: 'Basic',
        data: {user: 'user', pass: 'p:ss'}
    });
    assert.deepEqual(plain(result.data), {
        name: {value: 'avatar', value_type: 'Text', description: ''},
        file: {
            value: '',
            value_type: 'File',
            description: 'Select file: /tmp/avatar.png'
        }
    });
    assert.equal(result.request_headers.hasOwnProperty('Content-Type'), false);
    assert.equal(result.warnings.length, 1);
});

test('supports ANSI-C quoted content and custom methods', () => {
    const {parser} = createParser();
    const result = parser.parse(
        "curl --request=PROPFIND --data-binary $'line 1\\nline 2' https://api.example.com/resource"
    );

    assert.equal(result.type, 'PROPFIND');
    assert.equal(result.data_type, 'raw');
    assert.equal(result.data.data, 'line 1\nline 2');
});

test('reports unsupported options and malformed commands', () => {
    const {parser} = createParser();
    assert.throws(() => parser.parse('wget https://example.com'), /start with curl/);
    assert.throws(() => parser.parse('curl --upload-file file.txt https://example.com'), /Unsupported/);
    assert.throws(() => parser.parse("curl 'https://example.com"), /unclosed quote/);
});

test('applies parsed data to the existing request model', () => {
    const {parser, values} = createParser();
    const request = parser.parse(
        "curl -X PATCH -H 'Content-Type: application/json' " +
        "--data-raw '{\"enabled\":true}' https://api.example.com/users/1"
    );

    parser.apply(request);
    assert.equal(values.requestFormType, 'raw');
    assert.deepEqual(plain(values.requestData_raw), {
        content_type: 'application/json',
        data: '{"enabled":true}'
    });
    assert.equal(values.requestData.name, 'Existing API name');
    assert.equal(values.requestData.url, 'https://api.example.com/users/1');
    assert.equal(values.requestData.type, 'PATCH');
    assert.equal(values.requestData.headersLineType, 'Headers');
});

test('exports raw requests as an importable cURL command', () => {
    const {parser} = createParser();
    const exported = parser.generate({
        url: 'https://api.example.com/users/1?expand=roles',
        type: 'PATCH',
        data_type: 'raw',
        data: {content_type: 'application/json', data: '{"name":"O\'Reilly"}'},
        request_headers: {
            Accept: {value: 'application/json', value_type: 'Text', description: ''}
        },
        authentication: {type: 'Basic', data: {user: 'api', pass: 'secret'}}
    });
    const imported = parser.parse(exported.command);

    assert.match(exported.command, /^curl \\\n/);
    assert.equal(imported.url, 'https://api.example.com/users/1?expand=roles');
    assert.equal(imported.type, 'PATCH');
    assert.equal(imported.data_type, 'raw');
    assert.equal(imported.data.data, '{"name":"O\'Reilly"}');
    assert.equal(imported.request_headers.Accept.value, 'application/json');
    assert.deepEqual(plain(imported.authentication), {
        type: 'Basic',
        data: {user: 'api', pass: 'secret'}
    });
});

test('exports urlencoded and multipart request fields', () => {
    const {parser} = createParser();
    const urlencoded = parser.generate({
        url: 'https://api.example.com/search',
        type: 'POST',
        data_type: 'form-data',
        data: {
            q: {value: 'hello world', value_type: 'Text', description: ''}
        }
    });
    const multipart = parser.generate({
        url: 'https://api.example.com/upload',
        type: 'POST',
        data_type: 'form-data-true',
        data: {
            name: {value: 'avatar', value_type: 'Text', description: ''},
            file: {value: 'C:\\fakepath\\avatar.png', value_type: 'File', description: ''}
        }
    });

    assert.match(urlencoded.command, /--data-urlencode 'q=hello world'/);
    assert.match(multipart.command, /--form 'name=avatar'/);
    assert.match(multipart.command, /--form 'file=@avatar\.png'/);
    assert.equal(multipart.warnings.length, 1);
});

test('requires a URL before exporting', () => {
    const {parser} = createParser();
    assert.throws(() => parser.generate({type: 'GET'}), /API URL/);
});
