const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createResponseModule() {
    const App = {
        module: {
            extend(name, constructor) {
                constructor.prototype = App;
                this[name] = new constructor();
            }
        }
    };
    const Model = {default: {}};
    const context = vm.createContext({App, Model, console});
    vm.runInContext(
        fs.readFileSync(
            path.resolve(__dirname, '../scripts/module/response/module.js'),
            'utf8'
        ),
        context
    );
    return App.module.response;
}

test('renders JSON control characters as visible escape sequences', () => {
    const response = createResponseModule();
    const data = JSON.parse(
        '{"message":"line 1\\nline 2","tab":"left\\tright","return":"a\\rb"}'
    );
    const html = response.syntaxHighlightPro(data);

    assert.equal(html.includes('\n'), false);
    assert.match(html, /line 1\\nline 2/);
    assert.match(html, /left\\tright/);
    assert.match(html, /a\\rb/);
});

test('renders quotes, backslashes, and keys as valid escaped JSON text', () => {
    const response = createResponseModule();
    const html = response.syntaxHighlightPro({
        'key"<tag>': 'say "hello" from C:\\temp'
    });

    assert.match(html, /&quot;key\\&quot;&lt;tag&gt;&quot;: /);
    assert.match(html, /&quot;say \\&quot;hello\\&quot; from C:\\\\temp&quot;/);
    assert.doesNotMatch(html, /<tag>/);
});

test('renders a primitive JSON string without splitting it into characters', () => {
    const response = createResponseModule();
    const html = response.syntaxHighlightPro('line 1\nline 2');

    assert.equal((html.match(/code-value/g) || []).length, 1);
    assert.match(html, /&quot;line 1\\nline 2&quot;/);
    assert.equal(html.includes('\n'), false);
});
