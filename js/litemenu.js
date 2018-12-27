

if (typeof jxlate.ui === "undefined") {
    var jxlate = {};//suppress warnings
    console.error("JXlate UI module loaded before core.");
}

jxlate.ui.litemenu={
    sidebar:null,
    options:null,
    opened:false,
    init:function(){
        this.sidebar=document.getElementById("sidebar");
        this.options=document.getElementById("options");
    },
    showOptions:function(){
        this.options.style.display = 'block';
    },
    hideOptions:function(){
        this.options.style.display = 'none';
    },
    open:function(){
        this.showOptions();
        this.sidebar.style.display = 'block';
        this.opened=true;
    },
    close:function(){
        jxlate.ui.toolbox.events.hide();
        this.sidebar.style.display = 'none';
        jxlate.ui.textarea.focus();
        this.opened=false;
    },
    closeParent:function(){
        this.sidebar.style.display = 'none';
    },
    toggle:function(){
        if(this.opened) this.close();
        else this.open();
    },
    events:{
        toggle:function(){ jxlate.ui.litemenu.toggle(); },
        toggleToolbox:function(){
            jxlate.ui.toolbox.events.toggle();
            jxlate.ui.litemenu.closeParent();
        }
    }
};