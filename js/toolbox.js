
if (typeof jxlate.ui === "undefined") {
    var jxlate = {};//suppress warnings
    console.error("JXlate UI module loaded before core.");
}

/**
 * JXLate UI toolbox object
 * @type {Object}
 */
jxlate.ui.toolbox = {
    /**
     * Array of supported toolbox actions together with their description.
     * 
     * Each action is indexed by its ID number, the second index specifies the action name or description (0 or 1).
     * @type {Array}
     */
    tools: [
        ['replace', 'Replace one phrase with another'],
        ['case', 'Toggle letter case'],
        ['length', 'Find the total length'],
        ['reverse', 'Reverse all characters'],
        ['shift', 'Apply Caesar shift'],
        ['invert', 'Invert bit values'],
        ['greverse', 'Reverse groupings only'],
        ['stripspaces', 'Remove spaces'],
        ['xor', 'XOR each byte against a number'],
        ['byteshift','Shift each byte value by some amount']
    ],

    /**
     * Array containing lists of tools that are available to each data mode (numeral system base).
     * 
     * Each entry is indexed by the numeral system base value and contains an array of tool ID numbers that are applicable to it.
     * @type {Array}
     * @see jxlate.ui.toolbox.tools
     */
    toolsets: [],

    /**
     * The Toolbox DOM element object, when available.
     * @type {Object}
     */
    tbox: null,
    
    /**
     * The UI textarea DOM element object, when available.
     * @type {Object}
     */
    textarea: null,
    
    /**
     * State flag indicating whether the toolbox element is currently visible.
     * @type {Boolean}
     */
    
    shown: false,
    
    /**
     * State flag indicating the current letter-case used for the 'case' tool action.
     * @type {Boolean}
     */
    lettercase: true,

    /**
     * Initializes the toolbox element and all tool action information.
     * @param {Object} textarea The DOM element object of the UI textarea input.
     * @return {undefined}
     */
    init: function (textarea) {
        this.tbox = document.getElementById('tbox');
        this.textarea = textarea;
        this.events.hide();

        this.toolsets[0] = [2];
        this.toolsets[2] = [0, 2, 3, 5, 6, 7, 8, 9];//TODO: add word-reversal.
        this.toolsets[8] = [0, 2, 3, 5, 6, 8, 9];
        this.toolsets[10] = [0, 2, 3, 5, 6, 8, 9];
        this.toolsets[16] = [0, 1, 2, 3, 5, 6, 7, 8, 9];
        this.toolsets[32] = [2, 7];
        this.toolsets[64] = [2, 7];
        this.toolsets[85] = [2];
        this.toolsets[256] = [0, 1, 2, 3, 4];
    },
    
    /**
     * Indicates to the toolbox to [visually] provide tool options for a different data mode / numeral system base.
     * @param {String|number} modestr the data mode/numeral system base value being switched to.
     * @return {undefined}
     */
    switch : function (modestr) {
        this.clear();
        var m = parseInt(modestr);
        if (isNaN(m))
            m = 0;
        if (modestr === "ucs2" || modestr === "utf8")
            m = 256;//allow text tools for unicode text modes.
        var ts = this.toolsets[m];
        for (var i = 0; i < ts.length; i++)
            this.addtooln(ts[i]);
    },

    /**
     * Set the positioning of the toolbox element
     * @param {number} x the left position in pixels
     * @param {type} y the top position in pixels
     * @return {undefined}
     */
    setpos: function (x, y) {
        this.tbox.style.left = x + "px";
        this.tbox.style.top = y + "px";
    },
    
    /**
     * Removes all [visual] tool options currently displayed.
     * @return {undefined}
     */
    clear: function () {
        while (this.tbox.lastChild) {
            this.tbox.removeChild(this.tbox.lastChild);
        }
    },

    /**
     * Adds a tool option [visually] to the toolbox element, by tool id.
     * @param {type} i The tool ID number
     * @return {undefined}
     */
    addtooln: function (i) {
        this.addtool(this.tools[i][0], this.tools[i][1]);
    },
    
    /** Adds a tool option [visually] to the toolbox element.
     * 
     * This creates an element inside the toolbox which has a click event, alt-text, and image corresponding to the action string (tool name),
     * and hover text showing the description.
     * 
     * @param {type} sname the name of the tool / action string
     * @param {type} sdesc the description of the tool
     * @return {undefined}
     */
    addtool: function (sname, sdesc) {
        var sfunc = "jxlate.ui.toolbox.events.action_" + sname;

        var tool = document.createElement("div");
        tool.className = "tool";

        var img = document.createElement("img");
        img.title = sdesc;
        img.alt = sname;
        img.src = "img/" + sname + ".png";
        img.style.borderStyle = "none";
        tool.onclick = (function(sfunc){
            return function(){
                eval(sfunc)();
                if(jxlate.ui.display==="lite") jxlate.ui.litemenu.close();//close menu after clicking action.
            };
        })(sfunc);
              
        this.tbox.appendChild(tool);
        tool.appendChild(img);
    },

    /**
     * Object containing event functions supported by the toolbox
     */
    events: {

        /**
         * Show the toolbox element, visually.
         * @return {undefined}
         */
        show: function () {
            jxlate.ui.toolbox.tbox.style.display = 'block';
        },
        
        /**
         * Hide the toolbox element, visually
         * @return {undefined}
         */
        hide: function () {
            jxlate.ui.toolbox.tbox.style.display = 'none';
        },
        
        /**
         * Toggle whether the toolbox element is hidden or shown, visually.
         * @return {undefined}
         */
        toggle: function () {
            if (jxlate.ui.toolbox.shown)
                jxlate.ui.toolbox.events.hide();
            else
                jxlate.ui.toolbox.events.show();
            jxlate.ui.toolbox.shown = !jxlate.ui.toolbox.shown;
        },

        /**
         * Unused tool action for debugging new options
         * @return {undefined}
         */
        action_debug: function () {
            alert("wat");
        },
        
        action_xor: function(){
            var xor_value = prompt("Enter a number 1-255 to xor against");
            if(xor_value===null) return;
            xor_value=parseInt(xor_value);
            if(xor_value===0) return;
            jxlate.ui.toolbox.performDecimalOperation(function(input_value){
                return input_value ^ xor_value;
            });
        },
        action_byteshift: function(){
            var shift_value = prompt("Enter a number 1-255 to shift all the bytes with");
            if(shift_value===null) return;
            shift_value=parseInt(shift_value);
            if(shift_value===0) return;
            jxlate.ui.toolbox.performDecimalOperation(function(input_value){
                console.log(input_value + " + " + shift_value + " = "+jxlate.util.modp(input_value + shift_value, 256));
                return jxlate.util.modp(input_value + shift_value, 256);
            });
        },

        action_replace: function () {
            var search = prompt("Enter the string to replace", "");
            if (search === null)
                return;
            var replace = prompt("Enter the string to replace with", "");
            if (replace === null)
                return;
            jxlate.ui.toolbox.textarea.value = jxlate.ui.toolbox.textarea.value.replaceAll(search, replace);
        },
        action_case: function () {
            var textarea = jxlate.ui.toolbox.textarea;
            if (jxlate.ui.toolbox.lettercase)
                textarea.value = textarea.value.toUpperCase();
            else
                textarea.value = textarea.value.toLowerCase();
            jxlate.ui.toolbox.lettercase = !jxlate.ui.toolbox.lettercase;
        },
        action_length: function () {
            var l = jxlate.ui.toolbox.textarea.value.length;
            var sl = jxlate.ui.toolbox.strippedlen(jxlate.ui.toolbox.textarea.value);
            var out = "Total length: " + l;
            var base = jxlate.ui.mode_bases[jxlate.ui.mode];
            if (base === 2) {
                out += "\nBit length: " + sl;
                out += "\nBytes: " + (sl / 8);
            } else if (base === 16) {
                out += "\nDigits: " + sl + " (nibbles)";
                out += "\nBytes: " + (sl / 2);
            }
            alert(out);
        },
        action_reverse: function () {
            jxlate.ui.toolbox.textarea.value = jxlate.ui.toolbox.textarea.value.reverse();
        },
        action_shift: function () {
            var shift = prompt("Please enter the caesar shift value", "13");
            if (shift === null)
                return;
            shift = parseInt(shift);
            if (shift === 0)
                return;
            jxlate.ui.toolbox.textarea.value = Caesar(1, jxlate.ui.toolbox.textarea.value, shift);
        },

        action_invert: function () {//NOTE: uses 'mode' and 'mode_bases' global from ui.js
            var textarea = jxlate.ui.toolbox.textarea;
            var base = jxlate.ui.mode_bases[jxlate.ui.mode];
            var tmp = jxlate.ui.convertText(textarea.value, base, 2);
            tmp = jxlate.ui.toolbox.invertbits(tmp);
            textarea.value = jxlate.ui.convertText(tmp, 2, base);
        },
        action_greverse: function () {
            jxlate.ui.toolbox.textarea.value = jxlate.ui.toolbox.textarea.value.split("").reverse().join("").split(" ").reverse().join(" ");
        },
        action_stripspaces: function () {
            //TODO: operate on existing value instead of re-reading
            jxlate.ui.toolbox.textarea.value = jxlate.ui.toolbox.textarea.value.stripWhitespace();
        }
    },
//==============================================


    performDecimalOperation:function(func){
        var base = jxlate.ui.getSelectedBase();
        var decimal_array = jxlate.ui.getInputAsDecimalArray();
        console.log(decimal_array);
        for(var i=0;i<decimal_array.length;i++){
            decimal_array[i] = func(parseInt(decimal_array[i]),i);
        }
        jxlate.ui.setInputFromDecimalArray(decimal_array, base);
    },

    /**
     * Determines the length of a string without whitespace
     * @param {String} str the string
     * @return {number} the number of non-whitespace characters in the string
     */
    strippedlen: function (str) {
        return str.stripWhitespace().length;
    },

    /**
     * Inverts a string containing binary digits.
     * @param {String} str A string of binary digits / spaces.
     * @return {String} The input string, but with each binary digit inverted.
     */
    invertbits: function (str) {
        return str
                .replaceAll("0", "X")
                .replaceAll("1", "0")
                .replaceAll("X", "1");
    }

};