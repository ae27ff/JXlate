
if (typeof jxlate.ui === "undefined") {
    var jxlate={};//suppress warnings
    console.error("JXlate UI module loaded before core.");
} else
    jxlate.ui.toolbox = {
        tools : [
            ['replace', 'Replace one phrase with another'],
            ['case', 'Toggle letter case'],
            ['length', 'Find the total length'],
            ['reverse', 'Reverse all characters'],
            ['shift', 'Apply Caesar shift'],
            ['invert', 'Invert bit values'],
            ['greverse', 'Reverse groupings only'],
            ['stripspaces', 'Remove spaces']
        ],

        toolsets : [],

        tbox: null,
        textarea: null,
        shown: false,
        lettercase: true,

        init: function (textarea) {
            this.tbox = document.getElementById('tbox');
            this.textarea = textarea;
            this.events.hide();

            this.toolsets[0] = [2];
            this.toolsets[2] = [0, 2, 3, 5, 6, 7];//TODO: add word-reversal.
            this.toolsets[8] = [0, 2, 3, 5, 6];
            this.toolsets[10] = [0, 2, 3, 5, 6];
            this.toolsets[16] = [0, 1, 2, 3, 5, 6, 7];
            this.toolsets[32] = [2, 7];
            this.toolsets[64] = [2, 7];
            this.toolsets[85] = [2];
            this.toolsets[256] = [0, 1, 2, 3, 4];
        },
        switch: function (modestr) {
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

        setpos: function (x, y) {
            this.tbox.style.left = x + "px";
            this.tbox.style.top = y + "px";
        },
        clear: function () {
            while (this.tbox.lastChild) {
                this.tbox.removeChild(this.tbox.lastChild);
            }
        },

        addtooln: function (i) {
            this.addtool(this.tools[i][0], this.tools[i][1]);
        },
        addtool: function (sname, sdesc) {
            var sfunc = "jxlate.ui.toolbox.events.action_" + sname;
            
            var tool = document.createElement("div");
            tool.className = "tool";


            var img = document.createElement("img");
            img.title = sdesc;
            img.alt = sname;
            img.src = "img/" + sname + ".png";
            img.style.borderStyle = "none";
            img.onclick = eval(sfunc);

            this.tbox.appendChild(tool);
            tool.appendChild(img);

        },

        events:{
            
            show: function () {
                jxlate.ui.toolbox.tbox.style.display = 'block';
            },
            hide: function () {
                jxlate.ui.toolbox.tbox.style.display = 'none';
            },
            toggle: function () {
                if (jxlate.ui.toolbox.shown)
                    jxlate.ui.toolbox.events.hide();
                else
                    jxlate.ui.toolbox.events.show();
                jxlate.ui.toolbox.shown = !jxlate.ui.toolbox.shown;
            },
            
            action_debug: function () {
                alert("wat");
            },

            action_replace: function () {
                var search = prompt("Enter the string to replace", "");
                if (search === null)
                    return;
                var replace = prompt("Enter the string to replace with", "");
                if (replace === null)
                    return;
                jxlate.ui.toolbox.textarea.value =  jxlate.ui.toolbox.textarea.value.replaceAll(search, replace);
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


        strippedlen: function (str) {
            return str.stripWhitespace().length;
        },

        invertbits: function (str) {
            return str
                    .replaceAll("0","X")
                    .replaceAll("1","0")
                    .replaceAll("X","1");
        }

    };