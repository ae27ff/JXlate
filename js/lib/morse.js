//poor coding by crashdemons

/**
 * Morse code decoder object
 * @author crashdemons
 * @type {Object}
 */
var morse = {
    /**
     * All characters supported for morse encoding
     * @type {String}
     */
    character_set: " ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    
    /**
     * Array of all morse codes supported.
     * 
     * This array should correspond 1:1 with character_set.
     * @type {Array}
     */
    codes: [
        "/",
        ".-",
        "-...",
        "-.-.",
        "-..",
        ".",
        "..-.",
        "--.",
        "....",
        "..",
        ".---",
        "-.-",
        ".-..",
        "--",
        "-.",
        "---",
        ".--.",
        "--.-",
        ".-.",
        "...",
        "-",

        "..-",
        "...-",
        ".--",
        "-..-",
        "-.--",
        "--..",

        ".----",
        "..---",
        "...--",
        "....-",
        ".....",
        "-....",
        "--...",
        "---..",
        "----.",
        "-----"
    ],
    
    /**
     * Decode an array of morse codes to text
     * @param {Array} arr the array of individual morse code strings to decode
     * @return {String} the corresponding text for the morse codes ("?" is returned for unsupported codes).
     */
    decode: function (arr) {
        var str = "";
        for (var i = 0, len = arr.length; i < len; i++) {//foreach array item (1 char, encoded in morse)
            var idx = morse.codes.indexOf(arr[i]);//find the index in our array
            if (arr[i] === "")
                continue;
            str += (idx === -1) ? "?" : morse.character_set[idx];//append the cleartext version (aligned to the same index) if any, if not "?"
        }
        return str;
    },
    
    /**
     * Encode an array of text characters to morse codes
     * @param {Array} arr the array of individual characters to encode
     * @return {String} the corresponding string of morse code and separators (" " is returned for unsupported characters).
     */
    encode: function (arr) {
        var str = "";
        for (var i = 0, len = arr.length; i < len; i++) {//foreach array item (1 char)
            idx = morse.character_set.indexOf(arr[i].toUpperCase());//find the index in our charset string
            str += (idx === -1) ? " " : morse.codes[idx] + " ";//append the morse translation if any, if not " "
        }
        return str;
    }
};
