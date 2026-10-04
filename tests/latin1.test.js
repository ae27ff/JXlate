const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');
const { ui, context } = loadApp();
const translator = context.jxlate.translator;
const bases = [256, 2, 8, 10, 16, '32r', '32h', '32c', 64, 85, 'ue', 'ucs2', 'utf8'];
for (const text of ['\u0100', '\u20ac', 'A\u20ac', '\ud83d\ude00', '\ud800']) {
    for (const base of bases)
        assert.throws(() => ui.convertText(text, 256, base), undefined, 'Latin-1 must reject non-byte input for ' + base);
    assert.throws(() => translator.base2base(text, 256, 256));
}
for (const invalid of ['', 'AB', 65])
    assert.throws(() => translator.numeral2dec(invalid, 256));
const bytes = Buffer.from(Array.from({ length: 256 }, (_, i) => i)).toString('latin1');
for (const base of [256, 2, 8, 10, 16, '32r', '32h', '32c', 64, 85, 'ue']) {
    const encoded = ui.convertText(bytes, 256, base);
    assert.equal(ui.convertText(encoded, base, 256), bytes);
}
assert.equal(ui.convertText('\u20ac', 'utf8', 16), 'E2 82 AC');
assert.equal(ui.convertText('E2 82 AC', 16, 'utf8'), '\u20ac');
assert.equal(ui.convertText('\u20ac', 'ucs2', 16), '20AC');
assert.equal(ui.convertText('20 AC', 16, 'ucs2'), '\u20ac');
// UCS-2 must serialize its own code units, rather than treating them as Latin-1.
const allUnits = Array.from({ length: 65536 }, (_, i) => String.fromCharCode(i)).join('');
const serialized = context.ucs2_to_iso88591(allUnits);
const reference = Buffer.alloc(2 * allUnits.length);
for (let i = 0; i < allUnits.length; i++) reference.writeUInt16BE(i, i * 2);
assert.equal(serialized, reference.toString('latin1'));
assert.equal(context.iso88591_to_ucs2(serialized), allUnits);
console.log('Latin-1 validation and UCS-2 reference tests passed');
