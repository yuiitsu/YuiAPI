const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadViews() {
    const $ = function(argument) {
        if (typeof argument === 'function') {
            return;
        }
        return {
            append() {},
            html() {}
        };
    };
    const context = vm.createContext({$, console});
    const root = path.resolve(__dirname, '..');
    vm.runInContext(
        fs.readFileSync(path.join(root, 'scripts/app.js'), 'utf8') + '\nthis.AppRef = App;',
        context
    );
    vm.runInContext(fs.readFileSync(path.join(root, 'scripts/module/form/view.js'), 'utf8'), context);
    vm.runInContext(
        fs.readFileSync(path.join(root, 'scripts/module/tools/curl/view.js'), 'utf8'),
        context
    );
    return context.AppRef.view;
}

test('renders one cURL export button beside the API name', () => {
    const view = loadViews();
    const html = view.getView('form', 'layout', {
        name: 'Users',
        url: 'https://api.example.com/users',
        type: 'POST',
        data_type: 'raw',
        data: {content_type: 'application/json', data: '{}'},
        request_headers: {},
        requestHeaders: {},
        authentication: {type: '', data: {}},
        urlParams: {list: []}
    });

    assert.equal((html.match(/id="curl-export-button"/g) || []).length, 1);
    assert.match(html, /> export\s*<\/button>/);
    assert.ok(html.indexOf('id="api-name"') < html.indexOf('id="curl-export-button"'));
    assert.ok(html.indexOf('id="curl-export-button"') < html.indexOf('form-url-line'));
});

test('renders imported custom methods and raw content types', () => {
    const view = loadViews();
    const html = view.getView('form', 'layout', {
        name: '',
        url: 'https://api.example.com/resource',
        type: 'PROPFIND',
        data_type: 'raw',
        data: {content_type: 'application/graphql', data: 'query { viewer { id } }'},
        request_headers: {},
        requestHeaders: {},
        authentication: {type: '', data: {}},
        urlParams: {list: []}
    });

    assert.match(html, /<option value="PROPFIND" selected="selected">PROPFIND<\/option>/);
    assert.match(html, /<option value="application\/graphql" selected="selected">/);
});

test('renders the cURL-only import and export dialogs', () => {
    const view = loadViews();
    const importHtml = view.getView('tools.curl', 'import_layout', {});
    const exportHtml = view.getView('tools.curl', 'export_layout', {});
    assert.match(importHtml, /id="curl-command"/);
    assert.match(importHtml, /id="curl-import"/);
    assert.match(exportHtml, /id="curl-export-command"/);
    assert.match(exportHtml, /id="curl-export-copy"/);
});
