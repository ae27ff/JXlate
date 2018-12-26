if (typeof addcredits === 'function')
    addcredits("xlate.format.js", 12, "crashdemons", "Numeral System formatting functions");

if (typeof jxlate === "undefined") {
    console.error("JXlate module loaded before core.");
} else {
    jxlate.formatter = {
        init: function () {},
        //preformatter function that changes and splits the text to an array of single units for array_base2base to translate.
        //non-numeral strings and encodings tend to have just a single item.
        input2buffer: function (s, base) {
            if (base == 256) {
                return s.split("");//strings are split by char
            } else if (base === "ue" || base === "ucs2" || base === "utf8") {
                return [s];//urlencode is handled all was 1 item passed to a function
            } else if (base == 2) {
                return s.replace(/\s/g, '').match(/.{1,8}/g);//strip spaces and split into 8-bit entries for binary.
            } else if (base == 16) {
                return s.toUpperCase().replace(/\s/g, '').match(/.{1,2}/g);//strip spaces and split into 2-digit entries for hex
            } else if (base === "32r" || base === "32h" || base === "32c") {
                return [s.replace(/\s/g, '').toUpperCase()];//strip spaces spaces and uppercase as a single item for Base32 decoding.
            } else if (base == 64) {
                return [s.replace(/\s/g, '')];//similar to the above, but for Base64 decoding all as one item.
            } else if (base == 85) {
                s = s.replace(/\s/g, '');
                if (s.substr(0, 2) !== "<~")
                    s = "<~" + s;//allow inputs without the adobe marker characters - our decoder requires them.
                if (s.substr(-2, 2) !== "~>")
                    s += "~>";
                return [s];//single item to pass to decoder.
            }
            s = s.replace(/\s+/g, ' ');
            return s.toUpperCase().split(" ");//all other items are split by spaces.
        },

        //postformatter function that joins and changes the output from array_base2base to be readable.
        buffer2output: function (a, base) {
            if (base == 256 || base === "ucs2" || base === "utf8") {
                return this.strstripnongraph(a.join(""));//do not display any special/control characters etc.
            } else if (base == 2) {
                for (var i = 0; i < a.length; i++)
                    a[i] = this.padZeroes(a[i], 8);//make sure the binary output is in groups of 8 bits all displayed.
            } else if (base == 16) {
                for (var j = 0; j < a.length; j++)
                    a[j] = this.padZeroes(a[j], 2);//make sure hex shows both 2 digits for each byte
            } else if (base === "32r" || base === "32h" || base === "32c" || base == 64 || base == 85 || base === "mc" || base === "ue") {
                return a[0];//various encodings return a single item result.
            }
            return a.join(" ");
        },

        //general purpose formatting
        /*escapeRegExp: function (string) {
         return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
         },*/
        padZeroes: function (num, size) {//pad a numerical string with 0's to reach a certain length
            var s = num + "";
            while (s.length < size)
                s = "0" + s;
            return s;
        },
        strstripnongraph: function (s) {//remove non-graphing chars.
            var out = "";
            for (var i = 0; i < s.length; i++) {
                var a = s.charCodeAt(i);
                if (this.isGraphable(a))
                    out += s.substr(i, 1);
                else
                    out += " ";//replace nongraphing with spaces, actually - not splitting.
            }
            return out;
        },
        isReadable: function (a) {//graphing ASCII chars, determined by charcode value
            return ((a >= 0x20 && a <= 0x7E) || a === 0x0d || a === 0x0a || a === 0x09);
        },
        isGraphable: function (a) {//additional graphing ISO-8859-1 chars, determined by charcode value
            return (a !== 0);
            //return ( isReadable(a) || (a>=0xA0 && a<=0xFF));
        }
    };
}
