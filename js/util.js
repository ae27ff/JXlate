
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
        while (n < 0)
            n += d;
        return (n % d);
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