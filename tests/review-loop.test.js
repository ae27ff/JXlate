const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadApp, root } = require('./helpers');
const { ui, context, alerts } = loadApp();
const translator = context.jxlate.translator;
for (const file of ['morse', 'rumkin-util', 'rumkin-caesar'])
    vm.runInContext(fs.readFileSync(path.join(root, 'js/lib', file + '.js'), 'utf8'), context);

// Numeric widths, malformed inputs, identity conversions and radix guards.
for (const output of [2, 16])
    for (const input of ['256', '4095', '9007199254740991'])
        assert.throws(() => ui.convertText(input, 10, output));
for (const base of [0, 1, 37, -2, 2.5, Infinity, NaN, 'bad', '2oops']) {
    assert.throws(() => translator.dec2numeral(100, base));
    assert.throws(() => translator.numeral2dec('10', base));
    assert.throws(() => translator.array_base2base([], base, base));
}
assert.equal(ui.convertText('QQ==', '64', '256'), 'A');
for (const [text, base] of [['65junk', 10], ['2', 2], ['GG', 16]])
    assert.throws(() => ui.convertText(text, base, base));
assert.throws(() => translator.numeral2dec('', 16));
assert.throws(() => translator.dec2numeral(-1, 16));
assert.throws(() => translator.numeraldigit2dec('', 16));
assert.throws(() => translator.numeraldigit2dec('A', 256));
for (let base = 2; base <= 36; base++) {
    for (const value of [0, 1, 255, 256, 65535, 9007199254740991]) {
        const encoded = translator.dec2numeral(value, base);
        assert.equal(translator.numeral2dec(encoded, base), value);
        if (base !== 26) assert.equal(encoded, value.toString(base).toUpperCase());
    }
}
for (const malformed of ['%', '%G0', '%0', '%u0041', 'x%FF%'])
    assert.throws(() => ui.convertText(malformed, 'ue', 256));
for (const [input, base] of [['\ufb00', 16], ['\xdf\xdf', '32r'], ['\u017f\u017f', '32r']])
    assert.throws(() => ui.convertText(input, base, 256));
assert.equal(ui.convertText('%2b+%25', 'ue', 256), '++%');
for (const text of ['A', 'AB', 'A\x00\r\nB']) {
    assert.equal(context.convert_encoding(text, 'ucs2', 'utf8'), context.iso88591_to_utf8(context.ucs2_to_iso88591(text)));
    if (context.utf8_to_iso88591(text).length % 2 === 0)
        assert.equal(context.convert_encoding(text, 'utf8', 'ucs2'), context.iso88591_to_ucs2(context.utf8_to_iso88591(text)));
    assert.equal(context.convert_encoding(text, 'utf8', 'utf8'), text);
}
for (const name of ['missing', 'constructor', '__proto__'])
    assert.throws(() => context.convert_encoding('A', name, 'utf8'));
const morseText = 'ABC XYZ 1234567890';
assert.equal(ui.convertText(ui.convertText(morseText, 256, 'mc'), 'mc', 256), morseText);
assert.throws(() => ui.convertText('A#', 256, 'mc'));
assert.throws(() => ui.convertText('\xdf', 256, 'mc'));
assert.throws(() => ui.convertText('......', 'mc', 256));
assert.equal(Object.hasOwn(context, 'idx'), false);

// Cross-mode binary round trips, using two independent reference encoders.
let seed = 0x1badb002;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; }
function reference85(bytes) {
    let out = '';
    for (let i = 0; i < bytes.length; i += 4) {
        const length = Math.min(4, bytes.length - i);
        let value = 0;
        for (let j = 0; j < 4; j++) value = value * 256 + (j < length ? bytes[i + j] : 0);
        if (length === 4 && value === 0) { out += 'z'; continue; }
        let digits = '';
        for (let j = 0; j < 5; j++) { digits = String.fromCharCode(33 + value % 85) + digits; value = Math.floor(value / 85); }
        out += digits.slice(0, length + 1);
    }
    return '<~' + out + '~>';
}
const bases = [256, 2, 8, 10, 16, '32r', '32h', '32c', 64, 85, 'ue'];
for (let sample = 0; sample < 60; sample++) {
    const bytes = Buffer.from(Array.from({ length: sample < 8 ? sample : random() % 257 }, () => random() & 255));
    const text = bytes.toString('latin1');
    const encodings = bases.map(base => ui.convertText(text, 256, base));
    assert.equal(encodings[bases.indexOf(64)], bytes.toString('base64'));
    // Zero shorthand can have a different but equivalent spelling.
    assert.equal(encodings[bases.indexOf(85)].replace(/z/g, '!!!!!'), reference85(bytes).replace(/z/g, '!!!!!'));
    for (let from = 0; from < bases.length; from++) {
        for (let to = 0; to < bases.length; to++) {
            const converted = ui.convertText(encodings[from], bases[from], bases[to]);
            assert.equal(ui.convertText(converted, bases[to], 256), text);
        }
    }
}

