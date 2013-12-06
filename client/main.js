app = {};

Meteor.startup(function() {
	app.router = new AppRouter();
	Backbone.history.start({pushState: true})
});