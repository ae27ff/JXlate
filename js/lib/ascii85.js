if(typeof addcredits  === 'function') addcredits("ascii85.js",2009,"Jacob Rus","Ascii85 Encoder");

/*
JavaScript Base64 and Ascii85 encoder/decoder, by Jacob Rus.

--------------------

Copyright (c) 2009 Jacob Rus

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var shorten = function (array, number) {
  // remove 'number' characters from the end of 'array', in place (no return)
  for (var i = number; i > 0; i--) { array.pop(); };
};
var rstrip = function (string, character) {
  // strip trailing 'character' characters from the end of the string 'string'
  var i = string.length;
  while (string[i - 1] === character) { i--; };
  return string.slice(0, i);
};

var ascii85 = this.ascii85 = (function () {
  var ascii85 = {};
  ascii85.Ascii85CodecError = function (message) { this.message = message; };
  ascii85.Ascii85CodecError.prototype.toString = function () {
    return 'Ascii85CodecError' + (this.message ? ': ' + this.message : '');
  };
  var assertOrBadInput = function (expression, message) {
    if (!expression) { throw new ascii85.Ascii85CodecError(message) };
  };
  ascii85.encode = function (bytes) {
    assertOrBadInput(!(/[^\x00-\xFF]/.test(bytes)), 'Input contains out-of-range characters.'); // disallow two-byte chars
    var padding = '\x00\x00\x00\x00'.slice((bytes.length % 4) || 4);
    bytes += padding; // pad with null bytes
    var out_array = [];
    for (var i=0, n=bytes.length; i < n; i+=4) {
      var newchars = (
        (bytes.charCodeAt(i)   << 030) +
        (bytes.charCodeAt(i+1) << 020) +
        (bytes.charCodeAt(i+2) << 010) +
        (bytes.charCodeAt(i+3)));
      if (newchars === 0) {
        out_array.push(0x7a); // special case: 4 null bytes -> 'z'
        continue;
      };
      var char1, char2, char3, char4, char5;
      char5 = newchars % 85; newchars = (newchars - char5) / 85;
      char4 = newchars % 85; newchars = (newchars - char4) / 85;
      char3 = newchars % 85; newchars = (newchars - char3) / 85;
      char2 = newchars % 85; newchars = (newchars - char2) / 85;
      char1 = newchars % 85;
      out_array.push(char1 + 0x21, char2 + 0x21, char3 + 0x21,
                     char4 + 0x21, char5 + 0x21);
    };
    shorten(out_array, padding.length);
    return '<~' + String.fromCharCode.apply(String, out_array) + '~>'
  };
  ascii85.decode = function (a85text) {
    assertOrBadInput ((a85text.slice(0,2) === '<~') && (a85text.slice(-2) === '~>'), 'Invalid initial/final ascii85 characters');
    // kill whitespace, handle special 'z' case
    a85text = a85text.slice(2,-2).replace(/\s/g, '').replace('z', '!!!!!');
    assertOrBadInput(!(/[^\x21-\x75]/.test(a85text)), 'Input contains out-of-range characters.');
    var padding = '\x75\x75\x75\x75\x75'.slice((a85text.length % 5) || 5);
    a85text += padding; // pad with 'u'
    var newchars, out_array = [];
    var pow1 = 85, pow2 = 85*85, pow3 = 85*85*85, pow4 = 85*85*85*85;
    for (var i=0, n=a85text.length; i < n; i+=5) {
      newchars = (
        ((a85text.charCodeAt(i)   - 0x21) * pow4) +
        ((a85text.charCodeAt(i+1) - 0x21) * pow3) +
        ((a85text.charCodeAt(i+2) - 0x21) * pow2) +
        ((a85text.charCodeAt(i+3) - 0x21) * pow1) +
        ((a85text.charCodeAt(i+4) - 0x21)));
      out_array.push(
        (newchars >> 030) & 0xFF,
        (newchars >> 020) & 0xFF,
        (newchars >> 010) & 0xFF,
        (newchars)        & 0xFF);
    };
    shorten(out_array, padding.length);
    return String.fromCharCode.apply(String, out_array);
  };
  return ascii85;
})();

// var hobbes = (
//   'Man is distinguished, not only by his reason, but by this ' +
//   'singular passion from other animals, which is a lust of the mind, that ' +
//   'by a perseverance of delight in the continued and indefatigable ' +
//   'generation of knowledge, exceeds the short vehemence of any carnal ' +
//   'pleasure.'
// );
// var a85testencode = ascii85.encode(hobbes);
// var a85testdecode = ascii85.decode(a85testencode);
// var b64testencode = base64.encode(hobbes);
// var b64testdecode = base64.decode(b64testencode);
// var b64utestencode = base64_urlsafe.encode(hobbes);
// var b64utestdecode = base64_urlsafe.decode(b64utestencode);
// console.log('Original:\n' + hobbes);
// console.log('Ascii85:\n' + a85testencode);
// console.log('Decoded:\n' + a85testdecode);
// console.log('Base64:\n' + b64testencode);
// console.log('Decoded:\n' + b64testdecode);
// console.log('Base64 URL:\n' + b64utestencode);
// console.log('Decoded:\n' + b64utestdecode);

