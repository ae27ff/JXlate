const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadApp, root } = require('./helpers');
const { context, alerts } = loadApp();
const fields = { txt: { value: '' }, dec: { value: 'old decimal' }, hex: { value: 'old hex' } };
context.document.getElementById = id => fields[id];
const script = fs.readFileSync(path.join(root, 'shifts.html'), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
vm.runInContext(script, context);
let reports = [];
const tool = context.ShiftsTool;
tool.report_op_from_select = text => reports.push(text);
for (const invalid of ['\u20ac', 'A\u0100B', '\ud83d\ude00', '\ud800']) {
    fields.txt.value = invalid;
    alerts.length = 0;
    tool.report_txt();
    assert.equal(alerts.length, 1);
    assert.equal(reports.length, 0);
    assert.equal(fields.txt.value, invalid);
    assert.equal(fields.dec.value, 'old decimal');
    assert.equal(fields.hex.value, 'old hex');
}
const bytes = Array.from({ length: 256 }, (_, i) => String.fromCharCode(i)).join('');
fields.txt.value = bytes;
tool.report_txt();
assert.equal(reports[0], bytes);
assert.equal(fields.dec.value, Array.from({ length: 256 }, (_, i) => i).join(' '));
assert.equal(fields.hex.value, Buffer.from(bytes, 'latin1').toString('hex').match(/../g).join(' '));
for (const id of ['bshift', 'cxor', 'bbshift', 'brotate', 'sbrotate']) {
    const op = tool.operations.find(op => op.id === id);
    const result = op.funcType === context.OperationTypes.CHAR_FUNCTION
        ? context.StringUtils.applyCharFunction(bytes, op.apply, 0)
        : context.StringUtils.applyStrFunction(bytes, op.apply, 0);
    assert.equal(result, bytes, id + ' with key zero must be an identity');
}
reports = [];
fields.txt.value = '';
tool.report_txt();
assert.equal(reports[0], '');
// Explicit UTF-8 bytes remain supported through decimal/hex input.
fields.dec.value = '226 130 172';
tool.report_dec();
assert.equal(reports[1], '\xe2\x82\xac');
fields.hex.value = 'e2 82 ac';
tool.report_hex();
assert.equal(reports[2], '\xe2\x82\xac');
for (const length of [8191, 8192, 8193, 200000]) {
    const codes = Array.from({ length }, (_, i) => String((i * 73) % 256));
    const expected = Buffer.from(codes.map(Number)).toString('latin1');
    assert.equal(context.StringUtils.fromCharCodes(codes), expected);
    for (const value of codes) assert.equal(typeof value, 'number');
}
const largeBytes = Buffer.from(Array.from({ length: 200000 }, (_, i) => (i * 73) % 256));
const largeText = largeBytes.toString('latin1');
reports = [];
fields.txt.value = largeText;
tool.report_txt();
assert.equal(reports[0], largeText);
fields.dec.value = Array.from(largeBytes).join(' ');
tool.report_dec();
assert.equal(reports[1], largeText);
fields.hex.value = largeBytes.toString('hex');
tool.report_hex();
assert.equal(reports[2], largeText);
const rotation = tool.operations.find(op => op.id === 'sbrotate');
assert.equal(context.StringUtils.applyStrFunction(largeText, rotation.apply, 0), largeText);
console.log('Shifts text regression tests passed');
