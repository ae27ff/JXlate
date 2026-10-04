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
    var encoders = {utf8: utf8_to_iso88591, ucs2: ucs2_to_iso88591};
    var decoders = {utf8: iso88591_to_utf8, ucs2: iso88591_to_ucs2};
    if (a !== "iso88591" && !Object.prototype.hasOwnProperty.call(encoders, a))
        throw "unsupported source encoding";
    if (b !== "iso88591" && !Object.prototype.hasOwnProperty.call(decoders, b))
        throw "unsupported target encoding";
    if (a === b)
        return content;
    var bytes = a === "iso88591" ? content : encoders[a](content);
    return b === "iso88591" ? bytes : decoders[b](bytes);
}
