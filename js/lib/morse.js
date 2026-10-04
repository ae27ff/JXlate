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
    character_set: " ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.,?'!/()&:;=+-_\"$@",
    
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
        "-----",

        // Punctuation from ITU-R M.1677-1, plus the common ! & ; _ $ extensions.
        ".-.-.-", // .
        "--..--", // ,
        "..--..", // ?
        ".----.", // '
        "-.-.--", // !
        "-..-.",  // / (literal slash; the standalone / token represents a space)
        "-.--.",  // (
        "-.--.-", // )
        ".-...",  // &
        "---...", // :
        "-.-.-.", // ;
        "-...-",  // =
        ".-.-.",  // +
        "-....-", // -
        "..--.-", // _
        ".-..-.", // "
        "...-..-", // $
        ".--.-."  // @
    ],
    
    /**
     * Decode an array of morse codes to text
     * @param {Array} arr the array of individual morse code strings to decode
     * @return {String} the corresponding text; unsupported codes are rejected.
     */
    decode: function (arr) {
        var str = "";
        for (var i = 0, len = arr.length; i < len; i++) {//foreach array item (1 char, encoded in morse)
            var idx = morse.codes.indexOf(arr[i]);//find the index in our array
            if (arr[i] === "")
                continue;
            if (idx === -1)
                throw "unsupported Morse code: " + arr[i];
            str += morse.character_set[idx];
        }
        return str;
    },
    
    /**
     * Encode an array of text characters to morse codes
     * @param {Array} arr the array of individual characters to encode
     * @return {String} the corresponding code string; unsupported characters are rejected.
     */
    encode: function (arr) {
        var str = "";
        for (var i = 0, len = arr.length; i < len; i++) {//foreach array item (1 char)
            var character = arr[i].toUpperCase();
            var idx = character.length === 1 ? morse.character_set.indexOf(character) : -1;
            if (idx === -1)
                throw "unsupported Morse character: " + arr[i];
            str += morse.codes[idx] + " ";
        }
        return str;
    }
};
