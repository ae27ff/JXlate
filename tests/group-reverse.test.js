const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');
const { ui } = loadApp();

for (const [base, input, expected] of [
    [16, '01\n02', '10\n20'],
    [16, '\t01 \n02\u00a0AF  ', '\t10 \n20\u00a0FA  '],
    [10, '12\t345\n67', '21\t543\n76'],
    [8, '12  34', '21  43'],
    [2, '00110000\n00000001', '00001100\n10000000'],
    [16, '', ''],
    [16, ' \t\n\u00a0', ' \t\n\u00a0'],
    [16, '01', '10']
]) {
    ui.mode = ui.mode_bases.indexOf(base);
    ui.setInputText(input);
    ui.toolbox.events.action_greverse();
    assert.equal(ui.getInputText(), expected);
}
ui.mode = ui.mode_bases.indexOf(16);
for (let code = 0; code <= 0xffff; code++) {
    const separator = String.fromCharCode(code);
    if (!/\s/.test(separator)) continue;
    ui.setInputText('01' + separator + '02');
    const displayedSeparator = ui.textarea.value.slice(2, 3);
    ui.toolbox.events.action_greverse();
    assert.equal(ui.getInputText(), '10' + displayedSeparator + '20');
    assert.equal(ui.getInputAsDatastring(), '\x10\x20');
    ui.toolbox.events.action_greverse();
    assert.equal(ui.getInputAsDatastring(), '\x01\x02');
}
console.log('Group reverse regression tests passed');
