#cs
This is a developer script that generates versions of
The JXlate HTML with varying types of script includes
versions are as follows:
 + Dynamic (all separate JS files referenced from HTML)
 + Single (one concatenated JS file used)
 + Monolithic (a single standlone HTML file containing the concatenated JS)
#ce

#include <Array.au3>
FileChangeDir(@ScriptDir)
;collect all needed information about the source files
Global $js_files=GetFiles('src\js','*.js')
SortFiles($js_files)
Global $js=GetCompleteSource($js_files,@CRLF)
Global $html=FileRead('src\template.html')
Global $css=FileRead('src\jxlate.css')


;generate intermediate HTML
Global $scripttags_full=GetFileRefs($js_files,'<script src="','"></script>',@CRLF)
Global $styletags_full='<link rel="stylesheet" type="text/css" href="jxlate.css">'

;generate HTML output for each format
Global $html_monolithic=StringReplace($html,"<!-- @SCRIPTS@ -->",'<script>'&@CRLF&$js&@CRLF&'</script>')
Global $html_single=    StringReplace($html,"<!-- @SCRIPTS@ -->",'<script src="jxlate_single.js"></script>')
Global $html_full=      StringReplace($html,"<!-- @SCRIPTS@ -->",$scripttags_full)
$html_monolithic=       StringReplace($html_monolithic,"<!-- @STYLES@ -->",'<style>'&@CRLF&$css&@CRLF&'</style>')
$html_single=           StringReplace($html_single,    "<!-- @STYLES@ -->",$styletags_full)
$html_full=             StringReplace($html_full,      "<!-- @STYLES@ -->",$styletags_full)



;create distribution paths
DirRemove('dist',1)
DirCreate('dist')
DirCreate('dist/full')
DirCreate('dist/single')
DirCreate('dist/monolithic')

;create HTML files
FileWrite('dist/full/index.html',$html_full)
FileWrite('dist/single/index.html',$html_single)
FileWrite('dist/monolithic/index.html',$html_monolithic)

;create CSS files
FileCopy('src/jxlate.css','dist/full/jxlate.css')
FileCopy('src/jxlate.css','dist/single/jxlate.css')

;create JS files
DirCopy('src/js','dist/full/js')
FileWrite('dist/single/jxlate_single.js',$js)

Exit



;----------------------------------------------------------------------



Func GetFileRefs($files,$prefix,$suffix,$separator)
	Global $tags=''
	For $file In $files
		$file=StringTrimLeft($file,4);remove the "src\" path
		$file=StringReplace($file,'\','/')
		$tags&=$prefix&$file&$suffix&$separator
	Next
	Return $tags
EndFunc


Func GetCompleteSource($files,$separator)
	Local $source=''
	For $file In $files
		$source&=FileRead($file)&$separator
	Next
	Return $source
EndFunc



Func GetFiles($path,$pattern)
	Local $files[1]=['']
	;Local $path=@ScriptDir&"\src\js"
	Local $sh=FileFindFirstFile($path&"\"&$pattern)
	While 1
		Local $file=FileFindNextFile($sh)
		If @error Then ExitLoop
		$file=$path&"\"&$file
		If StringLen($files[0])=0 Then
			$files[0]=$file
		Else
			_ArrayAdd($files,$file,0,'','',1)
		EndIf
	WEnd
	FileClose($sh)
	Return $files
EndFunc

Func SortFiles(ByRef $files)
	Local $swaps
	Do
		$swaps=0
		For $i=0 To UBound($files)-2
			Local $j=$i+1
			Local $filea=FileRead($files[$i])
			Local $fileb=FileRead($files[$j])
			Local $pa=10
			Local $pb=10
			If StringInStr($filea,"@P1@") Then $pa=1;I know this is horrible
			If StringInStr($filea,"@P2@") Then $pa=2
			If StringInStr($filea,"@P3@") Then $pa=3
			If StringInStr($fileb,"@P1@") Then $pb=1
			If StringInStr($fileb,"@P2@") Then $pb=2
			If StringInStr($fileb,"@P3@") Then $pb=3

			ConsoleWrite($files[$i]&' '&$pa&' < '&$pb&' '&$files[$j]&@CRLF)
			If $pb<$pa Then;swap
				$tmp=$files[$i]
				$files[$i]=$files[$j]
				$files[$j]=$tmp
				$swaps+=1
			EndIf

		Next
	Until $swaps=0
EndFunc

#cs

$source_single=""
	$source=FileRead($file)
	$source_single&=$source&@CRLF


FileDelete("jxlate_single.js")
FileWrite("jxlate_single.js",$source_single)

#ce