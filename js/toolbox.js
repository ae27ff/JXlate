if(typeof addcredits  == 'function') addcredits("toolbox.js",1.0,"crashdemons","Text formatting tools")


var tools=[
	['replace','Replace one phrase with another'],
	['case','Toggle letter case'],
	['length','Find the total length'],
	['reverse','Reverse all characters'],
	['shift','Apply Caesar shift'],
	['invert','Invert bit values'],
	['greverse','Reverse groupings only'],
	['stripspaces','Remove spaces'],
];

var toolsets=[];

var tbox;
var tbox_textarea;
var tbox_shown=false;
var tbox_case=true;

function tbox_init(textarea){
	tbox=document.getElementById('tbox');
	tbox_textarea=textarea;
	tbox_hide();

	toolsets[0]=[2];
	toolsets[2]=[0,2,3,5,6,7];//TODO: add word-reversal.
	toolsets[8]=[0,2,3,5,6];
	toolsets[10]=[0,2,3,5,6];
	toolsets[16]=[0,1,2,3,5,6,7];
	toolsets[32]=[2,7];
	toolsets[64]=[2,7];
	toolsets[85]=[2];
	toolsets[256]=[0,1,2,3,4];
}
function tbox_switch(modestr){
	tbox_clear();
	var m=parseInt(modestr);
	if(isNaN(m)) m=0;
	if(modestr==="ucs2" || modestr==="utf8") m=256;//allow text tools for unicode text modes.
	var ts=toolsets[m];
	for(var i=0;i<ts.length;i++) tbox_addtooln(ts[i]);
}

function tbox_show(){
	tbox.style.display='block';
}
function tbox_hide(){
	tbox.style.display='none';
}
function tbox_toggle(){
	if(tbox_shown) tbox_hide();
	else           tbox_show();
	tbox_shown=!tbox_shown;
}

function tbox_setpos(x,y){
	var t = tbox;
	t.style.left=x+"px";
	t.style.top=y+"px";
}
function tbox_clear(){
	var t = tbox;
	while (t.lastChild) {
		t.removeChild(t.lastChild);
	}
}

function tbox_addtooln(i){ tbox_addtool(tools[i][0],tools[i][1]); }
function tbox_addtool(sname,sdesc){
	var sfunc="tbox_action_"+sname;

	var t = tbox;

	var tool=document.createElement("div");
	tool.className="tool";


	var img=document.createElement("img");
	img.title=sdesc;
	img.alt=sname;
	img.src="img/"+sname+".png";
	img.style.borderStyle="none";
	img.onclick=eval(sfunc);

	t.appendChild(tool);
	tool.appendChild(img);

}

function tbox_action_debug(){
	alert("wat");
}

function tbox_action_replace(){
	var search=prompt("Enter the string to replace","");
	if(search===null) return;
	var replace=prompt("Enter the string to replace with","");
	if(replace===null) return;
	tbox_textarea.value=replaceAll(search,replace,tbox_textarea.value);
}
function tbox_action_case(){
	if(tbox_case) tbox_textarea.value=tbox_textarea.value.toUpperCase();
	else          tbox_textarea.value=tbox_textarea.value.toLowerCase();
	tbox_case=!tbox_case;
}
function tbox_action_length(){
	var l=tbox_textarea.value.length;
	var sl= strippedlen(tbox_textarea.value);
	var out="Total length: "+l;
	var base=mode_bases[mode];
	if(base===2){
		out+="\nBit length: "+sl;
		out+="\nBytes: "+(sl/8);
	}else if(base===16){
		out+="\nDigits: "+sl+" (nibbles)";
		out+="\nBytes: "+(sl/2);
	}
	alert(out);
}
function tbox_action_reverse(){
	tbox_textarea.value=reverse(tbox_textarea.value);
}
function tbox_action_shift(){
	var shift=prompt("Please enter the caesar shift value","13");
	if(shift===null) return;
	shift=parseInt(shift);
	if(shift===0) return;
	tbox_textarea.value=Caesar(1,tbox_textarea.value,shift);
}

function tbox_action_invert(){//NOTE: uses 'mode' and 'mode_bases' global from ui.js
	var  base=mode_bases[mode];
	var tmp = xlate_text(tbox_textarea.value,base,2);
	tmp=invertbits(tmp);
	tbox_textarea.value = xlate_text(tmp,2,base);
}
function tbox_action_greverse(){
	tbox_textarea.value=tbox_textarea.value.split("").reverse().join("").split(" ").reverse().join(" ")
}
function tbox_action_stripspaces(){
	tbox_textarea.value=replaceAll(" ","",tbox_textarea.value);
	tbox_textarea.value=replaceAll("\t","",tbox_textarea.value);
	tbox_textarea.value=replaceAll("\r","",tbox_textarea.value);
	tbox_textarea.value=replaceAll("\n","",tbox_textarea.value);
}
//==============================================


function strippedlen(str){
	str=replaceAll(" ","",str);
	str=replaceAll("\t","",str);
	str=replaceAll("\r","",str);
	str=replaceAll("\n","",str);
	return str.length;
}

function invertbits(str){
	str=replaceAll("0","X",str);
	str=replaceAll("1","Y",str);
	str=replaceAll("X","1",str);
	str=replaceAll("Y","0",str);
	return str;
}



function reverse(s){
    return s.split("").reverse().join("");
}
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}