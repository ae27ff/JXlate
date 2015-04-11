function invertall() {
    var percent = '100%';
    /*if (!window.counter) {
        window.counter = 1;
    } else {
      window.counter++;
      if (window.counter % 2 == 0) {
          percent = '0%'
      }
    };   */

    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('style');

    var css = 'html {-webkit-filter: invert('+percent+');' +
        '-moz-filter: invert('+percent+');' +
        '-o-filter: invert('+percent+');' +
        '-ms-filter: invert('+percent+'); ' +
        'filter: invert('+percent+'); ';

    if (navegador()[0] == 'Firefox') {
        css += 'filter: url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'invert\'><feColorMatrix in=\'SourceGraphic\' type=\'matrix\' values=\'-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0\'/></filter></svg>#invert"); }';
    } else {
        css += ' } ';
    }

    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
}

function navegador(){
  var N= navigator.appName, ua= navigator.userAgent, tem;
  var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
  if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
  M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
  return M;
 }