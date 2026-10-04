/* @P2@ */

if (typeof jxlate === "undefined") {
    var jxlate = {};//suppress warnings
    console.error("JXlate module loaded before core.");
}
jxlate.ui = {
    /**
     * The JXlate UI toolbox object, when available.
     * @type {Object}
     */
    toolbox: null,
    /*
     * The DOM element object for the form containing all relevent fields of UI, when available.
     * @type {undefined}
     */
    mainForm: null,
    /**
     * The DOM element object for the main textarea of the UI, when available
     * @type {undefined}
     */
    textarea: null,

    /**
     * Preserves the exact text assigned to a text mode when textarea value
     * normalization changes its line endings (for example CR to LF).
     * @type {Object|null}
     */
    textRepresentation: null,
    textEdit: null,
    
    /**
     * UI element used for local file importing
     * @type HTMLElement
     */
    fileUpTrigger:null,
    
    /**
     * UI element used for local file exporting
     * @type HTMLElement
     */
    fileDownTrigger:null,
    downloadObjectURL:null,
    
    /**
     * Defines the type of layout displayed by the UI.
     * 
     * Currently this can be "desktop" or "lite", or null if not correctly set.
     * @type {String|null}
     */
    display:null,

    /**
     * Property indicating the current mode value, respresenting the numeral system/base of the data being entered or converted to.
     * @type {Number|String}
     */
    mode: 0,
    
    /**
     * Array of all supported "modes" (bases) supported by UI options.
     * @type {Array}
     */
    mode_bases: [256, 'mc', 2, 8, 10, 16, '32r', '32h', '32c', 64, 85, 'ue', 'ucs2', 'utf8', 'n'], //values used internally to represent each base in shorthand.
//var mode_names=['Text','Morse','Binary','Octal','Decimal','Hexadecimal','Base32Rfc','Base32Hex','Base32Ckr','Base64','Ascii85','UrlEncode'];//unused array

    /**
     * Gets the input text of the UI form (textarea content)
     * @return {String}
     */
    getInputText:function(){
        return this._getTextRepresentation(this.getSelectedBase());
    },
    
    /**
     * Gets the input text of the UI form (textarea content)
     * @param {String} text
     * @return {undefined}
     */
    setInputText:function(text){
        this._setTextRepresentation(text, this.getSelectedBase());
    },

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
        this.textEdit = null;
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

    _relabelTextRepresentation:function(oldBase, newBase){
        if (this.textRepresentation !== null &&
            this.textRepresentation.base === oldBase &&
            this.textRepresentation.visibleText === this.textarea.value &&
            this._isTextBase(newBase))
            this.textRepresentation.base = newBase;
    },

    _rememberTextEdit:function(event){
        this.textEdit = null;
        if (!event || !/^(insert|delete)/.test(event.inputType))
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
        var newText = this.textarea.value;
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
    },
    
    /**
     * Gets the currently selected data mode as a base/numeral system value.
     * @return {String|number} the base currently selected
     */
    getSelectedBase:function(){
        return this.mode_bases[this.mode];
    },
    
    /**
     * Get the input data of the UI form (textarea content) as converted to an array of decimal values.
     * @return {Array} the array of decimal values
     */
    getInputAsDecimalArray:function(){
        var text = this.getInputText();
        var baseFrom = this.getSelectedBase();
        var a = jxlate.formatter.input2buffer(text, baseFrom);
        return jxlate.translator.array_base2base(a, baseFrom, 10);
    },
    getInputAsByteArray:function(){
        var decarr = this.getInputAsDecimalArray();
        for (var i = 0; i < decarr.length; i++) {
            var value = String(decarr[i]);
            if (!/^\d+$/.test(value))
                throw "invalid byte value";
            var byte = parseInt(value, 10);
            if (byte > 255)
                throw "byte value must be between 0 and 255";
            decarr[i] = byte;
        }
        return decarr;
    },
    getInputAsDatastring:function(){
        var decarr = this.getInputAsByteArray();
        var data = "";
        var chunkSize = 8192;
        for (var i = 0; i < decarr.length; i += chunkSize)
            data += String.fromCharCode.apply(null, decarr.slice(i, i + chunkSize));
        return data;
    },
    
    /**
     * Set the input from an array of decimal values converted back into the given base
     * @param {type} arr the array of decimal values
     * @param {type} baseTo the base to display the data in
     * @return {undefined}
     */
    setInputFromDecimalArray:function(arr,baseTo){
        if(typeof baseTo==="undefined" || baseTo===-1) baseTo = this.getSelectedBase();
        var a = jxlate.translator.array_base2base(arr, 10, baseTo);
        var text = jxlate.formatter.buffer2output(a, baseTo);
        this._setTextRepresentation(text, baseTo);
    },
    
    setInputFromDatastring:function(str,baseTo){
        var arr = [];
        for(var i=0;i<str.length;i++) arr.push(str.charCodeAt(i));
        this.setInputFromDecimalArray(arr,baseTo);
    },
    
    
    

    /**
     * Converts human-readable input data from a given base to a character (byte) string without further formatting.
     * @param {String} s The input data
     * @param {String|number} baseFrom the base value / numeral system to convert to
     * @return {String} The byte string
     */
    convertToBytesNF: function (s, baseFrom) {//translate a string from one base to another
        var a = jxlate.formatter.input2buffer(s, baseFrom);//preformat the input into an array of units in that base
        a = jxlate.translator.array_base2base(a, baseFrom, 256);//process the array for conversion
        return a.join("");
    },

    /**
     * Converts human-readable input data from one base/numeral system to another, with all necessary formatting.
     * @param {String} s the input data
     * @param {String|number} baseFrom the base value / numeral system to convert from
     * @param {String|number} baseTo the base value / numeral system to convert to
     * @return {String} A human-readable string representing the data in the final base
     */
    convertText: function (s, baseFrom, baseTo) {//translate a string from one base to another
        var a = jxlate.formatter.input2buffer(s, baseFrom);//preformat the input into an array of units in that base
        a = jxlate.translator.array_base2base(a, baseFrom, baseTo);//process the array for conversion
        return jxlate.formatter.buffer2output(a, baseTo, baseFrom);//postformat the output back into readable form.
    },
    
    /**
     * Indicates to the UI that the data mode is to be switched to another base/numeral system, triggering conversion and UI/toolbox updates.
     * 
     * Input values are indexed against mode_bases array.
     * @param {Number} mode the current mode/base index being switched from
     * @param {Number} newmode the new mode/base index being switched to
     * @return {undefined}
     */
    switchMode: function (mode, newmode) {//mode is changing - retrieve all of the parameters needed to start a translation and prepare the form.
        var base = jxlate.ui.mode_bases[mode];
        var newbase = jxlate.ui.mode_bases[newmode];
        var text = jxlate.ui._getTextRepresentation(base);

        if (text === "") {
            jxlate.ui.toolbox.switch(newbase);
            return;
        }

        //easter egg / credits
        //if (base === "32r" && newbase === 64 && text === "uuddlrlrba")
        //    return foo(jxlate.ui.textarea);

        text = jxlate.ui.convertText(text, base, newbase);
        jxlate.ui._setTextRepresentation(text, newbase);
        jxlate.ui.toolbox.switch(newbase);
        if(jxlate.ui.display!=="lite") jxlate.ui.textarea.focus();

    },

    /**
     * Checks whether a given data mode/base is considered to be "text".
     * 
     * Generally this only includes bytes (iso8859-1), ucs2, and utf8.
     * @param {Number} m The data mode/base index in mode_bases to check
     * @return {Boolean} whether the mode was a text mode
     */
    isTextMode: function (m) {
        console.log('istextmode: ' + jxlate.ui.mode_bases[m] + " " + (jxlate.ui.mode_bases[m] === 256 || jxlate.ui.mode_bases[m] === 'ucs2' || jxlate.ui.mode_bases[m] === 'utf8'));
        return (jxlate.ui.mode_bases[m] === 256 || jxlate.ui.mode_bases[m] === 'ucs2' || jxlate.ui.mode_bases[m] === 'utf8');
    },

    /**
     * Initialize the UI object and all related features/data.
     * @return {undefined}
     */
    init: function () {//set initial values and states
        if (this.mainForm === null) {
            this.mainForm = document.getElementById('frmInput');
            this.textarea = this.mainForm.elements["text"];
            this.textRepresentation = null;
            if (this.textarea.addEventListener) {
                this.textarea.addEventListener("beforeinput", this.events.RememberTextEdit, false);
                this.textarea.addEventListener("input", this.events.UpdateTextRepresentation, false);
            }
            else if (this.textarea.attachEvent)
                this.textarea.attachEvent("oninput", this.events.UpdateTextRepresentation);
            this.setModeState(0);
            this.textarea.value = "";//clearing old form input
            this.textarea.focus();
        }

        this.fileUpTrigger = document.getElementById('ui-addfile-trigger');
        this.fileDownTrigger = document.getElementById('ui-downloadfile-trigger');
        
        var options = document.getElementById("options");
        if(this.display!=="lite"){
            if (options.addEventListener) {// add a listener for scrolling over the mode selector - allowing easier conversion
                options.addEventListener("mousewheel", this.events.MouseWheelHandler, false);// IE9, Chrome, Safari, Opera
                options.addEventListener("DOMMouseScroll", this.events.MouseWheelHandler, false);// Firefox
            } else
                options.attachEvent("onmousewheel", this.events.MouseWheelHandler);// IE 6/7/8
        }

        if (typeof this.toolbox === null) {
            console.error("UI Toolbox module was not ready - the toolbox will not function properly.");

        } else {
            this.toolbox.init(this.textarea);
            this.toolbox.addtooln(0);
            this.toolbox.addtooln(1);
            this.toolbox.addtooln(2);
            this.toolbox.addtooln(3);
            this.toolbox.addtooln(4);
            this.toolbox.switch(this.getSelectedBase());//fix for toolbox not loading options at init
        }

        setInterval(this.events.pollRadioBox, 100);//poll the radio selector for changes, using an event for this has some issues between browsers.

        var heading = null;
        if(this.display==="lite"){ 
            heading = document.getElementById("header-title");
            heading.innerHTML="JXlite "+ jxlate.version;;
        }
        else{
            heading = document.getElementById("old-header-title");
            heading.innerHTML="JXlate "+ jxlate.version;;
        }
        jxlate.branding.load("branding-side");
    },

    /**
     * Get which radio input is checked in for a given element name.
     * @param {type} sname the name of the radio-box collection
     * @return {String|undefined} The value of the radio box that is checked, or undefined if none are.
     */
    getCheckedRadioValue: function (sname) {//get the current value of a radio selector
        var radios = document.getElementsByName(sname);
        for (var i = 0, length = radios.length; i < length; i++)
            if (radios[i].checked)
                return radios[i].value;
        return undefined;
    },
    
    
    getDataBlob:function(data){
        var buf = jxlate.util.stobuf(data);
        //console.log(buf)
        //data=decodeURIComponent(escape(data));
        //data=unescape(encodeURIComponent(data));
        return new Blob([buf], {type: 'application/octet-stream;charset=utf-8;'});//TODO: IE is messing up file encoding!
    },
    ieDownloadData:function(data,filename){
        var dlData = this.getDataBlob(data);
        navigator.msSaveBlob(dlData, filename);
    },
    setDlLink:function(data, filename){
        var linkElem = this.fileDownTrigger;
        if (navigator.msSaveBlob) {
            linkElem.setAttribute('onclick', "jxlate.ui.ieDownloadData(atob('"+btoa(data)+"'),'"+filename+"')");
        }else{
            var dlData = this.getDataBlob(data);
            var dlURL = window.URL.createObjectURL(dlData);
            try {
                linkElem.setAttribute('download', filename);
                linkElem.href = dlURL;
            } catch (error) {
                window.URL.revokeObjectURL(dlURL);
                throw error;
            }
            var previousURL = this.downloadObjectURL;
            this.downloadObjectURL = dlURL;
            if (previousURL !== null)
                window.URL.revokeObjectURL(previousURL);
        }
    },
    
    getAsFile: function(){//NOTE: this method can only be triggered from a user interaction event
        this.fileUpTrigger.style.display="block";
        try {
            this.setDlLink(this.getInputAsDatastring(),"jxlate-export.data");
            this.fileDownTrigger.click();
        } catch (e) {
            alert("This value could not be exported as a file. Please check that it contains valid byte values.\n\n"
                    + "Technical Reason: " + e);
        } finally {
            this.fileUpTrigger.style.display="none";
        }
    },
    
    
    
    addFile: function(){//NOTE: this method can only be triggered from a user interaction event
        this.fileUpTrigger.style.display="block";
        this.fileUpTrigger.value=null;//ensure the previous file is cleared.
        this.fileUpTrigger.click();//open file select window
        this.fileUpTrigger.style.display="none";
    },
    
    
    addFileObject: function(f){
        console.log("addfileobj "+f);
        var reader = new FileReader();
        var this0 = this;
        reader.onload = (function(theFile) {
		return function(e) {
                        console.log("reader onload");

                        window.g_debug_event=e;
                        window.g_debug_target=e.target;
                        window.g_debug_result=e.target.result;
                        
                        var result=null;
                        if(typeof e.target.result === "undefined" || e.target.result===null){
                            result=e.target.content;//IE11
                        }else{
                            result=e.target.result;
                        }
                        
                        if(result instanceof ArrayBuffer){
                            var binaryData = "";
                            var bytes = new Uint8Array(e.target.result);
                            var length = bytes.byteLength;
                            for (var i = 0; i < length; i++) binaryData += String.fromCharCode(bytes[i]);
                            result = binaryData;
                        }
                        
                        this0.setInputFromDatastring(result);
                        
			//console.log('x ',result);
			//setTimeout(processData,250);
		};
	})(f);
        
        if (navigator.msSaveBlob) {
            reader.readAsArrayBuffer(f);
        }else{
            reader.readAsBinaryString(f);
        }
        //readAsArrayBuffer
        
        
        
        //reader.readAsText(f);
    },
    
    handleFileSelectEvent: function(evt){
        console.log("file select evt "+evt);
        this.handleFileSelect(evt.target);
    },
    handleFileSelect: function(target){
        console.log("file select "+target);
	var files = target.files; // FileList object

	// use the 1st file from the list
        for(var i=0;i<files.length;i++){
            this.addFileObject(files[i]);
            break;//well, we only actually accept one file. sorry.
        }
    },
    

    /**
     * Sets the current UI data mode (base) selection without data conversion or further UI updates.
     * @param {Number} i the data mode / base index from mode_bases to indicate
     * @return {undefined}
     */
    setModeState: function (i) {
        //called by event - only use static references.
        jxlate.ui.mode = i;
        document.getElementById("rad" + i).checked = true;
    },

    /*
     function generateOption(parent){
     var el=document.createElement("li");
     }
     functions generateOptions(){
     var parent=document.getElementById("options");
     
     }
     */

    /**
     * An object containing all supported event-functions of the UI
     */
    events: {
        
        /**
         * Polls the data mode (bases) radio box collection for changes, triggers appropriate UI changes, and handles conversion exceptions.
         * @return {undefined}
         */
        pollRadioBox: function () {//poll the UI for mode radio-box changes.
            //called by event - restrict everything to static references.
            var newmode = jxlate.ui.getCheckedRadioValue("mode");
            if (newmode !== jxlate.ui.mode) {//check if the selected radio button has been changed
                console.log("changed! " + jxlate.ui.mode + "->" + newmode);
                var oldmode = jxlate.ui.mode;
                jxlate.ui.mode = newmode;//change the current mode value.
                if (jxlate.ui.isTextMode(oldmode) && jxlate.ui.isTextMode(newmode)) {
                    jxlate.ui._relabelTextRepresentation(
                        jxlate.ui.mode_bases[oldmode],
                        jxlate.ui.mode_bases[newmode]
                    );
                    console.log('text to text conversion has been deprecated. performing no action');
                    return;
                }
                try {
                    jxlate.ui.switchMode(oldmode, newmode);//trigger a translation
                } catch (e) {
                    jxlate.ui.setModeState(oldmode);
                    console.log(e);
                    if (e !== "no entry")
                        alert("This value could not be converted as specified.\nPlease make sure it is valid.\n\n"
                                + "Technical Reason: \n" + "   " + e
                                );
                }
                console.log("conversion complete");
            }
        },

        RememberTextEdit: function(event){
            jxlate.ui._rememberTextEdit(event);
        },
        UpdateTextRepresentation: function(){
            jxlate.ui._updateTextRepresentation();
        },
        
        /**
         * Handles input by the user's mousewheel to trigger radio-box (bases) selection changes.
         * @param {Object} e The triggering event for the function
         * @return {Boolean}
         */
        MouseWheelHandler: function (e) {//handle scrollwheel events
            // cross-browser wheel delta
            var e = window.event || e; // old IE support - this looks like an error though...
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));//calculate the number of steps the wheel has moved. (signed for direction)

            var target = -1;
            var radios = document.getElementsByName("mode");
            for (var i = 0, length = radios.length; i < length; i++)//find the current selected radio input
                if (radios[i].checked) {
                    //console.log("i="+i);
                    target = jxlate.util.modp(i - delta, jxlate.ui.mode_bases.length);
                    radios[i].checked = false;//target the (current-scrollclicks) radio, in visual order.
                }
            //console.log(target);

            for (var j = 0, lengthj = radios.length; j < lengthj; j++)//find the targetted radio input and check it (will force a mode change and translation)
                if (j === target)
                    radios[j].checked = true;

            return false;
        },
        
        /**
         * Triggers a popup alert containing information about the Latin-1 mode (used when the user requests it).
         * @return {undefined}
         */
        iso8859info: function () {
            alert("This mode displays ISO-8859-1 (Latin-1) text - single bytes 00-FF (256)\n" +
                    "If you input unicode into this mode, it will be interpreted as two bytes.\n" +
                    "Use UCS-2 (Unicode code point values) or UTF-8 modes instead for unicode."
                    );
        }
    }
};
