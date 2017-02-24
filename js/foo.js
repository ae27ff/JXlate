/* @P1@ */
var manifest=[];
if(typeof addcredits  == 'function') addcredits("foo.js",1.0,"crashdemons","Credits and Easter Egg script");

var foi=0
var foe=0;
var fos="";

function addcredits(fn,vr,au,ds){ manifest.push(Array(fn,vr,au,ds));}

function foo(o){
	foe=o;
	foe.value="";
	foe.focus();

	fos="Hello There.  You have accessed the seekrit credits list.\n";
	for(var i=0;i<manifest.length;i++)
		fos+="\n"+manifest[i][0]+" - v"+manifest[i][1]+" by "+manifest[i][2]+" - "+manifest[i][3];

	var foa=foc(fos);
	for(var i=0;i<foa.length;i++) foto(fos.charAt(i),foa[i])
}
function foto(ch,dv){
	setTimeout(
		function() {
				foe.value+=ch;
		},
		dv
	);

}
function fov(fn){
	for(var i=0;i<manifest.length;i++) if(fn==manifest[i][0]) return manifest[i][1];
	return "";
}

function foc(s){
	var fodt=0;
	var foa=s.split("")
	for(var i=0;i<foa.length;i++){
		fodt+=Math.floor((Math.random() * 150) + 1);

		var isLetterL=/[a-z]/g.test(foa[i]);
		var isLetterU=/[A-Z]/g.test(foa[i]);
		var isNumber=/[0-9]/g.test(foa[i]);
		var isWS=/\s/g.test(foa[i]);
		var dv=200;
		if     (isLetterL) dv=50;
		else if(isLetterU) dv=125;
		else if(isNumber ) dv=250;
		else if(isWS     ) dv=25;

		fodt+=dv + Math.floor((Math.random() * 50) + 1);
		foa[i]=fodt;
		if(isWS     ) fodt+=100;//delay next word beginning.
	}
	return foa
}