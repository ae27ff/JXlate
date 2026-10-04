const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');
const { context, ui } = loadApp();
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64 = new context.Nibbler({ dataBits: 8, codeBits: 6, keyString: alphabet, pad: '=' });
const base64_7bit = new context.Nibbler({ dataBits: 7, codeBits: 6, keyString: alphabet, pad: '=' });
assert.equal(base64.encode('f'), 'Zg==');
assert.equal(base64.decode('Zg=='), 'f');
assert.equal(base64_7bit.encode('Hello, World!'), 'kZdmzesQV9/LZkQg=====');
assert.equal(base64_7bit.decode('kZdmzesQV9/LZkQg====='), 'Hello, World!');
const vectors = ['', 'f', 'fo', 'foo', 'foob', 'fooba', 'foobar'];
const base32Expected = ['', 'MY======', 'MZXQ====', 'MZXW6===', 'MZXW6YQ=', 'MZXW6YTB', 'MZXW6YTBOI======'];
for (let i = 0; i < vectors.length; i++) {
    assert.equal(context.base32rfc.encode(vectors[i]), base32Expected[i]);
    assert.equal(context.base32rfc.decode(base32Expected[i]), vectors[i]);
}
for (const codec of [context.base32rfc, context.base32hex, context.base32ckr]) {
    const f = codec.encode('f').slice(0, 2);
    for (const invalid of [f + '=ABCDE', f + '=====!', f + '=', f + '=======',
        f.slice(0, 1), f + f.slice(0, 1), f.repeat(3), codec.encode('fooba') + '='])
        assert.throws(() => codec.decode(invalid));
}
for (const invalid of ['Z', 'Zg=', 'Zg===', 'Zg=A', 'Zg==!', 'Zm9v='])
    assert.throws(() => base64.decode(invalid));
for (let length = 0; length < 128; length++) {
    const bytes = Buffer.from(Array.from({ length }, (_, i) => (i * 73 + length * 19) % 256));
    const text = bytes.toString('latin1');
    const expected = bytes.toString('base64');
    assert.equal(base64.encode(text), expected);
    for (const codec of [base64, context.base32rfc, context.base32hex, context.base32ckr]) {
        const encoded = codec.encode(text);
        assert.equal(codec.decode(encoded), text);
        assert.equal(codec.decode(encoded.replace(/=+$/, '')), text);
    }
    const ascii7 = Array.from(bytes, byte => String.fromCharCode(byte & 127)).join('');
    const encoded7 = base64_7bit.encode(ascii7);
    assert.equal(base64_7bit.decode(encoded7), ascii7);
    assert.equal(base64_7bit.decode(encoded7.replace(/=+$/, '')), ascii7);
    // The main UI's separate Base64 path also keeps accepting unpadded input
    // and whitespace as before, and matches Node's reference encoder.
    assert.equal(ui.convertText(text, 256, 64), expected);
    assert.equal(ui.convertText(expected.replace(/=+$/, ''), 64, 256), text);
    assert.equal(ui.convertText(expected.split('').join(' \n'), 64, 256), text);
}
console.log('Nibbler and Base64 regression/reference tests passed');
