if(typeof addcredits === 'function') addcredits("unicode.js",1,"crashdemons","Character encoding conversion functions")

//NOTE - Javascript escape() internally uses UCS-2 (unicode code points 0000-FFFF)
//UTF-16 handles values over FFFF as does UTF-8

//ISO88591  256
// UTF8     utf8
// UCS2     65536


function utf8_to_iso88591(s) {
  return unescape(encodeURIComponent(s));
}
function iso88591_to_utf8(s) {
	console.log(s);
	console.log(escape(s));
  return decodeURIComponent(escape(s));
}
function ucs2_to_iso88591(s){
	var hex=""
	var uchars=s.split("")
	console.log(s);
	console.log(uchars);
	for(var i=0;i<s.length;i++){
		var c=s.charAt(i);
		var u=s.charCodeAt(i);
		if(u>=0x100){//unicode characters
			hex+=xlate_text(c,256,16);//char to hex value - euro->20AC
		}else{//characters under ISO-8859-1 already
			hex+="00"+xlate_text(c,256,16);//char to null+hex 'z'->005A
		}
	}

	return xlate_bytesNF(hex,16);
}
function iso88591_to_ucs2(s){
	var hex=xlate_text(s,256,16);
	hex=replaceAll(" ","",hex);
	var esc="";
	for(var i=0;i<hex.length;i+=4){
		var uh=hex.substr(i,4);
		while(uh.length<4){ uh="0"+uh; }//uh+="0"; ? this case is for malformed hex strings.
		esc+="%u"+uh;
	}
	return unescape(esc);
}
function convert_encoding(content,a,b){
	console.log(content);
	var func=a+"_to_"+b;
	if( (typeof eval(func))==="function") return eval(func+"(content)");
	//no direction conversion - do intermediate conversion to bytes then back.
	var tmp=eval(a+"_to_iso88591(content)");
	console.log("tmp=");
	console.log(tmp);
	return eval("iso88591_to_"+b+"(tmp)");
}