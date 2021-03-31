/**
 * JXlate main object containing all modules and top-level information.
 * @type {Object}
 */
var jxlate = {//we're not really going to polymorphism here, so we can do with a regular object as a namespacing mechanism only.
    /**
     * The current major versions of JXlate, usually represented as a "X.Y".
     * 
     * This is not guaranteed to be a number, so you should convert to string first before parsing.
     * @type {Number}
     */
    version: "3.3-alpha",
    
    /**
     * Property containing JXlate Translator module object, when available.
     * @type {Object}
     */
    translator: null,
    
    /**
     * Property containing JXlate Formatter module object, when available.
     * @type {Object}
     */
    formatter: null,
    
    /**
     * Property containing JXlate UI module object, when available.
     * @type {Object}
     */
    ui: null,
    
    /**
     * Property containing JXlate Util module object, when available.
     * @type {Object}
     */
    util: null,
    
    /**
     * Property containing JXlate Branding module object, when available.
     * By default, branding does not appear.
     * @type {Object}
     */
    branding: null,
    
    /**
     * Sets whether the UI module should be initialized during init - for use in projects without the main UI.
     * 
     * Controls whether ui.init() is called during init() only.
     * @see jxlate.init
     * @type {Boolean}
     */
    initializeUI: true,
    
    /**
     * Initialize JXlate and all relevant modules.
     * 
     * Note: If "initializeUI" property is false, the UI module will not be initialized.
     * @see jxlate.initializeUI
     * @return {undefined}
     */
    init: function(){
        this.util.init();
        this.formatter.init();
        this.translator.init();
        this.branding.init();
        if(this.initializeUI) this.ui.init();
    }
};
