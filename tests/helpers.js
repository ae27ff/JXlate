// Regression harness using only Node's built-in modules. No browser init runs.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
function loadApp() {
    const alerts = [];
    const context = vm.createContext({
        console: { log() {}, error() {} },
        alert: message => alerts.push(message),
        prompt: () => '1',
        atob, btoa,
        document: { readyState: 'loading', addEventListener() {} }
    });
    for (const file of ['core', 'util', 'lib/unicode', 'lib/base32',
        'lib/ascii85', 'lib/text-buffer', 'formatter', 'translator', 'ui', 'toolbox']) {
        vm.runInContext(fs.readFileSync(path.join(root, 'js', file + '.js'), 'utf8'), context);
    }
    context.jxlate.translator.init();
    // Model the textarea API's CR/CRLF -> LF normalization.
    let value = '';
    context.jxlate.ui.textarea = {
        get value() { return value; },
        set value(text) { value = String(text).replace(/\r\n?/g, '\n'); },
        selectionStart: 0,
        selectionEnd: 0
    };
    context.jxlate.ui.toolbox.textarea = context.jxlate.ui.textarea;
    return { context, ui: context.jxlate.ui, alerts };
}

module.exports = { loadApp, root };
