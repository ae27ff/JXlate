const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadApp } = require('./helpers');
const { context, ui, alerts } = loadApp();

ui.mode = ui.mode_bases.indexOf(10);
for (const action of ['action_xor', 'action_byteshift']) {
    for (const input of ['65junk 66', 'abc 65', '65 256', '-9007199254740991',
        '-' + '9'.repeat(309), '1.5', 'NaN', 'Infinity', '9'.repeat(309)]) {
        ui.setInputText(input);
        alerts.length = 0;
        vm.runInContext('jxlate.ui.toolbox.events.' + action + '()', context, { timeout: 1000 });
        assert.equal(ui.getInputText(), input, 'invalid source must remain intact');
        assert.equal(alerts.length, 1);
    }
}
ui.setInputText('0 65 255');
ui.toolbox.events.action_xor();
assert.equal(ui.getInputText(), '1 64 254');
ui.setInputText('0 65 255');
ui.toolbox.events.action_byteshift();
assert.equal(ui.getInputText(), '1 66 0');
for (const base of [2, 8, 16, 64]) {
    ui.mode = ui.mode_bases.indexOf(base);
    ui.setInputFromDatastring('\x00A\xff');
    ui.toolbox.events.action_xor();
    assert.equal(ui.getInputAsDatastring(), '\x01@\xfe');
}
ui.mode = 0;
ui.setInputText('\u20ac');
alerts.length = 0;
ui.toolbox.events.action_xor();
assert.equal(ui.getInputText(), '\u20ac');
assert.equal(alerts.length, 1);
ui.mode = ui.mode_bases.indexOf(10);
ui.setInputText('');
ui.toolbox.events.action_byteshift();
assert.equal(ui.getInputText(), '');
const modp = context.jxlate.util.modp;
assert.equal(modp(-9007199254740991, 256), 1);
assert.equal(modp(-1, 15), 14);
assert.equal(modp(16, 15), 1);
for (const pair of [[-Infinity, 256], [NaN, 256], [1, 0], [1, -1], [1, Infinity]])
    assert.throws(() => modp(...pair));
console.log('Byte edit regression tests passed');
