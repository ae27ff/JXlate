const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');

async function main() {
    const { ui, context, alerts } = loadApp();
    const live = new Map();
    const revoked = [];
    let created = 0;
    let clicks = 0;
    let failCreate = false;
    let failAttribute = false;
    const link = {
        href: 'https://example.test/unowned',
        setAttribute(name, value) {
            if (failAttribute) throw new Error('link update failed');
            this[name] = value;
        },
        click() {
            assert.ok(live.has(this.href), 'current URL must still be usable at download time');
            clicks++;
        }
    };
    context.Blob = Blob;
    context.navigator = {};
    context.window = { URL: {
        createObjectURL(blob) {
            if (failCreate) throw new Error('URL creation failed');
            assert.ok(blob instanceof Blob);
            const url = 'blob:test/' + ++created;
            live.set(url, blob);
            return url;
        },
        revokeObjectURL(url) {
            assert.ok(live.has(url), 'only owned, live URLs should be revoked');
            live.delete(url);
            revoked.push(url);
        }
    } };
    ui.fileDownTrigger = link;
    ui.fileUpTrigger = { style: {} };
    for (let i = 0; i < 24; i++) {
        const bytes = Buffer.from(Array.from({ length: i < 3 ? 200000 : 256 }, (_, n) => (n + i) % 256));
        ui.setInputText(bytes.toString('latin1'));
        ui.getAsFile();
        assert.equal(live.size, 1, 'superseded Blob URLs must be released');
        assert.equal(revoked.length, i);
        assert.equal(link.href, ui.downloadObjectURL);
        assert.equal(link.download, 'jxlate-export.data');
        assert.deepEqual(Buffer.from(await live.get(link.href).arrayBuffer()), bytes);
    }
    assert.equal(clicks, 24);
    assert.equal(alerts.length, 0);
    const current = link.href;
    ui.mode = ui.mode_bases.indexOf(10);
    ui.setInputText('65junk');
    ui.getAsFile();
    assert.equal(clicks, 24);
    assert.equal(created, 24);
    assert.equal(link.href, current);
    assert.equal(live.size, 1);
    assert.equal(alerts.length, 1);
    assert.equal(ui.fileUpTrigger.style.display, 'none');
    failCreate = true;
    assert.throws(() => ui.setDlLink('A', 'test.data'));
    assert.equal(ui.downloadObjectURL, current);
    assert.equal(live.size, 1);
    failCreate = false;
    failAttribute = true;
    assert.throws(() => ui.setDlLink('B', 'test.data'));
    assert.equal(ui.downloadObjectURL, current);
    assert.equal(link.href, current);
    assert.equal(live.size, 1, 'failed link update must release the newly created URL');
    failAttribute = false;
    ui.setDlLink('C', 'test.data');
    assert.equal(live.size, 1);
    assert.ok(revoked.includes(current));
    assert.notEqual(link.href, current);
    console.log('File export byte/lifetime regression tests passed (mocked Blob URL API)');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
