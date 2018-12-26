
if (typeof jxlate === "undefined") {
    console.error("JXlate module loaded before core.");
    jxlate={};//suppress warnings
}

/**
 * JXlate data formatter object
 * @type {Object}
 */
jxlate.formatter = {
    /**
     * Initialize the object.
     * @return {undefined}
     */
    init: function () {},
    
    /**
     * Preformatting function that changes and splits user-input into pieces that can be understood by the translator object.
     * 
     * Used to prepare data for jxlate.translator.array_base2base. non-numeral strings and encodings tend to have just a single item.
     * @param {String} s a string representing data in a particular numeral system
     * @param {String|number} base the numeral system of the string
     * @return {Array} an array of individual data pieces that can be handled by the translator
     */
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

    /**
     * Postformatting function that joins and changes translator output into a readable format.
     * 
     * Used to format output from array_base2base.
     * @param {Array} a an array of output data from translator methods.
     * @param {String|number} base the numeral system base to interpret the data as
     * @return {String} a human-readable string representing the data in the given numeral system
     */
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
    
    /**
     * Formatting function for left-padding zeroes to number strings.
     * @param {String} num The number to pad, as a string of digits.
     * @param {number} size The desired digit length to pad to.
     * @return {String} The number string, with any necessary zeroes prepended.
     */
    padZeroes: function (num, size) {//pad a numerical string with 0's to reach a certain length
        var s = num + "";
        while (s.length < size)
            s = "0" + s;
        return s;
    },
    
    /**
     * Replaces non-graphing characters from a string for display purposes.
     * 
     * Currently, this method only replaces null characters with spaces.
     * @param {type} s The string to strip
     * @return {String} The stripped string
     */
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
    
    /**
     * Determines if a charcode is a readable (visually present and not whitespace) character in ASCII.
     * @param {number} a the character code / ascii value to check
     * @return {Boolean} whether the character was readable.
     */
    isReadable: function (a) {//graphing ASCII chars, determined by charcode value
        return ((a >= 0x20 && a <= 0x7E) || a === 0x0d || a === 0x0a || a === 0x09);
    },
    /**
     * Determine if the character is graphable for display purposes.
     * 
     * Currently, this only excludes null characters.
     * @param {number} a the character code  / ascii value to check
     * @return {Boolean} whether the character was graphable.
     */
    isGraphable: function (a) {//additional graphing ISO-8859-1 chars, determined by charcode value
        return (a !== 0);
        //return ( isReadable(a) || (a>=0xA0 && a<=0xFF));
    }
};
