

$(document).ready () ->
	CodeMirror.fromTextArea(
		document.getElementById('editor'),
		mode: 'javascript'
		theme: 'twilight'
		indentUnit: 2
		indentWithTabs: true
		lineNumbers: true
	)