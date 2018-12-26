
var jxlate = {//we're not really going to polymorphism here, so we can do with a regular object as a namespacing mechanism only.
    translator: null,
    formatter: null,
    ui: null,
    util: null,
    initializeUI: true,
    init: function(){
        this.util.init();
        this.formatter.init();
        this.translator.init();
        if(initializeUI) this.ui.init();
    }
};
