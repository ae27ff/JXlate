if (typeof addcredits === 'function')
    addcredits("morse.js", 2, "crashdemons", "Morse code translator functions");

var morse_cs = " ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";//morse code charset
//array of mose-code versions of the above.
var morse_cd = [
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
];


function morse_decode(arr) {
    var str = "";
    for (var i = 0, len = arr.length; i < len; i++) {//foreach array item (1 char, encoded in morse)
        idx = morse_cd.indexOf(arr[i]);//find the index in our array
        if (arr[i] === "")
            continue;
        str += (idx === -1) ? "?" : morse_cs[idx];//append the cleartext version (aligned to the same index) if any, if not "?"
    }
    return str;
}
function morse_encode(arr) {
    var morse = "";
    for (var i = 0, len = arr.length; i < len; i++) {//foreach array item (1 char)
        idx = morse_cs.indexOf(arr[i].toUpperCase());//find the index in our charset string
        morse += (idx === -1) ? " " : morse_cd[idx] + " ";//append the morse translation if any, if not " "
    }
    return morse;
}
