/* @P2@ */
if(typeof addcredits  == 'function') addcredits("ui.js",2.0,"crashdemons","JXlate UI script and overarching operations.")
var oForm=null;
var mode=0;
var mode_bases=[256,'mc',2,8,10,16,'32r','32h','32c',64,85,'ue','ucs2','utf8'];//values used internally to represent each base in shorthand.
//var mode_names=['Text','Morse','Binary','Octal','Decimal','Hexadecimal','Base32Rfc','Base32Hex','Base32Ckr','Base64','Ascii85','UrlEncode'];//unused array

function xlate_bytesNF(s,baseFrom){//translate a string from one base to another
	var a=input2buffer(s,baseFrom);//preformat the input into an array of units in that base
	a=array_base2base(a,baseFrom,256);//process the array for conversion
	return a.join("")
}

function xlate_text(s,baseFrom,baseTo){//translate a string from one base to another
	var a=input2buffer(s,baseFrom);//preformat the input into an array of units in that base
	a=array_base2base(a,baseFrom,baseTo);//process the array for conversion
	return buffer2output(a,baseTo);//postformat the output back into readable form.
}
function xlate_switch(mode,newmode){//mode is changing - retrieve all of the parameters needed to start a translation and prepare the form.
	text=oForm.elements["text"].value;

	base=mode_bases[mode];
	newbase=mode_bases[newmode];

	tbox_switch(newbase);
	if(text=="") return;


	if(base=="32r" && newbase==64 && text=="uuddlrlrba") return foo(oForm.elements["text"]);

	text=xlate_text(text,base,newbase);
	oForm.elements["text"].value=text;
	oForm.elements["text"].focus();

}
function xlate_poll(){//poll the UI for mode radio-box changes.
	//console.log("x");
	var newmode=getCheckedRadioValue("mode");
	if(newmode!=mode){//check if the selected radio button has been changed
		console.log("changed! "+mode+"->"+newmode);
		var oldmode=mode;
		mode=newmode;//change the current mode value.
		try{
			xlate_switch(oldmode,newmode);//trigger a translation
		}catch(e){
			setMode(oldmode);
			alert("This value could not be converted as specified.\nPlease make sure it is valid.")
		}
		console.log("conversion complete");
	}
}
function xlate_init(){//set initial values and states
	if(oForm==null){
		oForm=document.getElementById('frmInput');
		setMode(0);
		oForm.elements["text"].value="";//clearing old form input
		oForm.elements["text"].focus();
	}
	document.getElementById('header').innerHTML = "JXlate "+fov("jxlate.html");//set the version text header



	var options = document.getElementById("options");
	if (options.addEventListener) {// add a listener for scrolling over the mode selector - allowing easier conversion
		options.addEventListener("mousewheel", MouseWheelHandler, false);// IE9, Chrome, Safari, Opera
		options.addEventListener("DOMMouseScroll", MouseWheelHandler, false);// Firefox
	}
	else options.attachEvent("onmousewheel", MouseWheelHandler);// IE 6/7/8


	tbox_init(oForm.elements["text"]);
	tbox_addtooln(0);
	tbox_addtooln(1);
	tbox_addtooln(2);
	tbox_addtooln(3);
	tbox_addtooln(4);

	setInterval("xlate_poll()",100);//poll the radio selector for changes, using an event for this has some issues between browsers.
}

function getCheckedRadioValue(sname){//get the current value of a radio selector
	var radios = document.getElementsByName(sname);
	for (var i = 0, length = radios.length; i < length; i++) if (radios[i].checked) return radios[i].value;
	return undefined;
}

function MouseWheelHandler(e) {//handle scrollwheel events
	// cross-browser wheel delta
	var e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));//calculate the number of steps the wheel has moved. (signed for direction)

	var target=-1;
	var radios = document.getElementsByName("mode");
	for (var i = 0, length = radios.length; i < length; i++)//find the current selected radio input
		if (radios[i].checked){
			//console.log("i="+i);
			target=modp(i-delta,mode_bases.length); radios[i].checked=false;//target the (current-scrollclicks) radio, in visual order.
		}
	//console.log(target);

	for (var i = 0, length = radios.length; i < length; i++)//find the targetted radio input and check it (will force a mode change and translation)
		if (i==target) radios[i].checked=true;



	return false;

}
function modp(n,d){//modulo that causes smaller negatives (|n|<d) to count from the righthand side (max value) instead of the stock behavior.
	while(n<0) n+=d;
	return (n%d);
}

function iso8859info(){
	alert("This mode displays ISO-8859-1 (Latin-1) text - single bytes 00-FF (256)\n"+
	"If you input unicode into this mode, it will be interpreted as two bytes.\n"+
	"Use UCS-2 (Unicode code point values) or UTF-8 modes instead for unicode."
	)
}
function setMode(i){
	mode=i;
	document.getElementById("rad"+i).checked=true
}

/*
function generateOption(parent){
	var el=document.createElement("li");
}
functions generateOptions(){
	var parent=document.getElementById("options");

}
*/