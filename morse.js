if(typeof addcredits === 'function') addcredits("morse.js",2,"crashdemons","Morse code translator functions")

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
	for(var i=0,len=arr.length;i<len;i++){
		idx=morse_cd.indexOf(arr[i]);
		if(arr[i]=="") continue;
		str+=(idx === -1) ? "?" : morse_cs[idx];
	}
	return str;
}
function morse_encode(arr){
	var morse="";
	for(var i=0,len=arr.length;i<len;i++){
		idx=morse_cs.indexOf(arr[i].toUpperCase());
		morse+=(idx === -1) ? " " : morse_cd[idx]+" ";
	}
	return morse;
}
