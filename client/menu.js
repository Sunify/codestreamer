Template.menu.events({
	'click .theme-switcher': function(evt) {
		var theme = Session.get('theme');
		Session.set('theme', (theme==='light')?'dark':'light');
		Template.editor.theme();
	},
	'click .dropdown-menu a': function(evt) {
		var link = $(evt.currentTarget);
		Streams.update(
			Session.get('currStream'),
			{
				$set: {
					lang: link.data('mode')
				}
			}
		);
	}
});

Template.menu.currLang = function() {
	return Session.get('lang');
}

Template.menu.currLangTitle = function() {
	return Template.menu.langs()[Template.menu.currLang()];
}

Template.menu.langs = function() {
	return {
		'javascript': 'JavaScript',
		'coffee': 'CoffeeScript',
		'html': 'HTML',
		'css': 'CSS',
		'scss': 'SCSS',
		'sass': 'SASS',
		'stylus': 'Stylus',
		'php': 'PHP',
		'ruby': 'Ruby'
	};
}

Handlebars.registerHelper('activeClass', function(v1, v2) {
	return v1 === v2?'active':'';
});

Handlebars.registerHelper('eachProp', function(context, options) {
	var ret = '', prop;

	for(prop in context) {
		ret = ret + options.fn({
			property: prop,
			value: context[prop]
		});
	}

	return ret;
});