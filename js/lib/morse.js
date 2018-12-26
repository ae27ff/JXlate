//poor coding by crashdemons

var morse={
    character_set: " ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    codes:[
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
    decode:function(arr){
        var str = "";
        for (var i = 0, len = arr.length; i < len; i++) {//foreach array item (1 char, encoded in morse)
            var idx = morse.codes.indexOf(arr[i]);//find the index in our array
            if (arr[i] === "")
                continue;
            str += (idx === -1) ? "?" : morse.character_set[idx];//append the cleartext version (aligned to the same index) if any, if not "?"
        }
        return str;
    },
    encode:function(arr){
        var str = "";
        for (var i = 0, len = arr.length; i < len; i++) {//foreach array item (1 char)
            idx = morse.character_set.indexOf(arr[i].toUpperCase());//find the index in our charset string
            str += (idx === -1) ? " " : morse.codes[idx] + " ";//append the morse translation if any, if not " "
        }
        return str;
    }
};
