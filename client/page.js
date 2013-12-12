Template.page.showPreview = function() {
	return true;
}

Template.preview.codePreview = function() {
	var code = Session.get('code');
	code = code || "<html><head></head><body></body></html>";

	return escape(code);
}