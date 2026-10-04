const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadApp, root } = require('./helpers');

const { context } = loadApp();
// RFC 4648 allows decoders to ignore unused bits, preserving forgiving input.
for (const equivalent of ['MZ======', 'MZ'])
    assert.equal(context.base32rfc.decode(equivalent), 'f');
assert.equal(context.base32rfc.decode('MY======'), 'f');
assert.equal(context.base32rfc.decode('MY'), 'f');
assert.equal(context.base32ckr.encode('f'), 'CR');
assert.equal(context.base32ckr.decode('CR'), 'f');
const legacyVectors = [
    ['', ''], ['f', 'CR======'], ['fo', 'CSQG===='],
    ['foo', 'CSQPY==='], ['foob', 'CSQPYRG='],
    ['fooba', 'CSQPYRK1'], ['foobar', 'CSQPYRK1E8======']
];
for (const [text, padded] of legacyVectors) {
    assert.equal(context.base32ckr.encode(text), padded.replace(/=+$/, ''));
    assert.equal(context.base32ckr.decode(padded), text);
    assert.equal(context.jxlate.ui.convertText(padded, '32c', 256), text);
    assert.equal(context.jxlate.ui.convertText(padded.replace(/=+$/, ''), '32c', 256), text);
}
for (const invalid of ['C', 'CR=', 'CR=======', 'CR======!', 'CR=ABCDE', 'CSQPYRK1='])
    assert.throws(() => context.base32ckr.decode(invalid));
assert.equal(context.jxlate.ui.convertText('c-r', '32c', 256), 'f');
assert.equal(context.jxlate.ui.convertText('O0', '32c', 256), '\x00');
assert.equal(context.jxlate.ui.convertText('i0', '32c', 256), '\x08');
assert.equal(context.jxlate.ui.convertText('l0', '32c', 256), '\x08');

const options = {
    dataBits: 8,
    codeBits: 5,
    keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    arrayData: true
};
for (const pad of [null, false, 0])
    assert.throws(() => new context.Nibbler({ ...options, pad }));
for (const omitPadding of [null, 0, 1, '', 'true'])
    assert.throws(() => new context.Nibbler({ ...options, omitPadding }));
const unpadded = new context.Nibbler({ ...options, pad: '=', omitPadding: true });
const padded = new context.Nibbler({ ...options, pad: '=', omitPadding: false });
assert.equal(unpadded.encode([102]), 'MY');
assert.equal(padded.encode([102]), 'MY======');
assert.deepEqual(Array.from(unpadded.decode('MY======')), [102]);
assert.deepEqual(Array.from(unpadded.decode('MY')), [102]);

context.document.getElementById = () => ({});
const shiftsScript = fs.readFileSync(path.join(root, 'shifts.html'), 'utf8')
    .match(/<script>([\s\S]*?)<\/script>/)[1];
vm.runInContext(shiftsScript, context);
assert.equal(context.StringUtils.filterPrintable('A\r\n~'), true);
assert.equal(context.StringUtils.filterPrintable('A\x00'), false);

const liteCss = fs.readFileSync(path.join(root, 'css/lite.css'), 'utf8');
// Static rule coverage; the VM harness does not render CSS layout.
assert.match(liteCss, /#text\s*\{[^}]*height\s*:\s*90vh\s*;/s);

console.log('Final review regression tests passed');
