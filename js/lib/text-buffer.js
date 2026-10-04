// Shared raw-text buffer for textareas that normalize CR/CRLF to LF.
var TextBuffer = function(textarea) {
    this.textarea = textarea;
    this.textRepresentation = null;
    this.textEdit = null;
    this.textHistory = [];
    this.textHistoryIndex = -1;
};
TextBuffer.prototype = {
    getSelectedBase:function(){return 256;},
    _isTextBase:function(base){
        return base === 256 || base === "ucs2" || base === "utf8";
    },

    _getTextRepresentation:function(base){
        var visibleText = this.textarea.value;
        if (this.textRepresentation !== null &&
            this.textRepresentation.base === base &&
            this.textRepresentation.visibleText === visibleText)
            return this.textRepresentation.rawText;
        return visibleText;
    },

    _setTextRepresentation:function(text, base){
        text = String(text);
        if (this.textRepresentation !== null && this.textRepresentation.base === base &&
            this.textRepresentation.rawText === text && this.textRepresentation.visibleText === this.textarea.value)
            return;
        this.textEdit = null;
        this.textHistory = [];
        this.textHistoryIndex = -1;
        this.textarea.value = text;
        if (this._isTextBase(base)) {
            this.textRepresentation = {
                base: base,
                rawText: text,
                visibleText: this.textarea.value
            };
        } else {
            this.textRepresentation = null;
        }
    },

    _saveTextHistory:function(oldRaw, newRaw, beforeLength, afterLength){
        // Store edit deltas, not whole documents, so editing a large import
        // does not retain another full copy of it after every keystroke.
        if (typeof oldRaw !== "string" || oldRaw === newRaw ||
            (this.textHistory.length === 0 && oldRaw.indexOf("\r") < 0 && newRaw.indexOf("\r") < 0))
            return;
        var start = 0;
        while (start < Math.min(oldRaw.length, newRaw.length) && oldRaw.charAt(start) === newRaw.charAt(start))
            start++;
        var suffix = 0;
        while (suffix < Math.min(oldRaw.length - start, newRaw.length - start) &&
            oldRaw.charAt(oldRaw.length - suffix - 1) === newRaw.charAt(newRaw.length - suffix - 1))
            suffix++;
        this.textHistory.length = this.textHistoryIndex + 1;
        this.textHistory.push({start: start, removed: oldRaw.slice(start, oldRaw.length - suffix),
            inserted: newRaw.slice(start, newRaw.length - suffix), beforeLength: beforeLength, afterLength: afterLength});
        this.textHistoryIndex++;
    },

    _relabelTextRepresentation:function(oldBase, newBase){
        if (this.textRepresentation !== null &&
            this.textRepresentation.base === oldBase &&
            this.textRepresentation.visibleText === this.textarea.value &&
            this._isTextBase(newBase))
            this.textRepresentation.base = newBase;
    },

    _rememberTextEdit:function(event){
        this.textEdit = null;
        if (!event || !/^(insert|delete|history)/.test(event.inputType))
            return;
        var start = this.textarea.selectionStart;
        var end = this.textarea.selectionEnd;
        if (typeof start !== "number" || typeof end !== "number")
            return;
        // Keep the original caret: word/line deletion lengths are only
        // known after the browser has performed the edit.
        this.textEdit = {start: start, end: end, inputType: event.inputType, visibleText: this.textarea.value};
    },

    _rawTextOffset:function(rawText, visibleOffset){
        var rawOffset = 0;
        for (var i = 0; i < visibleOffset; i++) {
            if (rawText.charAt(rawOffset) === "\r" && rawText.charAt(rawOffset + 1) === "\n")
                rawOffset++;
            rawOffset++;
        }
        return rawOffset;
    },

    _updateTextRepresentation:function(){
        var previous = this.textRepresentation;
        var edit = this.textEdit;
        this.textEdit = null;
        if (previous === null || previous.base !== this.getSelectedBase()) {
            this.textRepresentation = null;
            return;
        }
        var oldText = previous.visibleText;
        var oldRaw = previous.rawText;
        var newText = this.textarea.value;
        if (edit !== null && /^history(Undo|Redo)$/.test(edit.inputType)) {
            var direction = edit.inputType === "historyUndo" ? -1 : 1;
            var candidate = oldRaw;
            var first = direction === -1 ? this.textHistoryIndex : this.textHistoryIndex + 1;
            for (var h = first; h >= 0 && h < this.textHistory.length; h += direction) {
                var change = this.textHistory[h];
                var removed = direction === -1 ? change.inserted : change.removed;
                var inserted = direction === -1 ? change.removed : change.inserted;
                candidate = candidate.slice(0, change.start) + inserted + candidate.slice(change.start + removed.length);
                var length = direction === -1 ? change.beforeLength : change.afterLength;
                if (length === newText.length && candidate.replace(/\r\n?/g, "\n") === newText) {
                    previous.rawText = candidate;
                    previous.visibleText = newText;
                    this.textHistoryIndex = direction === -1 ? h - 1 : h;
                    return;
                }
            }
            edit = null;
        }
        var startLimit = oldText.length;
        var endLimit = oldText.length;
        if (edit !== null && edit.visibleText === oldText) {
            var removedLength = oldText.length - newText.length;
            if (edit.start === edit.end && /^delete/.test(edit.inputType) && removedLength > 0) {
                var deleteStart = edit.start;
                var deleteEnd = edit.end;
                if (/Backward$/.test(edit.inputType))
                    deleteStart = Math.max(0, deleteEnd - removedLength);
                else if (/Forward$/.test(edit.inputType))
                    deleteEnd = Math.min(oldText.length, deleteStart + removedLength);
                else if (typeof this.textarea.selectionStart === "number" &&
                    this.textarea.selectionStart === this.textarea.selectionEnd) {
                    // Non-directional deletions (e.g. an entire soft line)
                    // leave the caret at the beginning of the removed range.
                    deleteStart = this.textarea.selectionStart;
                    deleteEnd = deleteStart + removedLength;
                }
                if (oldText.slice(0, deleteStart) + oldText.slice(deleteEnd) === newText) {
                    edit.start = deleteStart;
                    edit.end = deleteEnd;
                }
            }
            startLimit = edit.start;
            endLimit = oldText.length - edit.end;
        }
        var start = 0;
        while (start < Math.min(oldText.length, newText.length, startLimit) &&
            oldText.charAt(start) === newText.charAt(start))
            start++;
        var suffix = 0;
        while (suffix < Math.min(oldText.length - start, newText.length - start, endLimit) &&
            oldText.charAt(oldText.length - suffix - 1) === newText.charAt(newText.length - suffix - 1))
            suffix++;
        // Only newly edited text uses the textarea's LF line endings.
        // Preserve raw CR/CRLF bytes in the unchanged prefix and suffix.
        previous.rawText = previous.rawText.slice(0, this._rawTextOffset(previous.rawText, start)) +
            newText.slice(start, newText.length - suffix) +
            previous.rawText.slice(this._rawTextOffset(previous.rawText, oldText.length - suffix));
        previous.visibleText = newText;
        var normalizedText = previous.rawText.replace(/\r\n?/g, "\n");
        if (normalizedText !== newText) {
            // An edit can join a preserved bare CR to an LF at the edit
            // boundary. Resync the display so later visible offsets still
            // map to the correct raw bytes, keeping the caret at that join.
            var selectionStart = this.textarea.selectionStart;
            var selectionEnd = this.textarea.selectionEnd;
            var removed = newText.length - normalizedText.length;
            this.textarea.value = previous.rawText;
            previous.visibleText = this.textarea.value;
            if (typeof selectionStart === "number" && typeof selectionEnd === "number") {
                this.textarea.selectionStart = selectionStart - (selectionStart > start ? removed : 0);
                this.textarea.selectionEnd = selectionEnd - (selectionEnd > start ? removed : 0);
            }
        }
        this._saveTextHistory(oldRaw, previous.rawText, oldText.length, previous.visibleText.length);
    },
};
