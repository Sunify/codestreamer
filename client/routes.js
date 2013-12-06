AppRouter = Backbone.Router.extend({
	routes: {
		'': 'main',
		':id': 'open'
	},

	main: function() {
		Session.set('currStream', null);
		var id = Streams.insert({
			Deltas: [],
			lang: 'javascript'
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