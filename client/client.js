var router, cm;
var app = {};

AppRouter = Backbone.Router.extend({
	routes: {
		'': 'main',
		':id': 'open'
	},

	main: function() {
		Session.set('currStream', null);
		var id = Streams.insert({
			Deltas: []
		});
		this.setStream(id);
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

Template.menu.events({
	'click .theme-switcher': function(evt) {
		var theme = Session.get('theme');
		Session.set('theme', (theme==='light')?'dark':'light');
		Template.editor.theme();
	}
});

Template.editor.stream = function() {
  	var streamId = Session.get("currStream");
  	return Streams.findOne({_id: streamId});
};

Template.editor.theme = function() {
	if(app.editor === undefined) return;

	var ace_theme, navbar_class, switch_class;
	var theme = Session.get('theme');
	var body_class = 'st-' + theme;

	var set_st_class = function(node, st_class) {
		node
			.removeClass('st-light')
			.removeClass('st-dark')
			.addClass(st_class);
	}

	switch(theme) {

		case 'light':
			ace_theme = 'ace/theme/tomorrow';
			navbar_class = 'navbar-default';
			break;

		default:
			ace_theme = 'ace/theme/twilight';
			navbar_class = 'navbar-inverse';
			break;

	}

	app.editor.ace.setTheme(ace_theme);
	set_st_class($('body'), body_class);
	$('.navbar')
		.removeClass('navbar-inverse')
		.removeClass('navbar-default')
		.addClass(navbar_class);

	return '';
}

Template.editor.rendered = function() {
	Session.setDefault('theme', 'dark');

	app.editor = {};

	app.editor.ace = ace.edit('editor');
	app.editor.ace.getSession().setMode("ace/mode/javascript");
	app.editor.ace.renderer.setPadding(10);

	Template.editor.theme();

	//Todo: сохранять в localStorage, и сделать возможность лока редактирования для чужих
	app.editor.local_uid = (((1+Math.random())*0x10000)|0).toString(16).slice(1);

	app.editor.updating = false;
	app.editor.first_upd = true;
	app.editor.currentDelta = 0;

	app.editor.update = function(deltas) {
		if(deltas === undefined){ return false; }

	    var deltaLength = deltas.length;
	    var pendDeltas = [];

	    for(var i = app.editor.currentDelta; i < deltaLength; ++i) {
	      	if(app.editor.first_upd || deltas[i].sender_uid !== app.editor.local_uid) {
	        	pendDeltas.push(deltas[i].delta);
	      	}
	    }

	    if(pendDeltas.length > 0) {
	      	app.editor.updating = true;
	      	app.editor.ace.getSession().getDocument().applyDeltas(pendDeltas);
	    }

	    app.editor.currentDelta = deltaLength;
	    app.editor.updating = false;
	    app.editor.first_upd = false;
	}

	var stream;
	setTimeout( function(){
		stream = new Template.editor.stream();
		app.editor.update(stream.Deltas);
	}, 1000);

	app.editor.ace.getSession().getDocument().on('change', function(evt) {
		if(!app.editor.updating) {
			Streams.update(
				Session.get('currStream'),
				{
					$push: {
						Deltas: {delta: evt.data, sender_uid: app.editor.local_uid}
					}
				}
			);
		}
	});

	setTimeout(function() {
		var q = Streams.find({_id: Session.get('currStream')});
		q.observe({
			changed: function(newDoc, oldIndex, oldDoc) {
				app.editor.update(newDoc.Deltas);
			}
		});
	}, 200);
}

Meteor.startup(function() {
	app.router = new AppRouter();
	Backbone.history.start({pushState: true})
});