// Generic encoder rejects values that bitwise coercion previously truncated.
const options = { dataBits: 8, codeBits: 5, keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', pad: '=', arrayData: true };
const codec = new context.Nibbler(options);
const unpaddedCodec = new context.Nibbler({ ...options, pad: '' });
assert.throws(() => unpaddedCodec.decode('A'));
assert.throws(() => unpaddedCodec.decode('AAA'));
for (const byte of [NaN, Infinity, -1, 1.5, 256, 4294967296, '65'])
    assert.throws(() => codec.encode([byte]));
for (const changed of [{ dataBits: 0 }, { codeBits: 0 }, { dataBits: 1.5 }, { codeBits: 17 },
    { keyString: 'A'.repeat(32) }, { pad: 'A' }, { pad: '==' }])
    assert.throws(() => new context.Nibbler({ ...options, ...changed }));
for (let bits = 1; bits <= 12; bits++) {
    for (let codeBits = 1; codeBits <= Math.min(bits, 6); codeBits++) {
        const alphabet = Array.from({ length: 2 ** codeBits }, (_, i) => String.fromCharCode(33 + i)).join('');
        const nibbler = new context.Nibbler({ dataBits: bits, codeBits, keyString: alphabet, arrayData: true });
        const values = Array.from({ length: 17 }, () => random() % (2 ** bits));
        assert.deepEqual(Array.from(nibbler.decode(nibbler.encode(values))), values);
    }
}

ui.mode = ui.mode_bases.indexOf(10);
ui.setInputText('0 1 255');
ui.toolbox.events.action_invert();
assert.equal(ui.getInputText(), '255 254 0');
ui.setInputText('256');
alerts.length = 0;
ui.toolbox.events.action_invert();
assert.equal(ui.getInputText(), '256');
assert.equal(alerts.length, 1);
ui.mode = 0;
ui.setInputText('\xff');
ui.toolbox.lettercase = true;
ui.toolbox.events.action_case();
assert.equal(ui.getInputText(), '\xff');
ui.toolbox.tbox = { style: {} };
ui.toolbox.events.show();
ui.toolbox.events.toggle();
assert.equal(ui.toolbox.tbox.style.display, 'none');
ui.toolbox.events.toggle();
assert.equal(ui.toolbox.tbox.style.display, 'block');
assert.throws(() => context.jxlate.util.stobuf('\u20ac'));
assert.throws(() => context.jxlate.util.stobuf(undefined));
assert.equal(vm.runInContext("'ab'.replaceAll('', '-')", context), '-a-b-');
assert.equal(vm.runInContext("''.replaceAll('', '-')", context), '-');
let logCount = 0;
context.console.log = () => { logCount++; };
ui.mode = ui.mode_bases.indexOf(16);
ui.setInputText('00 '.repeat(20000));
ui.toolbox.events.action_byteshift();
assert.equal(logCount, 0, 'large transforms must not emit a console entry for every byte');
assert.equal(ui.getInputAsDatastring(), '\x01'.repeat(20000));
ui.mode = 0;

// Undo must restore the original raw bytes, including deleted CR/CRLF.
ui.setInputText('A\r\nB');
ui.textarea.selectionStart = 1;
ui.textarea.selectionEnd = 2;
ui.events.RememberTextEdit({ inputType: 'deleteContentForward' });
ui.textarea.value = 'AB';
ui.events.UpdateTextRepresentation();
ui.events.RememberTextEdit({ inputType: 'historyUndo' });
ui.textarea.value = 'A\nB';
ui.events.UpdateTextRepresentation();
assert.equal(ui.getInputText(), 'A\r\nB');
ui.events.RememberTextEdit({ inputType: 'historyRedo' });
ui.textarea.value = 'AB';
ui.events.UpdateTextRepresentation();
assert.equal(ui.getInputText(), 'AB');
// Coalesced native undo/redo can span several keystrokes. History stores only
// those changes instead of repeated copies of the large imported document.
const originalLarge = 'A\r\n' + 'B'.repeat(200000);
ui.setInputText(originalLarge);
const initialVisible = ui.textarea.value;
for (let i = 0; i < 20; i++) {
    const end = ui.textarea.value.length;
    ui.textarea.selectionStart = ui.textarea.selectionEnd = end;
    ui.events.RememberTextEdit({ inputType: 'insertText' });
    ui.textarea.value += 'X';
    ui.events.UpdateTextRepresentation();
}
assert.equal(ui.textHistory.reduce((sum, edit) => sum + edit.inserted.length + edit.removed.length, 0), 20);
ui.events.RememberTextEdit({ inputType: 'historyUndo' });
ui.textarea.value = initialVisible;
ui.events.UpdateTextRepresentation();
assert.equal(ui.getInputText(), originalLarge);
ui.events.RememberTextEdit({ inputType: 'historyRedo' });
ui.textarea.value = initialVisible + 'X'.repeat(20);
ui.events.UpdateTextRepresentation();
assert.equal(ui.getInputText(), originalLarge + 'X'.repeat(20));
for (let trial = 0; trial < 30; trial++) {
    let expectedRaw = 'A\r\nB\rC\nD';
    ui.setInputText(expectedRaw);
    const snapshots = [expectedRaw];
    for (let step = 0; step < 20; step++) {
        const units = expectedRaw.match(/\r\n|[\s\S]/g) || [];
        const from = random() % (units.length + 1);
        const to = from + random() % (units.length - from + 1);
        const inserted = ['X', 'Y\nZ', '', '\n'][random() % 4];
        const expectedNext = units.slice(0, from).join('') + inserted + units.slice(to).join('');
        if (expectedNext.replace(/\r\n?/g, '\n') === ui.textarea.value) continue;
        ui.textarea.selectionStart = from;
        ui.textarea.selectionEnd = to;
        ui.events.RememberTextEdit({ inputType: 'insertText' });
        ui.textarea.value = units.slice(0, from).join('').replace(/\r\n?/g, '\n') + inserted +
            units.slice(to).join('').replace(/\r\n?/g, '\n');
        ui.textarea.selectionStart = ui.textarea.selectionEnd = from + inserted.length;
        ui.events.UpdateTextRepresentation();
        expectedRaw = expectedNext;
        assert.equal(ui.getInputText(), expectedRaw);
        snapshots.push(expectedRaw);
    }
    for (let i = snapshots.length - 2; i >= 0; i--) {
        ui.events.RememberTextEdit({ inputType: 'historyUndo' });
        ui.textarea.value = snapshots[i].replace(/\r\n?/g, '\n');
        ui.events.UpdateTextRepresentation();
        assert.equal(ui.getInputText(), snapshots[i]);
    }
    for (let i = 1; i < snapshots.length; i++) {
        ui.events.RememberTextEdit({ inputType: 'historyRedo' });
        ui.textarea.value = snapshots[i].replace(/\r\n?/g, '\n');
        ui.events.UpdateTextRepresentation();
        assert.equal(ui.getInputText(), snapshots[i]);
    }
}

// File read failures preserve data and old reads cannot overwrite a newer one.
const readers = [];
context.FileReader = function() { readers.push(this); this.readAsArrayBuffer = () => {}; };
ui.setInputText('original');
ui.addFileObject({});
ui.addFileObject({});
readers[1].onload({ target: { result: Uint8Array.from([65, 0, 255]).buffer } });
assert.equal(ui.getInputText(), 'A\x00\xff');
readers[0].onload({ target: { result: Uint8Array.from([66]).buffer } });
assert.equal(ui.getInputText(), 'A\x00\xff');
ui.mode = ui.mode_bases.indexOf('utf8');
ui.setInputText('original');
ui.addFileObject({});
alerts.length = 0;
readers[2].onload({ target: { result: Uint8Array.from([255]).buffer } });
assert.equal(ui.getInputText(), 'original');
assert.equal(alerts.length, 1);
readers[2].onerror();
assert.equal(alerts.length, 2);
context.navigator = { msSaveBlob() {} };
ui.fileDownTrigger = {};
let ieExport;
ui.ieDownloadData = (data, filename) => { ieExport = [data, filename]; };
ui.setDlLink('A', "quote'file.data");
ui.fileDownTrigger.onclick();
assert.deepEqual(ieExport, ['A', "quote'file.data"]);

// Shifts uses the same raw-text buffer, avoiding input[type=text] sanitization.
const html = fs.readFileSync(path.join(root, 'shifts.html'), 'utf8');
assert.match(html, /<textarea id="txt"/);
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
let textValue = '';
const fields = { txt: {
    get value() { return textValue; },
    set value(text) { textValue = String(text).replace(/\r\n?/g, '\n'); },
    selectionStart: 0, selectionEnd: 0
}, dec: { value: '13 10 65' }, hex: { value: '' } };
context.document.getElementById = id => fields[id];
const shifts = context.ShiftsTool;
let reported;
shifts.report_op_from_select = text => { reported = text; };
shifts.report_dec();
shifts.report_txt();
assert.equal(reported, '\r\nA');
fields.txt.selectionStart = 1; fields.txt.selectionEnd = 2;
shifts.rememberTextEdit({ inputType: 'insertText' });
fields.txt.value = '\nB';
shifts.updateText();
shifts.report_txt();
assert.equal(reported, '\r\nB');
assert.equal(shifts.getTextBuffer().textHistory.length, 1, 'generating a report must retain existing undo history');
function rows() {
    return { rows: [], insertRow() {
        const row = { cells: [], classList: { add() {} }, insertCell() {
            const cell = {}; this.cells.push(cell); return cell;
        } };
        this.rows.push(row); return row;
    } };
}
context.document.createElement = () => ({
    createTHead() { this.head = rows(); return this.head; },
    createTBody() { this.body = rows(); return this.body; }
});
fields.flt = { checked: false };
function referenceShift(id, text, key) {
    const data = Array.from(Buffer.from(text, 'latin1'));
    if (id === 'sbrotate') {
        const bits = data.map(byte => byte.toString(2).padStart(8, '0')).join('');
        if (!bits.length) return '';
        const right = ((key % bits.length) + bits.length) % bits.length;
        const rotated = right ? bits.slice(-right) + bits.slice(0, -right) : bits;
        return Buffer.from(rotated.match(/.{8}/g).map(group => parseInt(group, 2))).toString('latin1');
    }
    const operations = {
        bshift: byte => (byte + key) & 255,
        cxor: byte => byte ^ key,
        bbshift: byte => (key < 0 ? byte << -key : byte >>> key) & 255,
        brotate: byte => ((byte >>> key) | (byte << (8 - key))) & 255,
        cand: byte => byte & key,
        cor: byte => byte | key,
        cxnor: byte => 255 ^ (byte ^ key),
        cnand: byte => 255 ^ (byte & key)
    };
    return Buffer.from(data.map(operations[id])).toString('latin1');
}
for (const sample of ['', 'A', 'A\x00\xff', '\r\n\t\xff']) {
    for (const operation of shifts.operations) {
        let table;
        shifts.report_op_elem({ appendChild(element) { table = element; } }, operation, sample);
        const range = shifts.operationRanges.get(operation.rangeType);
        assert.equal(table.body.rows.length, range.max - range.min + 1);
        table.body.rows.forEach((row, index) => {
            const expected = referenceShift(operation.id, sample, index + range.min);
            const expectedHex = Array.from(Buffer.from(expected, 'latin1'), byte => byte.toString(16).padStart(2, '0')).join(' ');
            assert.equal(row.cells[2].innerHTML, expectedHex);
        });
    }
}
console.log('Review-loop regression and cross-mode reference tests passed');

// Minimal DOM model exercises the actual initialization and radio handlers
// for both pages; browser layout and native file dialogs remain untested.
for (const page of ['index.html', 'lite.html']) {
    const app = loadApp();
    const c = app.context;
    const nodes = new Map();
    const callbacks = [];
    function node() {
        const element = { style: {}, children: [], innerHTML: '', title: '',
            addEventListener() {}, appendChild(child) { this.children.push(child); },
            removeChild(child) { this.children.splice(this.children.indexOf(child), 1); }
        };
        Object.defineProperty(element, 'lastChild', { get() { return this.children.at(-1); } });
        return element;
    }
    const text = app.ui.textarea;
    text.addEventListener = () => {};
    text.focus = () => {};
    const radioNodes = app.ui.mode_bases.map((_, i) => ({ value: String(i), checked: i === 0 }));
    const toolopen = node();
    toolopen.appendChild({ title: 'text tools' });
    for (const id of ['options', 'tbox', 'sidebar', 'lite-menu-button', 'header-title', 'old-header-title',
        'ui-addfile-trigger', 'ui-downloadfile-trigger', 'branding-side']) nodes.set(id, node());
    nodes.set('frmInput', { elements: { text } });
    nodes.set('base64-alphabet', { value: 'base64uri' });
    nodes.set('url-forgiving', { checked: false });
    nodes.set('url-form', { checked: false });
    radioNodes.forEach((radio, i) => nodes.set('rad' + i, radio));
    c.document = {
        getElementById: id => nodes.get(id),
        getElementsByName: () => radioNodes,
        getElementsByClassName: name => name === 'toolopen' ? [toolopen] : [],
        createElement: () => node(),
        addEventListener: (type, callback) => { if (type === 'DOMContentLoaded') callbacks.push(callback); }
    };
    c.setInterval = () => 0;
    const pageHtml = fs.readFileSync(path.join(root, page), 'utf8');
    assert.doesNotMatch(pageHtml, /type="file"[^>]*multiple/);
    for (const match of pageHtml.matchAll(/<script src="([^"?]+)[^"]*"><\/script>/g)) {
        if (match[1] === '/ga.js') continue; // Optional, site-owned analytics.
        assert.ok(fs.existsSync(path.join(root, match[1])));
        vm.runInContext(fs.readFileSync(path.join(root, match[1]), 'utf8'), c);
    }
    vm.runInContext(pageHtml.match(/<script>([\s\S]*?)<\/script>/)[1], c);
    callbacks.forEach(callback => callback());
    const initialized = c.jxlate.ui;
    assert.equal(initialized.toolbox.tbox.style.display, 'none');
    initialized.setInputText('A\r\nB');
    function select(base) {
        const index = initialized.mode_bases.indexOf(base);
        radioNodes.forEach((radio, i) => { radio.checked = i === index; });
        initialized.events.pollRadioBox();
    }
    select(16);
    assert.equal(initialized.getInputText(), '41 0D 0A 42');
    select('utf8');
    assert.equal(initialized.getInputText(), 'A\r\nB');
    select(256);
    assert.equal(initialized.getInputText(), 'A\r\nB');
    initialized.setInputText('\u20ac');
    app.alerts.length = 0;
    select(16);
    assert.equal(initialized.getSelectedBase(), 256);
    assert.equal(initialized.getInputText(), '\u20ac');
    assert.equal(app.alerts.length, 1);
    const unchangedText = initialized.getInputText();
    nodes.get('base64-alphabet').value = 'y64';
    nodes.get('url-forgiving').checked = true;
    nodes.get('url-form').checked = true;
    assert.equal(c.jxlate.translator.base64Alphabet, 'base64uri', 'draft options wait for OK');
    const optionsForm = pageHtml.match(/<form method="dialog"[^>]*>/)[0];
    vm.runInContext(optionsForm.match(/onsubmit="([^"]+)"/)[1], c);
    assert.equal(c.jxlate.translator.base64Alphabet, 'y64');
    assert.equal(c.jxlate.translator.urlForgiving, true);
    assert.equal(c.jxlate.translator.urlForm, true);
    assert.equal(initialized.getInputText(), unchangedText, 'option changes must not rewrite input');
    assert.equal(initialized.convertText('Zg--', 64, 256), 'f');
    assert.equal(initialized.convertText('%2b+%25%', 'ue', 256), '+ %%');
    c.window = {};
    const beforeWheel = radioNodes.map(radio => radio.checked);
    initialized.events.MouseWheelHandler({ wheelDelta: 120, target: {
        className: '', parentNode: { className: 'input-options', parentNode: null }
    } });
    assert.deepEqual(radioNodes.map(radio => radio.checked), beforeWheel, 'scrolling input options must not change modes');
    if (page === 'lite.html') {
        assert.equal(toolopen.children[0].title, '');
        assert.equal(toolopen.children[1].textContent, 'text tools');
        c.jxlate.ui.litemenu.createToolboxLabel(toolopen);
        assert.equal(toolopen.children.length, 2);
    }
}
console.log('Desktop/lite initialization and mode transaction tests passed (modeled DOM)');
