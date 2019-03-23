if (typeof jxlate === "undefined") {
    console.error("JXlate branding module loaded before core.");
    jxlate={};//suppress warnings
}

/**
 * JXlate branding module for adding site-specific support information.
 * Note: branding does not appear by default.
 * @type {Object}
 */
jxlate.branding={
    init:function(){ },
    load:function(elementid) {
        document.getElementById(elementid).innerHTML='<object type="text/html" data="branding.html"></object>';
     }
};
