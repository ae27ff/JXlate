//poor coding by crashdemons
////NOTE - Javascript escape() internally uses UCS-2 (unicode code points 0000-FFFF)
//UTF-16 handles values over FFFF as does UTF-8

//ISO88591  256
// UTF8     utf8
// UCS2     65536


function utf8_to_iso88591(s) {
    return unescape(encodeURIComponent(s));
}
function iso88591_to_utf8(s) {
    console.log(s);
    console.log(escape(s));
    return decodeURIComponent(escape(s));
}
function ucs2_to_iso88591(s) {
    var bytes = "";
    for (var i = 0; i < s.length; i++) {
        var codeUnit = s.charCodeAt(i);
        bytes += String.fromCharCode(codeUnit >>> 8, codeUnit & 255);
    }
    return bytes;
}
function iso88591_to_ucs2(s) {
    if (s.length % 2 !== 0)
        throw "UCS-2 data must contain an even number of bytes";
    var hex = jxlate.ui.convertText(s, 256, 16);
    hex = hex.replaceAll(" ", "");
    var esc = "";
    for (var i = 0; i < hex.length; i += 4) {
        var uh = hex.substr(i, 4);
        while (uh.length < 4) {
            uh = "0" + uh;
        }//uh+="0"; ? this case is for malformed hex strings.
        esc += "%u" + uh;
    }
    return unescape(esc);
}
function convert_encoding(content, a, b) {
    console.log(content);
    var func = a + "_to_" + b;
    if ((typeof eval(func)) === "function")
        return eval(func + "(content)");
    //no direction conversion - do intermediate conversion to bytes then back.
    var tmp = eval(a + "_to_iso88591(content)");
    console.log("tmp=");
    console.log(tmp);
    return eval("iso88591_to_" + b + "(tmp)");
}
