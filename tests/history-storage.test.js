const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

class QuotaStorage {
    constructor() {
        this.data = new Map();
        this.quota = Infinity;
    }

    getItem(key) {
        return this.data.has(key) ? this.data.get(key) : null;
    }

    setItem(key, value) {
        value = String(value);
        let next = new Map(this.data);
        next.set(key, value);
        let size = 0;
        for (const [itemKey, itemValue] of next) {
            size += itemKey.length + itemValue.length;
        }
        if (size > this.quota) {
            let error = new Error('Storage quota exceeded');
            error.name = 'QuotaExceededError';
            throw error;
        }
        this.data = next;
    }

    removeItem(key) {
        this.data.delete(key);
    }

    used() {
        let size = 0;
        for (const [key, value] of this.data) {
            size += key.length + value.length;
        }
        return size;
    }

    dump() {
        return Object.fromEntries(this.data);
    }
}

function createHistory() {
    const localStorage = new QuotaStorage();
    const notifications = [];
    const loadedRequests = [];
    let capturedState = {
        requestData: {
            name: '',
            url: '',
            type: 'GET',
            data_type: 'form-data',
            data: {},
            request_headers: {},
            authentication: {type: '', data: {}}
        },
        responseData: ''
    };
    const App = {
        view: {
            display() {}
        },
        module: {
            common: {
                getHost(url) {
                    return url.split('/').slice(0, 3).join('/');
                },
                md5(value) {
                    return value;
                },
                notification(message, type) {
                    notifications.push({message, type});
                }
            },
            form: {
                get_empty_request() {
                    return {
                        name: '',
                        url: '',
                        type: 'GET',
                        data_type: 'form-data',
                        data: {},
                        request_headers: {},
                        authentication: {type: '', data: {}}
                    };
                },
                capture_request() {
                    return capturedState;
                },
                load_request(requestData, responseData) {
                    capturedState = {requestData, responseData};
                    loadedRequests.push(capturedState);
                }
            },
            extend(name, constructor) {
                constructor.prototype = App;
                this[name] = new constructor();
            }
        }
    };
    const context = vm.createContext({App, console, localStorage});
    const root = path.resolve(__dirname, '..');
    vm.runInContext(fs.readFileSync(path.join(root, 'scripts/model.js'), 'utf8'), context);
    vm.runInContext(
        fs.readFileSync(path.join(root, 'scripts/module/history/module.js'), 'utf8'),
        context
    );

    const history = App.module.history;
    history.renderHistoryList = function() {};
    return {
        history,
        localStorage,
        notifications,
        loadedRequests,
        setCapturedState(state) {
            capturedState = state;
        }
    };
}

function request(index, payloadSize = 80) {
    return {
        url: `https://host${index}.example/api`,
        type: 'GET',
        name: `request ${index}`,
        result: 'x'.repeat(payloadSize),
        assertion_data: {type: 'Json', content: `assertion ${index}`}
    };
}

function read(storage, key, fallback) {
    const value = storage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
}

test('quota cleanup evicts the oldest batch without leaving orphaned data', () => {
    const {history, localStorage} = createHistory();
    for (let i = 1; i <= 6; i++) {
        assert.equal(history.add(request(i)), true);
    }

    localStorage.quota = localStorage.used() + 20;
    assert.equal(history.add(request(7)), true);

    const list = read(localStorage, history.listKey, []);
    const data = read(localStorage, history.dataKey, {});
    const assertions = read(localStorage, history.assert_key, {});

    assert.deepEqual(list, [request(6).url, request(7).url]);
    assert.deepEqual(Object.keys(data), list);
    assert.deepEqual(Object.keys(assertions), list);
    assert.deepEqual(read(localStorage, history.hostCacheKey, []), [
        'https://host6.example',
        'https://host7.example'
    ]);
});

test('saving history repairs stale data that is missing from the order list', () => {
    const {history, localStorage} = createHistory();
    assert.equal(history.add(request(1)), true);

    const data = read(localStorage, history.dataKey, {});
    const assertions = read(localStorage, history.assert_key, {});
    data.orphan = request('orphan');
    assertions.orphan = {type: 'Json', content: 'orphan'};
    localStorage.setItem(history.dataKey, JSON.stringify(data));
    localStorage.setItem(history.assert_key, JSON.stringify(assertions));

    assert.equal(history.add(request(2)), true);
    const list = read(localStorage, history.listKey, []);
    assert.deepEqual(Object.keys(read(localStorage, history.dataKey, {})), list);
    assert.deepEqual(Object.keys(read(localStorage, history.assert_key, {})), list);
});

