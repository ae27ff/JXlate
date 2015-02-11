if(typeof addcredits  == 'function') addcredits("morse.js",2,"crashdemons","Morse code translator functions")

var morse_cs=" ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
var morse_cd=[
	"/",
	".-",
	"-...",
	"-.-.",
	"-..",
	".",
	"..-.",
	"--.",
	"....",
	"..",
	".---",
	"-.-",
	".-..",
	"--",
	"-.",
	"---",
	".--.",
	"--.-",
	".-.",
	"...",
	"-",

	"..-",
	"...-",
	".--",
	"-..-",
	"-.--",
	"--..",


	".----",
	"..---",
	"...--",
	"....-",
	".....",
	"-....",
	"--...",
	"---..",
	"----.",
	"-----"
]


function morse_decode(arr){
	var str="";
	var j=0;
	for(var i=0;i<arr.length;i++){
		j=morse_cd.indexOf(arr[i]);
		if(arr[i]=="") continue;
		if(j<0) str+="?";
		else str+=morse_cs[j];
	}
	return str;
}
function morse_encode(arr){
	var morse="";
	var j=0;
	for(var i=0;i<arr.length;i++){
		j=morse_cs.indexOf(arr[i].toUpperCase());
		if(j<0) morse+=" ";
		else morse+=morse_cd[j]+" ";
	}
	return morse;
}