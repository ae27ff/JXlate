
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
        //console.log(n,d);
        while (n < 0)
            n += d;
        //console.log(n%d);
        return (n % d);
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
    return this.split("").reverse().join("");
};

String.prototype.stripWhitespace = function () {
    return this
            .replaceAll(" ", "")
            .replaceAll("\t", "")
            .replaceAll("\r", "")
            .replaceAll("\n", "");
};