test('an oversized current record restores the previous history', () => {
    const {history, localStorage, notifications} = createHistory();
    assert.equal(history.add(request(1)), true);
    assert.equal(history.add(request(2)), true);

    const before = localStorage.dump();
    localStorage.quota = localStorage.used();

    assert.equal(history.add(request(3, localStorage.quota * 2)), false);
    assert.deepEqual(localStorage.dump(), before);
    assert.deepEqual(notifications, [{
        message: 'Unable to save history data.',
        type: 'danger'
    }]);
});

test('clearPre removes history, assertions, and hosts for the oldest five records', () => {
    const {history, localStorage} = createHistory();
    for (let i = 1; i <= 7; i++) {
        assert.equal(history.add(request(i)), true);
    }

    assert.equal(history.clearPre(), true);
    const list = read(localStorage, history.listKey, []);
    assert.deepEqual(list, [request(6).url, request(7).url]);
    assert.deepEqual(Object.keys(read(localStorage, history.dataKey, {})), list);
    assert.deepEqual(Object.keys(read(localStorage, history.assert_key, {})), list);
    assert.deepEqual(read(localStorage, history.hostCacheKey, []), [
        'https://host6.example',
        'https://host7.example'
    ]);
});

test('tabs preserve draft edits while switching between request histories', () => {
    const context = createHistory();
    const {history, loadedRequests} = context;
    assert.equal(history.add(request(1)), true);
    assert.equal(history.add(request(2)), true);

    history.initTabs();
    history.restoreTabs();
    const draftKey = history.activeTabKey;
    assert.match(draftKey, /^draft-/);

    const draftState = {
        requestData: {
            name: 'Unsaved draft',
            url: 'https://draft.example/api',
            type: 'PATCH',
            data_type: 'raw',
            data: {content_type: 'application/json', data: '{}'},
            request_headers: {},
            authentication: {type: '', data: {}}
        },
        responseData: ''
    };
    context.setCapturedState(draftState);

    assert.equal(history.openTab(request(1).url), true);
    assert.equal(history.activeTabKey, request(1).url);
    assert.equal(history.activateTab(draftKey), true);
    assert.equal(history.activeTabKey, draftKey);
    assert.deepEqual(loadedRequests[loadedRequests.length - 1], draftState);
});

test('closing the active tab selects its neighbor and keeps one new request tab', () => {
    const {history} = createHistory();
    history.initTabs();
    history.restoreTabs();
    const firstKey = history.activeTabKey;
    const secondKey = history.newTab();

    assert.equal(history.closeTab(secondKey), true);
    assert.equal(history.activeTabKey, firstKey);
    assert.equal(history.closeTab(firstKey), true);
    assert.equal(history.tabs.length, 1);
    assert.match(history.activeTabKey, /^draft-/);
});

test('saving a draft replaces it with the persisted history tab', () => {
    const {history} = createHistory();
    history.initTabs();
    history.restoreTabs();
    const draftKey = history.activeTabKey;

    assert.equal(history.add(request(9)), true);
    assert.equal(history.activeTabKey, request(9).url);
    assert.equal(history.hasTab(draftKey), false);
    assert.equal(history.hasTab(request(9).url), true);
    assert.equal(history.tabs[history.getTabIndex(request(9).url)].draft, false);
});

test('saving a duplicate URL preserves unsaved edits from the existing tab', () => {
    const context = createHistory();
    const {history} = context;
    assert.equal(history.add(request(1)), true);
    history.initTabs();
    history.restoreTabs();
    history.openTab(request(1).url);

    const editedState = {
        requestData: Object.assign({}, request(1), {name: 'Unsaved existing edit'}),
        responseData: ''
    };
    context.setCapturedState(editedState);
    history.newTab();

    assert.equal(history.add(Object.assign({}, request(1), {name: 'New saved request'})), true);
    const preservedTabs = history.tabs.filter(tab => tab.draft && tab.name === 'Unsaved existing edit');
    assert.equal(preservedTabs.length, 1);
    assert.equal(history.activeTabKey, request(1).url);
});
