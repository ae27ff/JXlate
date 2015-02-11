if(typeof addcredits === 'function') addcredits("xlate.js",8,"crashdemons","Binary Translation library for numeral systems (extensions added for encoding libraries)")

var b32hex="0123456789ABCDEFGHIJKLMNOPQRSTUV";//Triacontakaidecimal
var base_charsets=[];
fill_bases();


function fill_bases(){ for(var b=32;b>=0;b--) base_charsets[b]=b32hex.substr(0,b).split(""); }//set some charset options for use in conversion functions.

//check if the base ID is a numeral conversion or an encoding (external function)
function isEncodedBase(base){ return (base==="32r" ||base==="32h" ||base==="32c" || base===64 || base===85 || base==="mc" || base==="ue");}


//resolves any encodings before regular numeral conversions.
function array_prepareEncodings(a,baseFrom,baseTo){
	var fromEncoded=isEncodedBase(baseFrom);
	var toEncoded=isEncodedBase(baseTo);
	if( (!fromEncoded) && (!toEncoded) ) return [a,baseFrom,baseTo];//if the input unit array is neither encoded nor being encoded, just return it to array_base2base for numeral conversion.
	var s="";

	if(fromEncoded){//catch all of the encoded strings coming in that need to be decoded before translation.
		try{
			if(     baseFrom===64   ) s=atob(a[0]);
			else if(baseFrom==="ue" ) s=unescape(a[0]);//I know this is deprecated, but decodeURI does not do what I need.
			else if(baseFrom==="32r") s=base32rfc.decode(a[0]);
			else if(baseFrom==="32h") s=base32hex.decode(a[0]);
			else if(baseFrom==="32c") s=base32ckr.decode(a[0]);
			else if(baseFrom===85   ) s=  ascii85.decode(a[0]);
			else if(baseFrom==="mc" ) s=morse_decode(a);
		}catch(e){
			console.log("Encoding Error - Invalid encoded string");//do nothing - invalid baseX string should yield no output.
		}
		a=s.split("");//decode the single BaseX entry into chars (base256)
		baseFrom=256;//set up the parameter for the char->numeral array conversion.
	}
	if(toEncoded){//if the input is due to be translated to another base, let's do it here.
		a=array_base2base(a,baseFrom,256);//translate the array into char values if it isn't already.
		s=a.join("")
		if(     baseTo===64   ) a=[btoa(s)];
		else if(baseTo==="ue" ) a=[urlencode(s)];
		else if(baseTo==="32r") a=[base32rfc.encode(s)];
		else if(baseTo==="32h") a=[base32hex.encode(s)];
		else if(baseTo==="32c") a=[base32ckr.encode(s)];
		else if(baseTo===85   ) a=[  ascii85.encode(s)];
		else if(baseTo==="mc" ) a=[    morse_encode(s)];
		baseFrom=baseTo;//we've encoded this to the new base, so lets set From to the current state - which disables any base conversion in array_base2base
	}

	return [a,baseFrom,baseTo];//output modified parameters.
}
function array_base2base(a,baseFrom,baseTo){//convert arrays of numerals from one base to another - implements support for Base64
	var params=array_prepareEncodings(a,baseFrom,baseTo);//resolves any encodings before regular numeral conversions.
	a=params[0];//our prep function returns the parameters as an array after it's done, let's get them back where they need to be.
	baseFrom=params[1];
	baseTo=params[2];

	if(baseFrom===baseTo) return a;//the from and to bases are the same - no conversion necessary!
	for(var i=0,len=a.length;i<len;i++) a[i]=base2base(a[i], baseFrom, baseTo);//do a base conversion on each array element (unit in the From Base) to the To base.
	return a;
}


function base2base(snum, baseFrom, baseTo){//convert a numeral of one base system into another base system numeral
	if(baseFrom===baseTo) return snum;//same base - output the input
	var d=numeral2dec(snum,baseFrom);//convert numeral system A to decimal
	return dec2numeral(d,baseTo);//convert decimal to numeral system B
}


function numeral2dec(snum,sbase){
	base=parseInt(String(sbase).replace(/\D/g,''));

	if(base===10) return parseInt(snum);//decimal to decimal, nothing to do except make sure the output is an integer.
	if(base===256) return snum.charCodeAt(0);//single byte to decimal, easy enough.

	//numeral string representation to decimal, for each digit, decimal+=digitvalue*(base^place)
	var d=0;
	var imax=snum.length-1;
	for(var i=0;i<=imax;i++){
		var sdig=snum.substr(i,1);//current digit of numeral string
		var n=numeraldigit2dec(sdig,sbase);//retrieve the decimal value of the single digit in the numeral system
		var p=imax-i;//determine the 0-based 'place' in the numeral that the digit is at.  this is a reverse index in the range [imax,0]
		var v=n*Math.pow(base,p);//digitvalue*(base^place) to calculate the decimal value of the digit at it's 'place' in the numeral. (eg: F in F00 -> 3840)
		d+=v
		//console.log("i:"+i+" dig:"+sdig+" form: "+v+"="+n+"*("+base+"^"+p+")")
	}
	/*
	a bit insane and unreadable, but for fun:
	for (
		var i=0,d=0,imax=snum.length-1,sdig=0,n=0,p=0,v=0 ;
		i<=imax ;
		i++, sdig=snum.substr(i,1), n=numeraldigit2dec(sdig,sbase), p=imax-i, v=n*Math.pow(base,p), d+= v
	) {}
	return d;
	*/
	return d;
}


function dec2numeral(d,sbase){
	base=parseInt(String(sbase).replace(/\D/g,''));//replace any non-digit chars and cast/interpret to an Integer.

	if(base===10) return d.toString();//decimal to decimal, nothing to do except to ensure a String
	if(base===256) return String.fromCharCode(d);//decimal to byte, enough said

	//decimal to an arbitrary-base numeral string
	var snum="";
	while(d>0){
		var rem=d%base;//find last digit value of numeral
		var sdig=base_charsets[sbase][rem];//char representation of the digit
		d=Math.floor(d/base);//remove the last numeral digit from the integer (value-wise)
		snum=sdig+snum;//prepend because the last digit we process will be the most significant.
	}
	return (snum === '') ? "0" : snum;
}


function numeraldigit2dec(sdig,base){//retrieve the decimal value of a single digit in a numeral system
	var idx=base_charsets[base].indexOf(sdig);
	// there will be a problem here when your indexOf is the first character, since
	// you return 0 if it's not found, but indexOf will return 0 if the first char
	// is the matched item -CZ

	// No problem there, that's what I intended as far as Base2 through 16: Invalid digits become null in valid (0 value).
	// If this becomes a problem later we can return -1 and add a check to numeral2dec() and maybe not append it at all
	// -CD

	return (idx === -1) ? 0 : idx;
}

//encodeURI is the sucessor to this, but it encodes LESS chars, some of which urlencode() does
//of particular interest, & and /  don't get encoded, which can lead to urlencoded inputs breaking URLs.
//escape() is deprecated (why?) but it catches more of these cases
function urlencode(s){
	return escape(s).replace("+","%2B");//inputs with + should be encoded as well... (escape converts spaces to %20)
}
