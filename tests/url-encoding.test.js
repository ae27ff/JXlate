const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');
const { ui, context } = loadApp();
assert.equal(ui.convertText('a/b@c+? #&=', 256, 'ue'), 'a%2Fb%40c%2B%3F%20%23%26%3D');
assert.equal(ui.convertText('AZaz09-._~', 256, 'ue'), 'AZaz09-._~');
for (let byte = 0; byte < 256; byte++) {
    const character = String.fromCharCode(byte);
    const expected = /[A-Za-z0-9._~-]/.test(character)
        ? character : '%' + byte.toString(16).toUpperCase().padStart(2, '0');
    const encoded = ui.convertText(character, 256, 'ue');
    assert.equal(encoded, expected);
    assert.equal(ui.convertText(encoded, 'ue', 256), character);
    if (byte < 128) {
        const reference = encodeURIComponent(character).replace(/[!'()*]/g,
            c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
        assert.equal(encoded, reference);
    }
}
for (const text of ['\u20ac', '\u00e9', '\ud83d\ude00', 'a/b@c ?#', '\x00\r\n']) {
    const encoded = ui.convertText(text, 'utf8', 'ue');
    assert.equal(encoded, encodeURIComponent(text).replace(/[!'()*]/g,
        c => '%' + c.charCodeAt(0).toString(16).toUpperCase()));
    assert.equal(decodeURIComponent(encoded), text);
    assert.equal(ui.convertText(encoded, 'ue', 'utf8'), text);
    const ucs2Encoded = ui.convertText(text, 'ucs2', 'ue');
    assert.equal(ui.convertText(ucs2Encoded, 'ue', 'ucs2'), text);
}
assert.throws(() => context.jxlate.translator.urlencode('\u20ac'));
const encodedPath = ui.convertText('a/b?c#d@e', 256, 'ue');
const url = new URL('https://example.test/' + encodedPath);
assert.equal(url.pathname, '/' + encodedPath);
assert.equal(url.search, '');
assert.equal(url.hash, '');
console.log('URL byte encoding regression/reference tests passed');
