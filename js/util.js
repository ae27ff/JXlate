
if (typeof jxlate === "undefined") {
    var jxlate={};//suppress warnings
    console.error("JXlate module loaded before core.");
}

/**
 * Object containing utility methods for JXlate
 * @type {Object}
 */
jxlate.util = {
    init: function () {},
    modp: function (n, d) {//modulo that causes smaller negatives (|n|<d) to count from the righthand side (max value) instead of the stock behavior.
        if (!isFinite(n) || !isFinite(d) || d <= 0)
            throw "modulo requires a finite value and a positive finite divisor";
        var remainder = n % d;
        return remainder < 0 ? remainder + d : (remainder === 0 ? 0 : remainder);
    },
    stobuf: function(str) {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i=0, strLen=str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
          if(str.charCodeAt(i)<0 || str.charCodeAt(i)>255){
              console.log("!!! "+str.charCodeAt(i));
          }
        }
        return buf;
    }
};



String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
    //return this.replace(new RegExp(this.escapeRegExp(target), 'g'), replacement);
};

String.prototype.reverse = function () {
    var characters = [];
    for (var i = 0; i < this.length; i++) {
        var codeUnit = this.charCodeAt(i);
        if (codeUnit >= 0xD800 && codeUnit <= 0xDBFF && i + 1 < this.length) {
            var nextCodeUnit = this.charCodeAt(i + 1);
            if (nextCodeUnit >= 0xDC00 && nextCodeUnit <= 0xDFFF) {
                characters.push(this.substr(i, 2));
                i++;
                continue;
            }
        }
        characters.push(this.charAt(i));
    }
    return characters.reverse().join("");
};

String.prototype.stripWhitespace = function () {
    return this
            .replaceAll(" ", "")
            .replaceAll("\t", "")
            .replaceAll("\r", "")
            .replaceAll("\n", "");
};
