const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createForm() {
    const values = {
        '#api-name': 'Draft API',
        '#request-url': 'https://draft.example/api',
        '#request-type': 'PATCH',
        '#raw-content-type': 'application/json',
        '#form-data-raw-textarea': '{"draft":true}'
    };
    const $ = function(selector) {
        return {
            text() {
                return selector === '.form-request-headers-tab.bg-level-0' ? 'Headers' : '';
            },
            val() {
                return values[selector] || '';
            }
        };
    };
    $.trim = value => String(value || '').trim();

    const App = {
        view: {display() {}},
        module: {
            common: {
                get_url_params() {
                    return [];
                }
            },
            history: {restoreTabs() {}},
            extend(name, constructor) {
                constructor.prototype = App;
                this[name] = new constructor();
            }
        }
    };
    const localStorage = {getItem() { return null; }};
    const context = vm.createContext({App, $, console, localStorage});
    const root = path.resolve(__dirname, '..');
    vm.runInContext(
        fs.readFileSync(path.join(root, 'scripts/model.js'), 'utf8') + '\nthis.ModelRef = Model;',
        context
    );
    vm.runInContext(
        fs.readFileSync(path.join(root, 'scripts/module/form/module.js'), 'utf8'),
        context
    );
    return {form: App.module.form, Model: context.ModelRef};
}

function plain(value) {
    return JSON.parse(JSON.stringify(value));
}

test('loads a request into every form model used by rendering and sending', () => {
    const {form, Model} = createForm();
    const request = {
        name: 'Create user',
        url: 'https://api.example.com/users',
        type: 'POST',
        data_type: 'raw',
        data: {content_type: 'application/json', data: '{}'},
        request_headers: {
            Accept: {value: 'application/json', value_type: 'Text', description: ''}
        },
        authentication: {type: 'Basic', data: {user: 'a', pass: 'b'}}
    };

    form.load_request(request, {status: 200});
    assert.equal(Model.get('requestFormType'), 'raw');
    assert.deepEqual(plain(Model.get('requestData_raw')), request.data);
    assert.deepEqual(plain(Model.get('requestHeaders')), request.request_headers);
    assert.deepEqual(plain(Model.get('authentication')), request.authentication);
    assert.equal(Model.get('responseData').status, 200);
});

test('captures raw body and direct form values for a tab draft', () => {
    const {form, Model} = createForm();
    Model.set('requestData', form.get_empty_request());
    Model.set('requestFormType', 'raw');
    Model.set('requestHeaders', {});
    Model.set('authentication', {type: '', data: {}});
    Model.set('responseData', {status: 202});
    form.get_headers_params = function() {};

    const state = form.capture_request();
    assert.equal(state.requestData.name, 'Draft API');
    assert.equal(state.requestData.url, 'https://draft.example/api');
    assert.equal(state.requestData.type, 'PATCH');
    assert.deepEqual(plain(state.requestData.data), {
        content_type: 'application/json',
        data: '{"draft":true}'
    });
    assert.equal(state.responseData.status, 202);
});
