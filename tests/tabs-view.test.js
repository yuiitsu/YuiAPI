const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadHistoryView() {
    const $ = function(argument) {
        if (typeof argument === 'function') {
            return;
        }
        return {append() {}, html() {}};
    };
    const context = vm.createContext({$, console});
    const root = path.resolve(__dirname, '..');
    vm.runInContext(
        fs.readFileSync(path.join(root, 'scripts/app.js'), 'utf8') + '\nthis.AppRef = App;',
        context
    );
    vm.runInContext(
        fs.readFileSync(path.join(root, 'scripts/module/history/view.js'), 'utf8'),
        context
    );
    return context.AppRef.view;
}

test('renders active, inactive, close, and new request tab controls', () => {
    const view = loadHistoryView();
    const html = view.getView('history', 'history_tab', {
        activeKey: 'one',
        list: [
            {key: 'one', name: 'Users', url: 'https://api.example.com/users', type: 'GET'},
            {key: 'draft-1', name: '', url: '', type: 'POST', draft: true}
        ]
    });

    assert.equal((html.match(/history-tab-item/g) || []).length, 2);
    assert.match(html, /history-tab-item display-flex-row active/);
    assert.match(html, /title="https:\/\/api\.example\.com\/users">/);
    assert.match(html, /title="New Request">/);
    assert.match(html, /New Request/);
    assert.equal((html.match(/history-tab-close/g) || []).length, 2);
    assert.equal((html.match(/history-tab-new/g) || []).length, 1);
    assert.equal((html.match(/history-tab-import/g) || []).length, 1);
    assert.ok(html.indexOf('history-tab-new') < html.indexOf('history-tab-import'));
    assert.match(html, />import<\/span>/);
});

test('removes the tabbar placeholder from the application shell', () => {
    const index = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    assert.match(index, /<div id="tabbar" class="tabbar-container display-flex-auto"><\/div>/);
    assert.doesNotMatch(index, />123<\/div>/);
});
