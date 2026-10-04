const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');
const { ui, alerts } = loadApp();
for (const base of [256, 'utf8', 'ucs2']) {
    ui.mode = ui.mode_bases.indexOf(base);
    for (const input of ['A\r\nB', 'A\rB\nC\r\nD', '', '\x00\xff']) {
        ui.setInputText(input);
        alerts.length = 0;
        ui.toolbox.events.action_length();
        assert.equal(alerts[0], 'Total length: ' + input.length);
    }
}
ui.mode = ui.mode_bases.indexOf(2);
ui.setInputText('00000000 11111111');
alerts.length = 0;
ui.toolbox.events.action_length();
assert.equal(alerts[0], 'Total length: 17\nBit length: 16\nBytes: 2');
ui.mode = ui.mode_bases.indexOf(16);
ui.setInputText('00 FF');
alerts.length = 0;
ui.toolbox.events.action_length();
assert.equal(alerts[0], 'Total length: 5\nDigits: 4 (nibbles)\nBytes: 2');
// Length and whitespace removal must agree with converters for every JS
// whitespace character, including vertical tab, NBSP and Unicode separators.
for (let code = 0; code <= 0xffff; code++) {
    const separator = String.fromCharCode(code);
    if (!/\s/.test(separator)) continue;
    for (const [base, first, second, expected] of [
        [2, '00000000', '11111111', 'Bit length: 16\nBytes: 2'],
        [16, '00', 'FF', 'Digits: 4 (nibbles)\nBytes: 2']
    ]) {
        ui.mode = ui.mode_bases.indexOf(base);
        ui.setInputText(first + separator + second);
        assert.equal(ui.getInputAsDatastring(), '\x00\xff');
        alerts.length = 0;
        ui.toolbox.events.action_length();
        assert.equal(alerts[0], 'Total length: ' + (first.length + second.length + 1) + '\n' + expected);
        ui.toolbox.events.action_stripspaces();
        assert.equal(ui.getInputText(), first + second);
    }
}
console.log('Length regression tests passed');
