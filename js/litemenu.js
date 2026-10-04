

if (typeof jxlate.ui === "undefined") {
    var jxlate = {};//suppress warnings
    console.error("JXlate UI module loaded before core.");
}

jxlate.ui.litemenu={
    sidebar:null,
    options:null,
    button:null,
    opened:false,
    init:function(){
        this.sidebar=document.getElementById("sidebar");
        this.options=document.getElementById("options");
        this.button=document.getElementById("lite-menu-button");
        this.createToolboxLabel(document.getElementsByClassName("toolopen")[0]);
    },
    createToolboxLabel:function(tool_div){
        if(tool_div.children.length > 1) return;
        var tool_img=tool_div.children[0];
        var label=document.createElement("span");
        label.className="lite-tool-description";
        label.textContent=tool_img.title;
        tool_div.appendChild(label);
        tool_img.title="";
    },
    createToolboxLabels:function(){
        var tool_items=document.getElementsByClassName("tool");
        for(var i=0;i<tool_items.length;i++)
            this.createToolboxLabel(tool_items[i]);
    },
    showOptions:function(){
        this.options.style.display = 'block';
    },
    hideOptions:function(){
        this.options.style.display = 'none';
    },
    open:function(){
        this.showOptions();
        this.button.style.backgroundColor="#002710";//#3F3F3F
        this.sidebar.style.display = 'block';
        this.opened=true;
    },
    close:function(){
        jxlate.ui.toolbox.events.hide();
        this.button.style.backgroundColor="#3F3F3F";//#3F3F3F
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
            jxlate.ui.toolbox.events.show();
            jxlate.ui.litemenu.createToolboxLabels();
            jxlate.ui.litemenu.closeParent();
        }
    }
};
