if(typeof addcredits  == 'function') addcredits("xlate.format.js",8,"crashdemons","Numeral System formatting functions")

function input2buffer(s,base){
	if(base==256){
		return s.split("");
	}else if(base=="ue"){
		return [s]
	}else if(base==2){
		return s.replace(/ /g,'').match(/.{1,8}/g);//strip spaces and split into 8-bit entries
	}else if(base==16){
		return s.toUpperCase().replace(/ /g,'').match(/.{1,2}/g);//strip spaces and split into 2-digit entries.
	}else if(base=="32r" ||base=="32h" ||base=="32c"){
		return [s.replace(/\s/g, '').toUpperCase()]
	}else if(base==64){
		return [s.replace(/\s/g, '')]
	}else if(base==85){
		s=s.replace(/\s/g, '');
		if(s.substr( 0,2)!="<~") s="<~"+s;//allow inputs without the adobe marker characters.
		if(s.substr(-2,2)!="~>") s+="~>";
		return [s]
	}
	return s.split(" ");
}
function buffer2output(a,base){
	if(base==256){
		return strstripnongraph(a.join(""));
	}else if(base==2){
		for(var i=0;i<a.length;i++) a[i]=pad(a[i],8);
	}else if(base==16){
		for(var i=0;i<a.length;i++) a[i]=pad(a[i],2);
	}else if(base=="32r" ||base=="32h" ||base=="32c" || base==64 || base==85 || base=="mc" || base=="ue"){
		return a[0];
	}
	return a.join(" ");
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
function strstripnongraph(s){
	var out="";
	for(var i=0;i<s.length;i++){
		a=s.charCodeAt(i);
		if(isGraphable(a)) out+=s.substr(i,1)
		else out+=" ";
	}
	return out
}
function isReadable(a){//graphing ASCII chars
	return ( (a>=0x20 && a<=0x7E) || a==0x0d || a==0x0a || a==0x09 );
}
function isGraphable(a){//graphing byte values
	return ( isReadable(a) || (a>=0xA0 && a<=0xFF));
}
