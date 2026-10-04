const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');
const { ui } = loadApp();

function edit(raw, start, end, replacement, type = 'insertText') {
    ui.setInputText(raw);
    const oldValue = ui.textarea.value;
    ui.textarea.selectionStart = start;
    ui.textarea.selectionEnd = end;
    ui.events.RememberTextEdit({ inputType: type });
    const deleteStart = type === 'deleteContentBackward' && start === end ? start - 1 : start;
    const deleteEnd = type === 'deleteContentForward' && start === end ? end + 1 : end;
    ui.textarea.value = oldValue.slice(0, deleteStart) + replacement + oldValue.slice(deleteEnd);
    ui.events.UpdateTextRepresentation();
    return ui.getInputText();
}
for (const base of [256, 'utf8', 'ucs2']) {
    ui.mode = ui.mode_bases.indexOf(base);
    assert.equal(edit('A\r\nB', 0, 1, 'C'), 'C\r\nB');
    assert.equal(edit('A\rB\nC\r\nD', 2, 3, 'xyz'), 'A\rxyz\nC\r\nD');
    assert.equal(edit('A\r\nB', 3, 3, '!'), 'A\r\nB!');
    assert.equal(edit('A\r\nB', 1, 2, '', 'deleteContentForward'), 'AB');
    assert.equal(edit('A\r\nB', 1, 1, '\n', 'insertLineBreak'), 'A\n\r\nB');
    // Identical display text can still represent an intentional newline replacement.
    assert.equal(edit('A\r\nB', 1, 2, '\n'), 'A\nB');
    assert.equal(edit('\r\n\r', 1, 1, '', 'deleteContentBackward'), '\r');
    assert.equal(edit('\r\n\r', 1, 1, '', 'deleteContentForward'), '\r\n');
    assert.equal(edit('A\r\nB', 0, 3, 'new\ntext', 'insertFromPaste'), 'new\ntext');
    // Fallback for browsers without beforeinput still retains unchanged regions.
    ui.setInputText('A\r\nB');
    ui.textarea.value = 'C\nB';
    ui.events.UpdateTextRepresentation();
    assert.equal(ui.getInputText(), 'C\r\nB');
    ui.textarea.value = 'C\nD';
    ui.events.UpdateTextRepresentation();
    assert.equal(ui.getInputText(), 'C\r\nD');
    const expected = base === 'ucs2' ? '0043000d000a0044' : '430d0a44';
    assert.equal(Buffer.from(ui.getInputAsDatastring(), 'latin1').toString('hex'), expected);
    ui.events.UpdateTextRepresentation();
    assert.equal(ui.getInputText(), 'C\r\nD');
    // Removing the separator between CR and LF forms a new CRLF pair.
    assert.equal(edit('\rX\nY', 1, 2, ''), '\r\nY');
    assert.equal(ui.textarea.value, '\nY');
    ui.textarea.selectionStart = 1;
    ui.textarea.selectionEnd = 2;
    ui.events.RememberTextEdit({ inputType: 'insertText' });
    ui.textarea.value = '\nZ';
    ui.events.UpdateTextRepresentation();
    assert.equal(ui.getInputText(), '\r\nZ');
    assert.equal(edit('\rB', 1, 1, '\n', 'insertLineBreak'), '\r\nB');
    assert.equal(ui.textarea.value, '\nB');
}
ui.mode = ui.mode_bases.indexOf(16);
ui.setInputText('41 0D 0A 42');
ui.textarea.value = '43 0D 0A 42';
ui.events.UpdateTextRepresentation();
assert.equal(ui.getInputText(), '43 0D 0A 42');
console.log('Text edit regression tests passed (modeled textarea normalization)');
