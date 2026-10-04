const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');
const { ui } = loadApp();

// Model beforeinput at the original caret and input after a pure deletion.
function remove(raw, caret, from, to, inputType) {
    ui.setInputText(raw);
    const visible = ui.textarea.value;
    ui.textarea.selectionStart = ui.textarea.selectionEnd = caret;
    ui.events.RememberTextEdit({ inputType });
    ui.textarea.value = visible.slice(0, from) + visible.slice(to);
    ui.textarea.selectionStart = ui.textarea.selectionEnd = from;
    ui.events.UpdateTextRepresentation();
    return ui.getInputText();
}
for (const base of [256, 'utf8', 'ucs2']) {
    ui.mode = ui.mode_bases.indexOf(base);
    for (const type of ['deleteContentBackward', 'deleteWordBackward',
        'deleteSoftLineBackward', 'deleteHardLineBackward']) {
        assert.equal(remove('\r\n\n', 1, 0, 1, type), '\n', type);
        const exported = Buffer.from(ui.getInputAsDatastring(), 'latin1').toString('hex');
        assert.equal(exported, base === 'ucs2' ? '000a' : '0a');
        // Multiple visible characters/newlines can be removed at once.
        assert.equal(remove('\r\n\r\n\nZ', 2, 0, 2, type), '\nZ', type);
        assert.equal(remove('A\r\nword\nZ', 6, 2, 6, type), 'A\r\n\nZ', type);
    }
    for (const type of ['deleteContentForward', 'deleteWordForward',
        'deleteSoftLineForward', 'deleteHardLineForward']) {
        assert.equal(remove('\r\n\n', 0, 0, 1, type), '\n', type);
        assert.equal(remove('\n\r\n', 1, 1, 2, type), '\n', type);
        assert.equal(remove('\r\n\r\n\nZ', 0, 0, 2, type), '\nZ', type);
        assert.equal(remove('A\r\nword\nZ', 2, 2, 6, type), 'A\r\n\nZ', type);
    }
    assert.equal(remove('\r\n\n', 1, 0, 1, 'deleteEntireSoftLine'), '\n');
    assert.equal(remove('A\r\nword\nZ', 4, 2, 7, 'deleteEntireSoftLine'), 'A\r\nZ');
    assert.equal(remove('A\r\nB', 0, 0, 0, 'deleteWordBackward'), 'A\r\nB');
    assert.equal(remove('A\r\nB', 3, 3, 3, 'deleteWordForward'), 'A\r\nB');
    // Exhaust every deletion range in short mixed-ending strings. The oracle
    // removes raw newline units directly, independent of the UI diff logic.
    const tokens = ['\r\n', '\r', '\n', 'A'];
    for (let sample = 0; sample < 256; sample++) {
        const raw = Array.from({ length: 4 }, (_, i) => tokens[(sample >> (2 * i)) & 3]).join('');
        const units = raw.match(/\r\n|[\s\S]/g);
        for (let from = 0; from < units.length; from++) {
            for (let to = from + 1; to <= units.length; to++) {
                const expected = units.slice(0, from).join('') + units.slice(to).join('');
                assert.equal(remove(raw, to, from, to, 'deleteWordBackward'), expected);
                assert.equal(remove(raw, from, from, to, 'deleteWordForward'), expected);
            }
        }
    }
}
console.log('Text deletion regression tests passed (modeled textarea edits)');
