var currUTCTime, router, cm;
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

Template.editor.stream = function() {
  	var streamId = Session.get("currStream");
  	return Streams.findOne({_id: streamId});
};

Template.editor.rendered = function() {
	app.editor = {};
	app.editor.ace = ace.edit('editor');
	app.editor.ace.setTheme('ace/theme/twilight');
	app.editor.ace.getSession().setMode("ace/mode/javascript");
	app.editor.local_uid = (((1+Math.random())*0x10000)|0).toString(16).slice(1);
	app.editor.updating = false;
	app.editor.currentDelta = 0;

	app.editor.update = function(deltas) {
		if(deltas === undefined){ return false; }

	    var deltaLength = deltas.length;
	    var pendDeltas = [];

	    for(var i = app.editor.currentDelta; i < deltaLength; ++i) {
	      	if(deltas[i].sender_uid !== app.editor.local_uid) {
	        	pendDeltas.push(deltas[i].delta);
	      	}
	    }

	    if(pendDeltas.length > 0) {
	      	app.editor.updating = true;
	      	app.editor.ace.getSession().getDocument().applyDeltas(pendDeltas);
	    }

	    app.editor.currentDelta = deltaLength;
	    app.editor.updating = false;
	}

	var stream;
	setTimeout( function(){
		stream = new Template.editor.stream();
		app.editor.update(stream.Deltas);
	}, 200);

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
	Session.setDefault('theme', 'dark');
	router = new AppRouter();
	Backbone.history.start({pushState: true})
});