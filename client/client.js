var currUTCTime, router, cm;

AppRouter = Backbone.Router.extend({
	routes: {
		'': 'main',
		':id': 'open'
	},

	main: function() {
		Session.set('currStream', null);
		console.log('main action');
	},

	open: function(id) {
		Session.set('currStream', id);
	},

	setStream: function(id) {
		this.navigate(
			id,
			{
				trigger: true
			}
		);
	}
});

currUTCTime = function() {
	var d = new Date();
	return d.getTime() - d.getTimezoneOffset() * 60;
}

$(document).ready(function() {

	// cm = CodeMirror.fromTextArea(
	// 	document.getElementById('editor'),
	// 	{
	// 		mode: 'javascript',
	// 		content: '',
	// 		indentUnit: 2,
	// 		indentWithTabs: true,
	// 		lineNumbers: true
	// 	}
	// );

	// cm.on('change', function(cm, changeObj) {
	// 	var cur, id;
	// 	if (changeObj.origin != "setValue") {
	// 		cur = cm.doc.getCursor();
	// 		id = Session.get('currStream');
	// 		if (!id) {
	// 			Meteor.call(
	// 				'addStream',
	// 				cm.getValue(),
	// 				currUTCTime(),
	// 				function(err, res) {
	// 					console.log(err);
	// 					router.setStream(res);
	// 				}
	// 			);
	// 		} else {
	// 			Versions.insert({
	// 				stream_id: id,
	// 				code: cm.getValue(),
	// 				time: currUTCTime()	
	// 			});
	// 			Meteor.call('updateStreamCode', id);
	// 		}
	// 	}
	// });

});


Template.editor.code = function() {
	var stream, pos, newpos;

	stream = Streams.findOne({_id: Session.get('currStream')});
	if(stream && stream.cache) {
		// pos = cm.doc.getCursor();
		// cm.setValue(stream.cache);
		// cm.doc.setCursor(pos);
	}
}

Template.editor.theme = function() {
	var theme;

	// if(cm) {
	// 	theme = (Session.get('theme') === 'dark')?'twilight':'default';
	// 	cm.setOption('theme', theme);
	// }
}

Template.header.dark = function() {
	return (Session.get('theme') == 'dark')?true:false;
}

Template.menu.dark = Template.header.dark;

Template.menu.events({
	'click .theme-switcher': function(evt) {
		var switcher;

		evt.preventDefault();
		switcher = $(evt.currentTarget);
		
		if (switcher.hasClass('st-light')) {
			theme = 'light';
		} else {
			theme = 'dark';
		}

		Session.set('theme', theme);
	}
});

Meteor.startup(function() {
	Session.setDefault('theme', 'dark');
	router = new AppRouter();
	Backbone.history.start({pushState: true})

});