/* @P2@ */
if (typeof addcredits === 'function')
    addcredits("ui.js", 2.1, "crashdemons", "JXlate UI script and overarching operations.");


if (typeof jxlate === "undefined") {
    var jxlate={};//suppress warnings
    console.error("JXlate module loaded before core.");
} else {
    jxlate.ui = {
        toolbox: null,
        mainForm: null,
        textarea: null,
        
        mode: 0,
        mode_bases: [256, 'mc', 2, 8, 10, 16, '32r', '32h', '32c', 64, 85, 'ue', 'ucs2', 'utf8', 'n'], //values used internally to represent each base in shorthand.
//var mode_names=['Text','Morse','Binary','Octal','Decimal','Hexadecimal','Base32Rfc','Base32Hex','Base32Ckr','Base64','Ascii85','UrlEncode'];//unused array

        convertToBytesNF: function (s, baseFrom) {//translate a string from one base to another
            var a = jxlate.formatter.input2buffer(s, baseFrom);//preformat the input into an array of units in that base
            a = jxlate.translator.array_base2base(a, baseFrom, 256);//process the array for conversion
            return a.join("");
        },

        convertText: function (s, baseFrom, baseTo) {//translate a string from one base to another
            var a = jxlate.formatter.input2buffer(s, baseFrom);//preformat the input into an array of units in that base
            a = jxlate.translator.array_base2base(a, baseFrom, baseTo);//process the array for conversion
            return jxlate.formatter.buffer2output(a, baseTo);//postformat the output back into readable form.
        },
        switchMode: function (mode, newmode) {//mode is changing - retrieve all of the parameters needed to start a translation and prepare the form.
            var text = this.textarea.value;

            var base = jxlate.ui.mode_bases[mode];
            var newbase = jxlate.ui.mode_bases[newmode];

            jxlate.ui.toolbox.switch(newbase);
            if (text === "")
                return;

            //easter egg / credits
            if (base === "32r" && newbase === 64 && text === "uuddlrlrba")
                return foo(jxlate.ui.textarea);

            text = jxlate.ui.convertText(text, base, newbase);
            jxlate.ui.textarea.value = text;
            jxlate.ui.textarea.focus();

        },

        isTextMode: function (m) {
            console.log('istextmode: ' + jxlate.ui.mode_bases[m] + " " + (jxlate.ui.mode_bases[m] === 256 || jxlate.ui.mode_bases[m] === 'ucs2' || jxlate.ui.mode_bases[m] === 'utf8'));
            return (jxlate.ui.mode_bases[m] === 256 || jxlate.ui.mode_bases[m] === 'ucs2' || jxlate.ui.mode_bases[m] === 'utf8');
        },

        
        init: function () {//set initial values and states
            if (this.mainForm === null) {
                this.mainForm = document.getElementById('frmInput');
                this.textarea=this.mainForm.elements["text"];
                this.setModeState(0);
                this.textarea.value = "";//clearing old form input
                this.textarea.focus();
            }
            document.getElementById('header').innerHTML = "JXlate " + fov("jxlate.html");//set the version text header



            var options = document.getElementById("options");
            if (options.addEventListener) {// add a listener for scrolling over the mode selector - allowing easier conversion
                options.addEventListener("mousewheel", this.events.MouseWheelHandler, false);// IE9, Chrome, Safari, Opera
                options.addEventListener("DOMMouseScroll", this.events.MouseWheelHandler, false);// Firefox
            } else
                options.attachEvent("onmousewheel", this.events.MouseWheelHandler);// IE 6/7/8

            if(typeof this.toolbox === null){
                console.error("UI Toolbox module was not ready - the toolbox will not function properly.");
                
            }else{
                this.toolbox.init(this.textarea);
                this.toolbox.addtooln(0);
                this.toolbox.addtooln(1);
                this.toolbox.addtooln(2);
                this.toolbox.addtooln(3);
                this.toolbox.addtooln(4);
            }
            
            setInterval(this.events.pollRadioBox, 100);//poll the radio selector for changes, using an event for this has some issues between browsers.
            
        },

        getCheckedRadioValue: function (sname) {//get the current value of a radio selector
            var radios = document.getElementsByName(sname);
            for (var i = 0, length = radios.length; i < length; i++)
                if (radios[i].checked)
                    return radios[i].value;
            return undefined;
        },
        
        events:{
            pollRadioBox: function () {//poll the UI for mode radio-box changes.
                //called by event - restrict everything to static references.
                var newmode = jxlate.ui.getCheckedRadioValue("mode");
                if (newmode !== jxlate.ui.mode) {//check if the selected radio button has been changed
                    console.log("changed! " + jxlate.ui.mode + "->" + newmode);
                    var oldmode = jxlate.ui.mode;
                    jxlate.ui.mode = newmode;//change the current mode value.
                    if (jxlate.ui.isTextMode(oldmode) && jxlate.ui.isTextMode(newmode)) {
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
            MouseWheelHandler: function (e) {//handle scrollwheel events
                // cross-browser wheel delta
                var e = window.event || e; // old IE support - this looks like an error though...
                var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));//calculate the number of steps the wheel has moved. (signed for direction)

                var target = -1;
                var radios = document.getElementsByName("mode");
                for (var i = 0, length = radios.length; i < length; i++)//find the current selected radio input
                    if (radios[i].checked) {
                        //console.log("i="+i);
                        target = jxlate.ui.modp(i - delta, jxlate.ui.mode_bases.length);
                        radios[i].checked = false;//target the (current-scrollclicks) radio, in visual order.
                    }
                //console.log(target);

                for (var j = 0, lengthj = radios.length; j < lengthj; j++)//find the targetted radio input and check it (will force a mode change and translation)
                    if (j === target)
                        radios[j].checked = true;



                return false;

            },
            iso8859info: function () {
                alert("This mode displays ISO-8859-1 (Latin-1) text - single bytes 00-FF (256)\n" +
                        "If you input unicode into this mode, it will be interpreted as two bytes.\n" +
                        "Use UCS-2 (Unicode code point values) or UTF-8 modes instead for unicode."
                        );
            }
        },
        setModeState: function (i) {
            //called by event - only use static references.
            jxlate.ui.mode = i;
            document.getElementById("rad" + i).checked = true;
        }

        /*
         function generateOption(parent){
         var el=document.createElement("li");
         }
         functions generateOptions(){
         var parent=document.getElementById("options");
         
         }
         */

    };
}